(function () {
  "use strict";

  const RANGE_DAYS = {
    "30": 30,
    "90": 90,
    all: null
  };
  const OUTCOMES = ["win", "loss", "break-even"];
  const SESSION_LABELS = {
    asia: "Asia",
    london: "London",
    "new-york": "New York",
    auto: "Not set"
  };
  const SETUP_LABELS = {
    reversal: "Reversal",
    continuation: "Continuation"
  };
  const SVG_NS = "http://www.w3.org/2000/svg";

  function average(values) {
    if (!values.length) return null;
    return values.reduce((total, value) => total + value, 0) / values.length;
  }

  function getRealizedRr(item) {
    const value = item &&
      item.journal &&
      item.journal.closeReview ?
      item.journal.closeReview.realizedRr : null;
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function getClosedRecords(records, range, now) {
    const source = Array.isArray(records) ? records : [];
    const days = Object.prototype.hasOwnProperty.call(RANGE_DAYS, range) ?
      RANGE_DAYS[range] : null;
    const currentTime = now instanceof Date ? now.getTime() :
      Number.isFinite(Number(now)) ? Number(now) : Date.now();
    const cutoff = days === null ? null : currentTime - days * 24 * 60 * 60 * 1000;

    return source.filter(function (item) {
      if (!item || !item.lifecycle || item.lifecycle.status !== "closed") return false;
      if (cutoff === null) return true;
      const closedAt = Date.parse(item.lifecycle.closedAt);
      return Number.isFinite(closedAt) && closedAt >= cutoff && closedAt <= currentTime;
    });
  }

  function getHoldingTime(item) {
    if (!item || !item.lifecycle) return null;
    const openedAt = Date.parse(item.lifecycle.openedAt);
    const closedAt = Date.parse(item.lifecycle.closedAt);
    if (!Number.isFinite(openedAt) || !Number.isFinite(closedAt) || closedAt < openedAt) {
      return null;
    }
    return closedAt - openedAt;
  }

  function summarize(records) {
    const source = Array.isArray(records) ? records : [];
    const outcomeCounts = {
      win: 0,
      loss: 0,
      "break-even": 0
    };
    const rrValues = [];
    const positiveR = [];
    const negativeR = [];
    const holdingTimes = [];

    source.forEach(function (item) {
      const outcome = item && item.lifecycle ? item.lifecycle.outcome : null;
      if (OUTCOMES.includes(outcome)) outcomeCounts[outcome] += 1;

      const realizedRr = getRealizedRr(item);
      if (realizedRr !== null) {
        rrValues.push(realizedRr);
        if (realizedRr > 0) positiveR.push(realizedRr);
        if (realizedRr < 0) negativeR.push(Math.abs(realizedRr));
      }

      const holdingTime = getHoldingTime(item);
      if (holdingTime !== null) holdingTimes.push(holdingTime);
    });

    const decisiveTrades = outcomeCounts.win + outcomeCounts.loss;
    const averageWinR = average(positiveR);
    const averageLossR = average(negativeR);
    const netR = rrValues.reduce((total, value) => total + value, 0);

    return {
      total: source.length,
      outcomes: outcomeCounts,
      decisiveTrades,
      winRate: decisiveTrades ?
        (outcomeCounts.win / decisiveTrades) * 100 : null,
      rrCount: rrValues.length,
      rrCoverage: source.length ? (rrValues.length / source.length) * 100 : 0,
      averageRr: averageWinR !== null && averageLossR !== null && averageLossR > 0 ?
        averageWinR / averageLossR : null,
      expectancy: average(rrValues),
      netR,
      averageHoldMs: average(holdingTimes)
    };
  }

  function buildEquityCurve(records) {
    const sorted = [...(Array.isArray(records) ? records : [])]
      .filter((item) =>
        getRealizedRr(item) !== null &&
        item.lifecycle &&
        Number.isFinite(Date.parse(item.lifecycle.closedAt))
      )
      .sort(function (left, right) {
        return Date.parse(left.lifecycle.closedAt) - Date.parse(right.lifecycle.closedAt);
      });
    let cumulative = 0;
    return sorted.map(function (item, index) {
      cumulative += getRealizedRr(item);
      return {
        index,
        closedAt: item.lifecycle.closedAt,
        realizedRr: getRealizedRr(item),
        cumulative: Math.round(cumulative * 100) / 100
      };
    });
  }

  function groupPerformance(records, field, labels) {
    const groups = new Map();
    (Array.isArray(records) ? records : []).forEach(function (item) {
      const rawValue = item && item[field] ? item[field] : "unknown";
      if (!groups.has(rawValue)) groups.set(rawValue, []);
      groups.get(rawValue).push(item);
    });

    return [...groups.entries()]
      .map(function (entry) {
        return {
          key: entry[0],
          label: labels[entry[0]] || "Not set",
          summary: summarize(entry[1])
        };
      })
      .sort(function (left, right) {
        return right.summary.total - left.summary.total ||
          left.label.localeCompare(right.label);
      });
  }

  function formatPercent(value) {
    return value === null ? "--" : `${Math.round(value)}%`;
  }

  function formatR(value, includePlus) {
    if (value === null || !Number.isFinite(value)) return "--";
    const prefix = includePlus && value > 0 ? "+" : "";
    return `${prefix}${value.toFixed(2)}R`;
  }

  function formatHold(ms) {
    if (ms === null || !Number.isFinite(ms)) return "--";
    const minutes = Math.max(Math.round(ms / 60000), 0);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours < 24) return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours ? `${days}d ${remainingHours}h` : `${days}d`;
  }

  function createSvgElement(name, attributes) {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attributes || {}).forEach(function (entry) {
      element.setAttribute(entry[0], String(entry[1]));
    });
    return element;
  }

  function renderEquityChart(container, points) {
    container.replaceChildren();
    if (!points.length) {
      const empty = document.createElement("div");
      empty.className = "chart-empty";
      empty.textContent = "กรอก Actual Exit ใน Journal เพื่อสร้าง Equity Curve";
      container.appendChild(empty);
      return;
    }

    const width = 760;
    const height = 280;
    const padding = { top: 20, right: 22, bottom: 38, left: 54 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const values = [0, ...points.map((point) => point.cumulative)];
    let minValue = Math.min(...values);
    let maxValue = Math.max(...values);
    if (minValue === maxValue) {
      minValue -= 1;
      maxValue += 1;
    } else {
      const buffer = Math.max((maxValue - minValue) * 0.12, 0.25);
      minValue -= buffer;
      maxValue += buffer;
    }

    const chartPoints = [
      { cumulative: 0, closedAt: points[0].closedAt },
      ...points
    ];
    const xFor = function (index) {
      return padding.left +
        (chartPoints.length === 1 ? plotWidth / 2 : (index / (chartPoints.length - 1)) * plotWidth);
    };
    const yFor = function (value) {
      return padding.top + ((maxValue - value) / (maxValue - minValue)) * plotHeight;
    };

    const svg = createSvgElement("svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": `Equity Curve ปัจจุบัน ${formatR(points[points.length - 1].cumulative, true)}`
    });
    const title = createSvgElement("title");
    title.textContent = "Cumulative Realized R";
    svg.appendChild(title);

    for (let index = 0; index < 5; index += 1) {
      const ratio = index / 4;
      const value = maxValue - ratio * (maxValue - minValue);
      const y = padding.top + ratio * plotHeight;
      svg.appendChild(createSvgElement("line", {
        class: "chart-grid-line",
        x1: padding.left,
        y1: y,
        x2: width - padding.right,
        y2: y
      }));
      const label = createSvgElement("text", {
        class: "chart-axis-label",
        x: padding.left - 10,
        y: y + 4,
        "text-anchor": "end"
      });
      label.textContent = `${value.toFixed(1)}R`;
      svg.appendChild(label);
    }

    const linePath = chartPoints.map(function (point, index) {
      return `${index ? "L" : "M"} ${xFor(index).toFixed(2)} ${yFor(point.cumulative).toFixed(2)}`;
    }).join(" ");
    const areaPath = `${linePath} L ${xFor(chartPoints.length - 1).toFixed(2)} ` +
      `${(height - padding.bottom).toFixed(2)} L ${xFor(0).toFixed(2)} ` +
      `${(height - padding.bottom).toFixed(2)} Z`;
    svg.appendChild(createSvgElement("path", {
      class: "chart-area",
      d: areaPath
    }));
    svg.appendChild(createSvgElement("path", {
      class: "chart-line",
      d: linePath
    }));

    const lastPoint = chartPoints[chartPoints.length - 1];
    svg.appendChild(createSvgElement("circle", {
      class: "chart-last-point",
      cx: xFor(chartPoints.length - 1),
      cy: yFor(lastPoint.cumulative),
      r: 4
    }));

    const dateFormatter = new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short"
    });
    const startLabel = createSvgElement("text", {
      class: "chart-axis-label",
      x: padding.left,
      y: height - 10,
      "text-anchor": "start"
    });
    startLabel.textContent = dateFormatter.format(new Date(points[0].closedAt));
    svg.appendChild(startLabel);

    const endLabel = createSvgElement("text", {
      class: "chart-axis-label",
      x: width - padding.right,
      y: height - 10,
      "text-anchor": "end"
    });
    endLabel.textContent = dateFormatter.format(new Date(points[points.length - 1].closedAt));
    svg.appendChild(endLabel);
    container.appendChild(svg);
  }

  function renderDistribution(container, summary) {
    container.replaceChildren();
    const rows = [
      { key: "win", label: "Win" },
      { key: "loss", label: "Loss" },
      { key: "break-even", label: "Break Even" }
    ];
    const knownTotal = rows.reduce(function (total, row) {
      return total + summary.outcomes[row.key];
    }, 0);

    rows.forEach(function (row) {
      const count = summary.outcomes[row.key];
      const item = document.createElement("div");
      item.className = "distribution-row";

      const heading = document.createElement("div");
      heading.className = "distribution-copy";
      const label = document.createElement("span");
      label.textContent = row.label;
      const value = document.createElement("strong");
      value.textContent = String(count);
      heading.append(label, value);

      const track = document.createElement("div");
      track.className = "distribution-track";
      const bar = document.createElement("span");
      bar.className = `distribution-bar distribution-${row.key}`;
      bar.style.width = knownTotal ? `${(count / knownTotal) * 100}%` : "0%";
      track.appendChild(bar);
      item.append(heading, track);
      container.appendChild(item);
    });
  }

  function renderPerformanceTable(container, rows) {
    container.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement("div");
      empty.className = "table-empty";
      empty.textContent = "ยังไม่มี Closed Trade ในช่วงเวลานี้";
      container.appendChild(empty);
      return;
    }

    const table = document.createElement("table");
    table.className = "performance-table";
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["กลุ่ม", "Trades", "Win rate", "Net R", "R data"].forEach(function (text) {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.textContent = text;
      headRow.appendChild(cell);
    });
    head.appendChild(headRow);

    const body = document.createElement("tbody");
    rows.forEach(function (row) {
      const tableRow = document.createElement("tr");
      const values = [
        row.label,
        String(row.summary.total),
        formatPercent(row.summary.winRate),
        formatR(row.summary.rrCount ? row.summary.netR : null, true),
        `${row.summary.rrCount}/${row.summary.total}`
      ];
      values.forEach(function (text, index) {
        const cell = document.createElement(index === 0 ? "th" : "td");
        if (index === 0) cell.scope = "row";
        cell.textContent = text;
        if (index === 3 && row.summary.rrCount) {
          cell.dataset.result = row.summary.netR > 0 ? "positive" :
            row.summary.netR < 0 ? "negative" : "neutral";
        }
        tableRow.appendChild(cell);
      });
      body.appendChild(tableRow);
    });
    table.append(head, body);
    container.appendChild(table);
  }

  function renderStatus(summary) {
    const status = document.getElementById("dataStatus");
    const copy = document.getElementById("dataStatusText");
    if (!summary.total) {
      status.dataset.state = "waiting";
      copy.textContent = "ยังไม่มี Closed Trade ในช่วงเวลานี้";
    } else if (!summary.rrCount) {
      status.dataset.state = "developing";
      copy.textContent = `มี ${summary.total} Closed Trade แต่ยังไม่มี Actual Exit สำหรับคำนวณค่า R`;
    } else if (summary.rrCount < summary.total) {
      status.dataset.state = "developing";
      copy.textContent = `มีข้อมูล Realized R ${summary.rrCount} จาก ${summary.total} Closed Trade`;
    } else {
      status.dataset.state = "ready";
      copy.textContent = `ข้อมูล Realized R ครบ ${summary.rrCount} Closed Trade`;
    }
  }

  function renderSummary(summary) {
    document.getElementById("closedTrades").textContent = String(summary.total);
    document.getElementById("winRate").textContent = formatPercent(summary.winRate);
    document.getElementById("winRateNote").textContent = summary.decisiveTrades ?
      `${summary.outcomes.win} Win · ${summary.outcomes.loss} Loss` :
      "ไม่นับ Break Even";
    document.getElementById("averageRr").textContent = summary.averageRr === null ?
      "--" : `${summary.averageRr.toFixed(2)} : 1`;
    document.getElementById("expectancy").textContent =
      formatR(summary.expectancy, true);
    document.getElementById("averageHold").textContent =
      formatHold(summary.averageHoldMs);
    document.getElementById("rrCoverage").textContent =
      `${Math.round(summary.rrCoverage)}%`;
    document.getElementById("rrCoverageNote").textContent = summary.total ?
      `${summary.rrCount} จาก ${summary.total} Trade` : "ยังไม่มี Actual Exit";
    document.getElementById("netR").textContent =
      formatR(summary.rrCount ? summary.netR : null, true);
    document.getElementById("netR").dataset.result = !summary.rrCount ? "neutral" :
      summary.netR > 0 ? "positive" : summary.netR < 0 ? "negative" : "neutral";
  }

  function initializePage() {
    let selectedRange = "all";

    function render() {
      const history = window.TradingStorage.loadJournalTrades();
      const records = getClosedRecords(history, selectedRange);
      const summary = summarize(records);
      const points = buildEquityCurve(records);

      renderStatus(summary);
      renderSummary(summary);
      renderEquityChart(document.getElementById("equityChart"), points);
      document.getElementById("equityFootnote").textContent = summary.rrCount ?
        `${summary.rrCount} Trade พร้อม Actual Exit · ${formatR(summary.netR, true)} สุทธิ` :
        "ต้องมี Actual Exit อย่างน้อย 1 รายการ";
      renderDistribution(document.getElementById("distributionList"), summary);
      renderPerformanceTable(
        document.getElementById("sessionPerformance"),
        groupPerformance(records, "session", SESSION_LABELS)
      );
      renderPerformanceTable(
        document.getElementById("setupPerformance"),
        groupPerformance(records, "setupType", SETUP_LABELS)
      );

      const hasRecords = summary.total > 0;
      document.getElementById("statsDetails").hidden = !hasRecords;
      document.getElementById("statsEmpty").hidden = hasRecords;
    }

    document.querySelectorAll("[data-range]").forEach(function (button) {
      button.addEventListener("click", function () {
        selectedRange = button.dataset.range;
        document.querySelectorAll("[data-range]").forEach(function (candidate) {
          candidate.setAttribute("aria-pressed", String(candidate === button));
        });
        render();
      });
    });
    window.addEventListener("storage", render);
    render();
  }

  window.TradingStats = {
    RANGE_DAYS,
    getRealizedRr,
    getClosedRecords,
    getHoldingTime,
    summarize,
    buildEquityCurve,
    groupPerformance,
    formatPercent,
    formatR,
    formatHold
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initializePage);
  }
})();
