(function () {
  "use strict";

  function formatDate(value, options) {
    const date = new Date(value || "");
    if (Number.isNaN(date.getTime())) return "--";
    return new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      dateStyle: "medium",
      ...(options && options.dateOnly ? {} : { timeStyle: "short" })
    }).format(date);
  }

  function formatR(value) {
    const number = window.TradingIntegration.optionalNumber(value);
    if (number === null) return "--";
    return `${number > 0 ? "+" : ""}${number.toFixed(2)}R`;
  }

  function label(value) {
    return String(value || "--")
      .replace(/-/g, " ")
      .replace(/\b\w/g, function (character) {
        return character.toUpperCase();
      });
  }

  function appendCell(row, value, className) {
    const cell = document.createElement("td");
    cell.textContent = value;
    if (className) cell.className = className;
    row.appendChild(cell);
  }

  function initializeReport() {
    const storage = window.TradingStorage;
    const integration = window.TradingIntegration;
    const parameters = new URLSearchParams(window.location.search);
    const range = ["30", "90", "all"].includes(parameters.get("range")) ?
      parameters.get("range") : "all";
    const trades = integration.filterTradesByRange(storage.loadJournalTrades(), range);
    const summary = integration.summarizeTrades(trades);
    const rangeLabels = {
      "30": "30 วันที่ผ่านมา",
      "90": "90 วันที่ผ่านมา",
      all: "ทุกช่วงเวลา"
    };

    document.getElementById("reportRange").textContent = rangeLabels[range];
    document.getElementById("reportGenerated").textContent =
      `สร้างเมื่อ ${formatDate(new Date().toISOString())}`;
    document.getElementById("reportTotal").textContent = String(summary.total);
    document.getElementById("reportClosed").textContent = String(summary.closed);
    document.getElementById("reportWinRate").textContent =
      summary.winRate === null ? "--" : `${summary.winRate}%`;
    document.getElementById("reportNetR").textContent =
      summary.realizedCount ? formatR(summary.netR) : "--";

    const body = document.getElementById("reportRows");
    const reviews = document.getElementById("reportReviews");
    const empty = document.getElementById("reportEmpty");

    trades.forEach(function (trade) {
      const lifecycle = trade.lifecycle || {};
      const plan = trade.tradePlan || {};
      const result = trade.result || {};
      const journal = storage.normalizeJournal(trade.journal);
      const closeReview = journal.closeReview || {};
      const row = document.createElement("tr");
      appendCell(row, formatDate(lifecycle.openedAt || trade.savedAt, { dateOnly: true }));
      appendCell(row, trade.instrument || "--");
      appendCell(row, label(trade.setupType));
      appendCell(row, label(trade.direction));
      appendCell(row, result.grade || "--");
      appendCell(row, label(lifecycle.status));
      appendCell(row, label(lifecycle.outcome));
      appendCell(row, formatR(plan.plannedRr), "numeric");
      appendCell(row, formatR(closeReview.realizedRr), "numeric");
      body.appendChild(row);

      if (
        journal.lesson ||
        closeReview.closeNote ||
        journal.mistakes.length ||
        journal.tradingViewUrl ||
        trade.notes
      ) {
        const item = document.createElement("article");
        const heading = document.createElement("h3");
        heading.textContent =
          `${trade.instrument || "Trade"} · ${formatDate(lifecycle.openedAt || trade.savedAt)}`;
        item.appendChild(heading);

        const details = [
          ["Setup", `${label(trade.setupType)} · ${label(trade.direction)} · ${result.grade || "--"}`],
          ["Mistakes", journal.mistakes.map(label).join(", ")],
          ["Lesson", journal.lesson],
          ["Close note", closeReview.closeNote],
          ["Trade notes", trade.notes]
        ].filter(function (entry) {
          return entry[1];
        });

        details.forEach(function (entry) {
          const paragraph = document.createElement("p");
          const strong = document.createElement("strong");
          strong.textContent = `${entry[0]}: `;
          paragraph.append(strong, document.createTextNode(entry[1]));
          item.appendChild(paragraph);
        });

        if (journal.tradingViewUrl) {
          const paragraph = document.createElement("p");
          const strong = document.createElement("strong");
          strong.textContent = "TradingView: ";
          const anchor = document.createElement("a");
          anchor.href = journal.tradingViewUrl;
          anchor.textContent = journal.tradingViewUrl;
          paragraph.append(strong, anchor);
          item.appendChild(paragraph);
        }
        reviews.appendChild(item);
      }
    });

    empty.hidden = trades.length !== 0;
    document.getElementById("reportTable").hidden = trades.length === 0;
    document.getElementById("reportReviewSection").hidden = reviews.children.length === 0;
    document.getElementById("printReport").addEventListener("click", function () {
      window.print();
    });
  }

  document.addEventListener("DOMContentLoaded", initializeReport);
})();
