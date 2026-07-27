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
      empty: document.getElementById("exportEmpty")
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

    elements.symbol.value = SYMBOLS[elements.instrument.value];
    renderChartUrl();
    renderExport();
  }

  window.TradingIntegration = {
    RANGE_DAYS,
    SYMBOLS,
    getTradeDate,
    optionalNumber,
    filterTradesByRange,
    summarizeTrades,
    buildTradingViewUrl,
    buildCsv
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initializePage);
  }
})();
