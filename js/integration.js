(function () {
  "use strict";

  const RANGE_DAYS = {
    "30": 30,
    "90": 90
  };

  const SYMBOLS = {
    XAUUSD: "OANDA:XAUUSD",
    BTCUSD: "COINBASE:BTCUSD",
    ETHUSD: "COINBASE:ETHUSD",
    NAS100: "OANDA:NAS100USD",
    EURUSD: "OANDA:EURUSD"
  };
  const ALERT_SCHEMA = "trading-companion.alert.v1";
  const ALERT_STATES = ["no-trade", "waiting", "developing", "risk-review", "ready"];
  const ALERT_NARRATIVES = ["bullish", "bearish", "neutral"];
  const ALERT_MODES = ["manual", "automatic"];
  const ALERT_GRADES = ["A+", "A", "B", "C", "D", "--", "NO TRADE"];
  const ALERT_CHECKLIST = [
    ["htf", 20],
    ["poi", 15],
    ["liquidity", 15],
    ["structure", 15],
    ["cisd", 15],
    ["displacement", 10],
    ["entryFvg", 5],
    ["risk", 5]
  ];
  const ALERT_EXAMPLE = {
    schema: ALERT_SCHEMA,
    source: "tradingview",
    indicator: "trading-os",
    indicatorVersion: "0.14.0",
    event: "ENTRY FVG RETRACE BULL",
    symbol: "FOREXCOM:XAUUSD",
    ticker: "XAUUSD",
    timeframe: "15",
    time: 1785240000000,
    mode: "manual",
    narrative: "bullish",
    state: "developing",
    score: 90,
    grade: "A+",
    blocked: false,
    checklist: {
      htf: true,
      poi: true,
      liquidity: true,
      structure: true,
      cisd: true,
      displacement: true,
      entryFvg: false,
      risk: false
    },
    risk: {
      entry: null,
      stop: null,
      target: null,
      rr: null
    },
    close: 4025.5
  };

  function getTradeDate(trade) {
    const value = trade && trade.lifecycle && trade.lifecycle.openedAt ||
      trade && trade.savedAt ||
      trade && trade.createdAt;
    const timestamp = Date.parse(value || "");
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  function optionalNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function alertString(value, maxLength) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
  }

  function parseIndicatorAlert(value) {
    let source = value;
    if (typeof value === "string") {
      try {
        source = JSON.parse(value);
      } catch (error) {
        throw new Error("JSON ไม่ถูกต้อง ตรวจว่าคัดลอกข้อความ Alert มาครบ");
      }
    }
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      throw new Error("ข้อมูล Alert ต้องเป็น JSON object");
    }
    if (source.schema !== ALERT_SCHEMA) {
      throw new Error(`รองรับเฉพาะ schema ${ALERT_SCHEMA}`);
    }
    if (source.source !== "tradingview" || source.indicator !== "trading-os") {
      throw new Error("ข้อมูลนี้ไม่ได้มาจาก Trading OS บน TradingView");
    }

    const mode = alertString(source.mode, 20).toLowerCase();
    const narrative = alertString(source.narrative, 20).toLowerCase();
    const state = alertString(source.state, 30).toLowerCase();
    const grade = alertString(source.grade, 12).toUpperCase();
    const score = Number(source.score);
    const symbol = alertString(source.symbol, 80).toUpperCase();
    const ticker = alertString(source.ticker, 40).toUpperCase();
    const timeframe = alertString(source.timeframe, 12);
    const checklistSource = source.checklist && typeof source.checklist === "object" ?
      source.checklist : {};
    const riskSource = source.risk && typeof source.risk === "object" ?
      source.risk : {};
    const checklist = {};

    if (!ALERT_MODES.includes(mode)) throw new Error("Assessment mode ไม่ถูกต้อง");
    if (!ALERT_NARRATIVES.includes(narrative)) throw new Error("Narrative ไม่ถูกต้อง");
    if (!ALERT_STATES.includes(state)) throw new Error("Setup State ไม่ถูกต้อง");
    if (!ALERT_GRADES.includes(grade)) throw new Error("Grade ไม่ถูกต้อง");
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      throw new Error("Score ต้องอยู่ระหว่าง 0 ถึง 100");
    }
    if (!symbol || !ticker || !timeframe) {
      throw new Error("Alert ต้องมี Symbol, Ticker และ Timeframe");
    }

    ALERT_CHECKLIST.forEach(function ([key]) {
      if (typeof checklistSource[key] !== "boolean") {
        throw new Error(`Checklist ${key} ต้องเป็น true หรือ false`);
      }
      checklist[key] = checklistSource[key];
    });

    const blocked = source.blocked === true;
    const normalizedScore = Math.round(score);
    if (mode === "manual") {
      const expectedScore = blocked ? 0 : ALERT_CHECKLIST.reduce(function (total, item) {
        return total + (checklist[item[0]] ? item[1] : 0);
      }, 0);
      if (expectedScore !== normalizedScore) {
        throw new Error(`Manual Score ไม่ตรงกับ Checklist: ควรเป็น ${expectedScore}`);
      }
    }

    const time = Number(source.time);
    if (!Number.isFinite(time) || time <= 0) {
      throw new Error("Alert time ไม่ถูกต้อง");
    }
    const occurredAt = new Date(time).toISOString();
    const normalized = {
      schema: ALERT_SCHEMA,
      source: "tradingview",
      indicator: "trading-os",
      indicatorVersion: alertString(source.indicatorVersion, 30),
      event: alertString(source.event, 400) || "TRADING OS SNAPSHOT",
      symbol,
      ticker,
      timeframe,
      time,
      occurredAt,
      mode,
      narrative,
      state,
      score: normalizedScore,
      grade,
      blocked,
      checklist,
      risk: {
        entry: optionalNumber(riskSource.entry),
        stop: optionalNumber(riskSource.stop),
        target: optionalNumber(riskSource.target),
        rr: optionalNumber(riskSource.rr)
      },
      close: optionalNumber(source.close)
    };
    return normalized;
  }

  function instrumentFromAlert(alert) {
    const value = `${alert && alert.ticker || ""} ${alert && alert.symbol || ""}`.toUpperCase();
    if (value.includes("XAUUSD")) return "XAUUSD";
    if (value.includes("BTCUSD")) return "BTCUSD";
    if (value.includes("ETHUSD")) return "ETHUSD";
    if (value.includes("NAS100") || value.includes("NASDAQ")) return "NAS100";
    if (value.includes("EURUSD")) return "EURUSD";
    return "";
  }

  function buildDraftFromAlert(alert, storage) {
    const draft = storage.createDraft();
    const checklist = alert.checklist || {};
    const answers = {};
    function setYes(condition, keys) {
      if (!condition) return;
      keys.forEach(function (key) {
        answers[key] = "yes";
      });
    }

    setYes(checklist.htf, ["htfNarrative"]);
    setYes(checklist.poi, ["poiPresent"]);
    setYes(checklist.liquidity, ["liquidityTarget", "sweep"]);
    setYes(checklist.structure, ["ltfMapped", "structureShift"]);
    setYes(checklist.cisd, ["cisd"]);
    setYes(checklist.displacement, ["displacement"]);
    setYes(checklist.entryFvg, ["validFvg", "retrace"]);
    setYes(checklist.risk, ["rrValid"]);

    const risk = alert.risk || {};
    return {
      ...draft,
      instrument: instrumentFromAlert(alert),
      direction: ALERT_NARRATIVES.includes(alert.narrative) ? alert.narrative : "",
      answers,
      tradePlan: {
        entry: risk.entry === null ? "" : String(risk.entry),
        stopLoss: risk.stop === null ? "" : String(risk.stop),
        takeProfit: risk.target === null ? "" : String(risk.target)
      },
      notes: [
        `TradingView ${alert.symbol} · ${alert.timeframe}`,
        `Event: ${alert.event}`,
        `Indicator ${alert.indicatorVersion || "--"} · ${alert.mode} · ${alert.state}`,
        `Source Score ${alert.score}/100 · Grade ${alert.grade}`
      ].join("\n"),
      indicatorImport: alert
    };
  }

  function formatAlertTime(alert) {
    const value = alert && (alert.occurredAt || alert.importedAt);
    const date = new Date(value || "");
    if (Number.isNaN(date.getTime())) return "--";
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Bangkok"
    }).format(date);
  }

  function timeframeLabel(value) {
    const labels = {
      "1": "1M",
      "5": "5M",
      "15": "15M",
      "60": "1H",
      "240": "4H",
      D: "1D"
    };
    return labels[String(value || "")] || String(value || "--");
  }

  function filterTradesByRange(trades, range, now) {
    const records = Array.isArray(trades) ? trades : [];
    const days = RANGE_DAYS[String(range || "all")];
    if (!days) return records.slice();
    const reference = now instanceof Date ? now.getTime() : Date.now();
    const cutoff = reference - days * 24 * 60 * 60 * 1000;
    return records.filter(function (trade) {
      const timestamp = getTradeDate(trade);
      return timestamp !== null && timestamp >= cutoff && timestamp <= reference;
    });
  }

  function getJournal(trade) {
    if (
      typeof window !== "undefined" &&
      window.TradingStorage &&
      typeof window.TradingStorage.normalizeJournal === "function"
    ) {
      return window.TradingStorage.normalizeJournal(trade && trade.journal);
    }
    const source = trade && trade.journal && typeof trade.journal === "object" ?
      trade.journal : {};
    return {
      emotion: source.emotion || "",
      mistakes: Array.isArray(source.mistakes) ? source.mistakes : [],
      lesson: source.lesson || "",
      tradingViewUrl: source.tradingViewUrl || "",
      screenshot: source.screenshot || null,
      closeReview: source.closeReview || {}
    };
  }

  function summarizeTrades(trades) {
    const records = Array.isArray(trades) ? trades : [];
    let closed = 0;
    let wins = 0;
    let losses = 0;
    let links = 0;
    let screenshots = 0;
    let realizedCount = 0;
    let netR = 0;

    records.forEach(function (trade) {
      const lifecycle = trade.lifecycle || {};
      const journal = getJournal(trade);
      const realizedRr = optionalNumber(
        journal.closeReview && journal.closeReview.realizedRr
      );
      if (lifecycle.status === "closed") closed += 1;
      if (lifecycle.outcome === "win") wins += 1;
      if (lifecycle.outcome === "loss") losses += 1;
      if (journal.tradingViewUrl) links += 1;
      if (journal.screenshot) screenshots += 1;
      if (realizedRr !== null) {
        realizedCount += 1;
        netR += realizedRr;
      }
    });

    return {
      total: records.length,
      closed,
      winRate: wins + losses ? Math.round((wins / (wins + losses)) * 100) : null,
      links,
      screenshots,
      realizedCount,
      netR: Math.round(netR * 100) / 100
    };
  }

  function buildTradingViewUrl(symbol, interval) {
    const cleanSymbol = String(symbol || "").trim().toUpperCase().slice(0, 80);
    const cleanInterval = String(interval || "60").trim().slice(0, 10);
    const parameters = new URLSearchParams();
    if (cleanSymbol) parameters.set("symbol", cleanSymbol);
    if (cleanInterval) parameters.set("interval", cleanInterval);
    return `https://www.tradingview.com/chart/?${parameters.toString()}`;
  }

  function protectSpreadsheetText(value) {
    const text = String(value === null || value === undefined ? "" : value);
    return /^[=+\-@]/.test(text.trimStart()) ? `'${text}` : text;
  }

  function csvCell(value) {
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    const safe = protectSpreadsheetText(value).replace(/"/g, '""');
    return `"${safe}"`;
  }

  function buildCsv(trades) {
    const headers = [
      "Opened At",
      "Pair",
      "Direction",
      "Setup",
      "Session",
      "Grade",
      "Score",
      "Status",
      "Outcome",
      "Entry",
      "Stop Loss",
      "Take Profit",
      "Planned RR",
      "Actual Exit",
      "Realized R",
      "Emotion",
      "Mistakes",
      "Lesson",
      "TradingView URL",
      "Screenshot",
      "Trade Notes"
    ];

    const rows = (Array.isArray(trades) ? trades : []).map(function (trade) {
      const lifecycle = trade.lifecycle || {};
      const plan = trade.tradePlan || {};
      const journal = getJournal(trade);
      const closeReview = journal.closeReview || {};
      const realizedRr = optionalNumber(closeReview.realizedRr);
      const score = optionalNumber(trade.result && trade.result.score);
      const plannedRr = optionalNumber(plan.plannedRr);
      return [
        lifecycle.openedAt || trade.savedAt || trade.createdAt || "",
        trade.instrument || "",
        trade.direction || "",
        trade.setupType || "",
        trade.session || "",
        trade.result && trade.result.grade || "",
        score === null ? "" : score,
        lifecycle.status || "",
        lifecycle.outcome || "",
        plan.entry || "",
        plan.stopLoss || "",
        plan.takeProfit || "",
        plannedRr === null ? "" : plannedRr,
        closeReview.actualExit || "",
        realizedRr === null ? "" : realizedRr,
        journal.emotion || "",
        (journal.mistakes || []).join(" | "),
        journal.lesson || "",
        journal.tradingViewUrl || "",
        journal.screenshot ? "attached" : "",
        trade.notes || ""
      ].map(csvCell).join(",");
    });

    return `\uFEFF${[headers.map(csvCell).join(","), ...rows].join("\r\n")}`;
  }

  function downloadTextFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 0);
  }

  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    if (!copied) throw new Error("copy failed");
  }

  function initializePage() {
    const root = document.getElementById("tradingViewHub");
    if (!root) return;

    const storage = window.TradingStorage;
    const elements = {
      instrument: document.getElementById("tvInstrument"),
      symbol: document.getElementById("tvSymbol"),
      timeframe: document.getElementById("tvTimeframe"),
      chartUrl: document.getElementById("tvChartUrl"),
      openChart: document.getElementById("tvOpenChart"),
      copyChart: document.getElementById("tvCopyChart"),
      copyState: document.getElementById("tvCopyState"),
      range: document.getElementById("exportRange"),
      total: document.getElementById("exportTotal"),
      closed: document.getElementById("exportClosed"),
      coverage: document.getElementById("exportCoverage"),
      netR: document.getElementById("exportNetR"),
      attachmentSummary: document.getElementById("exportAttachmentSummary"),
      csv: document.getElementById("downloadCsv"),
      report: document.getElementById("openPdfReport"),
      empty: document.getElementById("exportEmpty"),
      alertPayload: document.getElementById("tvAlertPayload"),
      alertExample: document.getElementById("tvAlertExample"),
      alertImport: document.getElementById("tvAlertImport"),
      alertState: document.getElementById("tvAlertState"),
      alertCount: document.getElementById("tvAlertCount"),
      alertNew: document.getElementById("tvAlertNew"),
      alertList: document.getElementById("tvAlertList"),
      alertEmpty: document.getElementById("tvAlertEmpty")
    };

    function chartUrl() {
      return buildTradingViewUrl(elements.symbol.value, elements.timeframe.value);
    }

    function renderChartUrl() {
      const url = chartUrl();
      elements.chartUrl.value = url;
      elements.openChart.href = url;
      elements.copyState.textContent = "พร้อมเปิดกราฟ";
      elements.copyState.dataset.state = "idle";
    }

    function currentTrades() {
      return filterTradesByRange(storage.loadJournalTrades(), elements.range.value);
    }

    function renderExport() {
      const trades = currentTrades();
      const summary = summarizeTrades(trades);
      elements.total.textContent = String(summary.total);
      elements.closed.textContent = String(summary.closed);
      elements.coverage.textContent = summary.closed ?
        `${Math.round((summary.realizedCount / summary.closed) * 100)}%` : "--";
      elements.netR.textContent = summary.realizedCount ?
        `${summary.netR > 0 ? "+" : ""}${summary.netR.toFixed(2)}R` : "--";
      elements.attachmentSummary.textContent =
        `${summary.links} TradingView links · ${summary.screenshots} Screenshots`;
      elements.csv.disabled = summary.total === 0;
      elements.report.href = `report.html?range=${encodeURIComponent(elements.range.value)}`;
      elements.report.setAttribute("aria-disabled", summary.total === 0 ? "true" : "false");
      elements.empty.hidden = summary.total !== 0;
    }

    function renderAlertInbox() {
      const alerts = storage.loadIndicatorAlerts();
      const active = alerts.filter(function (item) {
        return item.decision === "new" || item.decision === "wait";
      }).length;
      elements.alertCount.textContent = String(alerts.length);
      elements.alertNew.textContent = String(active);
      elements.alertEmpty.hidden = alerts.length !== 0;
      elements.alertList.replaceChildren();

      alerts.slice(0, 12).forEach(function (alert) {
        const item = document.createElement("article");
        item.className = "indicator-alert";
        item.dataset.state = alert.state;
        item.dataset.decision = alert.decision;

        const copy = document.createElement("div");
        copy.className = "indicator-alert-copy";
        const title = document.createElement("strong");
        title.textContent = alert.event;
        const meta = document.createElement("span");
        meta.textContent = [
          alert.ticker,
          timeframeLabel(alert.timeframe),
          alert.narrative.toUpperCase(),
          formatAlertTime(alert)
        ].join(" · ");
        const result = document.createElement("span");
        result.className = "indicator-alert-result";
        result.textContent =
          `${alert.state.toUpperCase()} · ${alert.score}/100 · ${alert.grade}`;
        copy.append(title, meta, result);

        const actions = document.createElement("div");
        actions.className = "indicator-alert-actions";
        [
          ["wait", "WAIT", "button button-quiet"],
          ["skip", "SKIP", "button button-quiet"],
          ["review", "ตรวจ Entry", "button button-primary"],
          ["delete", "ลบ", "button button-quiet"]
        ].forEach(function (definition) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = definition[2];
          button.dataset.alertAction = definition[0];
          button.dataset.alertId = alert.id;
          button.textContent = definition[1];
          actions.appendChild(button);
        });

        item.append(copy, actions);
        elements.alertList.appendChild(item);
      });
    }

    elements.instrument.addEventListener("change", function () {
      elements.symbol.value = SYMBOLS[elements.instrument.value] || "";
      renderChartUrl();
    });
    elements.symbol.addEventListener("input", renderChartUrl);
    elements.timeframe.addEventListener("change", renderChartUrl);
    elements.range.addEventListener("change", renderExport);

    elements.copyChart.addEventListener("click", async function () {
      try {
        await copyText(chartUrl());
        elements.copyState.textContent = "คัดลอกลิงก์แล้ว";
        elements.copyState.dataset.state = "saved";
      } catch (error) {
        elements.copyState.textContent = "คัดลอกไม่สำเร็จ";
        elements.copyState.dataset.state = "error";
      }
    });

    elements.csv.addEventListener("click", function () {
      const trades = currentTrades();
      if (!trades.length) return;
      const date = new Date().toISOString().slice(0, 10);
      downloadTextFile(
        `trading-companion-journal-${date}.csv`,
        buildCsv(trades),
        "text/csv;charset=utf-8"
      );
    });

    elements.report.addEventListener("click", function (event) {
      if (elements.report.getAttribute("aria-disabled") === "true") {
        event.preventDefault();
      }
    });

    elements.alertExample.addEventListener("click", function () {
      elements.alertPayload.value = JSON.stringify(ALERT_EXAMPLE, null, 2);
      elements.alertState.textContent = "ใส่ข้อมูลตัวอย่างแล้ว";
      elements.alertState.dataset.state = "idle";
      elements.alertPayload.focus();
    });

    elements.alertImport.addEventListener("click", function () {
      try {
        const alert = parseIndicatorAlert(elements.alertPayload.value);
        storage.saveIndicatorAlert(alert);
        elements.alertState.textContent =
          `รับ ${alert.ticker} ${timeframeLabel(alert.timeframe)} · ${alert.score}/100 แล้ว`;
        elements.alertState.dataset.state = "saved";
        elements.alertPayload.value = "";
        renderAlertInbox();
      } catch (error) {
        elements.alertState.textContent = error.message || "นำเข้า Alert ไม่สำเร็จ";
        elements.alertState.dataset.state = "error";
      }
    });

    elements.alertList.addEventListener("click", function (event) {
      const button = event.target.closest("[data-alert-action]");
      if (!button) return;
      const id = button.dataset.alertId;
      const action = button.dataset.alertAction;
      const alert = storage.loadIndicatorAlerts().find(function (item) {
        return item.id === id;
      });
      if (!alert) return;

      if (action === "delete") {
        if (!window.confirm("ลบ Indicator Alert นี้หรือไม่?")) return;
        storage.deleteIndicatorAlert(id);
        renderAlertInbox();
        return;
      }
      if (action === "wait" || action === "skip") {
        storage.updateIndicatorAlertDecision(id, action);
        elements.alertState.textContent =
          action === "wait" ? "เก็บ Alert ไว้รอติดตามแล้ว" : "บันทึก Alert เป็น SKIP แล้ว";
        elements.alertState.dataset.state = "saved";
        renderAlertInbox();
        return;
      }
      if (action === "review") {
        if (!instrumentFromAlert(alert)) {
          elements.alertState.textContent =
            `${alert.ticker} ยังไม่รองรับใน New Trade กรุณาเก็บเป็น WAIT หรือ SKIP`;
          elements.alertState.dataset.state = "error";
          return;
        }
        const currentDraft = storage.loadDraft();
        if (
          storage.hasMeaningfulDraft(currentDraft) &&
          !window.confirm("แทนที่ New Trade Draft ปัจจุบันด้วยข้อมูลจาก Alert นี้หรือไม่?")
        ) {
          return;
        }
        storage.saveDraft(buildDraftFromAlert(alert, storage));
        storage.updateIndicatorAlertDecision(id, "review");
        window.location.href = "trade.html";
      }
    });

    elements.symbol.value = SYMBOLS[elements.instrument.value];
    renderChartUrl();
    renderExport();
    renderAlertInbox();
  }

  window.TradingIntegration = {
    RANGE_DAYS,
    SYMBOLS,
    getTradeDate,
    optionalNumber,
    filterTradesByRange,
    summarizeTrades,
    buildTradingViewUrl,
    buildCsv,
    ALERT_SCHEMA,
    ALERT_EXAMPLE,
    parseIndicatorAlert,
    instrumentFromAlert,
    buildDraftFromAlert,
    timeframeLabel
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initializePage);
  }
})();
