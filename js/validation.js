(function () {
  "use strict";

  const TARGET = 20;
  const COVERAGE_TARGET = 80;
  const GRADE_ORDER = ["A+", "A", "B", "NO TRADE"];

  function optionalNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function percentage(value, total) {
    return total ? Math.round((value / total) * 100) : 0;
  }

  function outcome(record) {
    return record && record.lifecycle ? record.lifecycle.outcome : null;
  }

  function realizedR(record) {
    return optionalNumber(
      record &&
      record.journal &&
      record.journal.closeReview &&
      record.journal.closeReview.realizedRr
    );
  }

  function hasJournalReview(record) {
    const journal = record && record.journal || {};
    return Boolean(journal.emotion && String(journal.lesson || "").trim());
  }

  function isReviewedSkip(record) {
    return Boolean(
      record &&
      record.lifecycle &&
      record.lifecycle.status === "skipped" &&
      record.validation &&
      ["good-skip", "missed-move"].includes(record.validation.verdict)
    );
  }

  function summarizeGrades(records) {
    const source = Array.isArray(records) ? records : [];
    return GRADE_ORDER.map(function (grade) {
      const matching = source.filter(function (record) {
        return String(record.result && record.result.grade || "") === grade;
      });
      const closed = matching.filter(function (record) {
        return record.lifecycle && record.lifecycle.status === "closed";
      });
      const reviewedSkips = matching.filter(isReviewedSkip);
      const wins = closed.filter(function (record) {
        return outcome(record) === "win";
      }).length;
      const losses = closed.filter(function (record) {
        return outcome(record) === "loss";
      }).length;
      const rValues = closed.map(realizedR).filter(function (value) {
        return value !== null;
      });
      const goodSkips = reviewedSkips.filter(function (record) {
        return record.validation.verdict === "good-skip";
      }).length;

      return {
        grade,
        evidence: closed.length + reviewedSkips.length,
        closed: closed.length,
        winRate: wins + losses ? Math.round((wins / (wins + losses)) * 100) : null,
        averageR: rValues.length ?
          Math.round((rValues.reduce(function (sum, value) {
            return sum + value;
          }, 0) / rValues.length) * 100) / 100 : null,
        skipAccuracy: reviewedSkips.length ?
          Math.round((goodSkips / reviewedSkips.length) * 100) : null
      };
    });
  }

  function summarizeScoreSignals(records) {
    const source = (Array.isArray(records) ? records : []).filter(function (record) {
      return (
        record.lifecycle &&
        record.lifecycle.status === "closed" &&
        ["win", "loss"].includes(outcome(record)) &&
        record.result &&
        Array.isArray(record.result.scoreBreakdown)
      );
    });
    const categoryMap = new Map();

    source.forEach(function (record) {
      record.result.scoreBreakdown.forEach(function (category) {
        const id = String(category.id || category.label || "");
        if (!id) return;
        if (!categoryMap.has(id)) {
          categoryMap.set(id, {
            id,
            label: String(category.label || id),
            winValues: [],
            lossValues: []
          });
        }
        const weight = optionalNumber(category.weight);
        const earned = optionalNumber(category.earned);
        if (weight === null || weight <= 0 || earned === null) return;
        const value = Math.round((earned / weight) * 100);
        const target = outcome(record) === "win" ? "winValues" : "lossValues";
        categoryMap.get(id)[target].push(value);
      });
    });

    return Array.from(categoryMap.values()).map(function (category) {
      const winAverage = category.winValues.length ?
        Math.round(category.winValues.reduce(function (sum, value) {
          return sum + value;
        }, 0) / category.winValues.length) : null;
      const lossAverage = category.lossValues.length ?
        Math.round(category.lossValues.reduce(function (sum, value) {
          return sum + value;
        }, 0) / category.lossValues.length) : null;
      return {
        id: category.id,
        label: category.label,
        wins: category.winValues.length,
        losses: category.lossValues.length,
        winAverage,
        lossAverage,
        difference: winAverage !== null && lossAverage !== null ?
          winAverage - lossAverage : null
      };
    });
  }

  function createWorkQueue(records) {
    const source = Array.isArray(records) ? records : [];
    const queue = [];

    source.forEach(function (record) {
      const status = record.lifecycle && record.lifecycle.status;
      const id = String(record.id || "");
      const instrument = record.instrument || "ไม่ระบุสินทรัพย์";
      const journalHref = `journal.html#trade-${encodeURIComponent(id)}`;

      if (status === "open") {
        queue.push({
          id: `${id}-close`,
          instrument,
          task: "ปิดผล Position เมื่อ Trade จบ",
          reason: "ยังไม่สามารถนำไปวัด Win Rate หรือ Expectancy",
          href: journalHref,
          action: "เปิด Journal",
          priority: 1
        });
        return;
      }

      if (
        status === "skipped" &&
        !isReviewedSkip(record)
      ) {
        queue.push({
          id: `${id}-skip`,
          instrument,
          task: "ทบทวนผลหลัง SKIP",
          reason: "ระบุว่าเป็น GOOD SKIP หรือ MISSED MOVE",
          href: "index.html#historyHeading",
          action: "เปิด Dashboard",
          priority: 1
        });
        return;
      }

      if (status !== "closed") return;

      if (realizedR(record) === null) {
        queue.push({
          id: `${id}-rr`,
          instrument,
          task: "เพิ่ม Actual Exit และ Realized R",
          reason: "ผลลัพธ์นี้ยังใช้ปรับ Expectancy และน้ำหนักคะแนนไม่ได้เต็มที่",
          href: journalHref,
          action: "เติมผลลัพธ์",
          priority: 2
        });
      }

      if (!hasJournalReview(record)) {
        queue.push({
          id: `${id}-review`,
          instrument,
          task: "เติม Emotion และ Lesson",
          reason: "ต้องมีบริบทหลังเทรดเพื่อแยกปัญหากฎออกจากปัญหาการ Execute",
          href: journalHref,
          action: "ทบทวน Trade",
          priority: 3
        });
      }
    });

    return queue.sort(function (left, right) {
      return left.priority - right.priority;
    });
  }

  function buildValidationReport(records, options) {
    const source = Array.isArray(records) ? records : [];
    const target = Number(options && options.target) || TARGET;
    const eligible = source.filter(function (record) {
      return Boolean(
        record &&
        record.result &&
        record.result.scoreProfile === "score-v1" &&
        Array.isArray(record.result.scoreBreakdown) &&
        record.result.scoreBreakdown.length
      );
    });
    const closed = eligible.filter(function (record) {
      return record.lifecycle && record.lifecycle.status === "closed";
    });
    const skips = eligible.filter(function (record) {
      return record.lifecycle && record.lifecycle.status === "skipped";
    });
    const reviewedSkips = skips.filter(isReviewedSkip);
    const validated = closed.length + reviewedSkips.length;
    const realizedCount = closed.filter(function (record) {
      return realizedR(record) !== null;
    }).length;
    const reviewCount = closed.filter(hasJournalReview).length;
    const screenshotCount = closed.filter(function (record) {
      return Boolean(record.journal && record.journal.screenshot);
    }).length;
    const rCoverage = percentage(realizedCount, closed.length);
    const reviewCoverage = percentage(reviewCount, closed.length);
    const criteria = [
      {
        id: "evidence",
        label: "Validated evidence",
        detail: `${validated} / ${target} ผลลัพธ์`,
        complete: validated >= target
      },
      {
        id: "realized-r",
        label: "Realized R coverage",
        detail: `${rCoverage}% / ${COVERAGE_TARGET}%`,
        complete: closed.length > 0 && rCoverage >= COVERAGE_TARGET
      },
      {
        id: "journal-review",
        label: "Post-trade review coverage",
        detail: `${reviewCoverage}% / ${COVERAGE_TARGET}%`,
        complete: closed.length > 0 && reviewCoverage >= COVERAGE_TARGET
      },
      {
        id: "skip-review",
        label: "Skip review queue",
        detail: `${skips.length - reviewedSkips.length} รายการค้าง`,
        complete: skips.length === reviewedSkips.length
      }
    ];
    const completedCriteria = criteria.filter(function (criterion) {
      return criterion.complete;
    }).length;
    const ready = completedCriteria === criteria.length;
    const state = ready ? "ready" :
      validated >= Math.ceil(target / 2) || closed.length ? "developing" : "waiting";

    return {
      target,
      eligible: eligible.length,
      validated,
      remaining: Math.max(target - validated, 0),
      evidencePercent: Math.min(percentage(validated, target), 100),
      closed: closed.length,
      reviewedSkips: reviewedSkips.length,
      pendingSkips: skips.length - reviewedSkips.length,
      open: eligible.filter(function (record) {
        return record.lifecycle && record.lifecycle.status === "open";
      }).length,
      realizedCount,
      rCoverage,
      reviewCount,
      reviewCoverage,
      screenshotCount,
      screenshotCoverage: percentage(screenshotCount, closed.length),
      criteria,
      completedCriteria,
      ready,
      state,
      label: ready ? "V1.0 REVIEW READY" :
        state === "developing" ? "EVIDENCE DEVELOPING" : "COLLECTING EVIDENCE",
      message: ready ?
        "ข้อมูลครบตามเกณฑ์สำหรับทบทวน Score และ Rulebook รอบหลัก" :
        validated >= target ?
          "จำนวนผลลัพธ์ครบแล้ว แต่คุณภาพข้อมูลบางส่วนยังไม่ถึงเกณฑ์" :
          `ต้องการอีก ${Math.max(target - validated, 0)} ผลลัพธ์เพื่อครบเป้าหมาย`,
      grades: summarizeGrades(eligible),
      scoreSignals: summarizeScoreSignals(eligible),
      queue: createWorkQueue(eligible)
    };
  }

  function formatR(value) {
    if (value === null || value === undefined) return "--";
    const prefix = value > 0 ? "+" : "";
    return `${prefix}${Number(value).toFixed(2)}R`;
  }

  function textCell(value, className) {
    const cell = document.createElement("td");
    cell.textContent = value;
    if (className) cell.className = className;
    return cell;
  }

  function renderPage() {
    const root = document.getElementById("validationCenter");
    if (!root || !window.TradingStorage) return;

    const report = buildValidationReport(window.TradingStorage.loadHistory(), {
      target: window.TradingStorage.VALIDATION_TARGET
    });
    const status = document.getElementById("validationCenterStatus");
    status.dataset.state = report.state;
    const statusPill = status.querySelector(".status-pill");
    statusPill.dataset.state = report.state;
    statusPill.querySelector(".pill-copy").textContent = report.label;
    document.getElementById("validationCenterMessage").textContent = report.message;
    document.getElementById("validationEvidence").textContent =
      `${report.validated} / ${report.target}`;
    document.getElementById("validationClosed").textContent = String(report.closed);
    document.getElementById("validationSkips").textContent = String(report.reviewedSkips);
    document.getElementById("validationRCoverage").textContent = `${report.rCoverage}%`;
    document.getElementById("validationReviewCoverage").textContent =
      `${report.reviewCoverage}%`;
    document.getElementById("validationPending").textContent = String(report.queue.length);
    document.getElementById("validationEvidenceProgress").style.width =
      `${report.evidencePercent}%`;
    document.getElementById("validationEvidenceProgress").parentElement
      .setAttribute("aria-valuenow", String(report.evidencePercent));

    const readiness = document.getElementById("validationReadiness");
    readiness.replaceChildren();
    report.criteria.forEach(function (criterion) {
      const item = document.createElement("li");
      item.dataset.complete = String(criterion.complete);
      const icon = document.createElement("span");
      icon.className = "validation-check";
      icon.textContent = criterion.complete ? "PASS" : "WAIT";
      const copy = document.createElement("span");
      const label = document.createElement("strong");
      label.textContent = criterion.label;
      const detail = document.createElement("small");
      detail.textContent = criterion.detail;
      copy.append(label, detail);
      item.append(icon, copy);
      readiness.appendChild(item);
    });
    document.getElementById("validationReadinessCount").textContent =
      `${report.completedCriteria} / ${report.criteria.length}`;

    [
      ["validationRBar", report.rCoverage],
      ["validationReviewBar", report.reviewCoverage],
      ["validationScreenshotBar", report.screenshotCoverage]
    ].forEach(function ([id, value]) {
      document.getElementById(id).style.width = `${Math.min(value, 100)}%`;
    });
    document.getElementById("validationRValue").textContent =
      `${report.realizedCount} / ${report.closed}`;
    document.getElementById("validationReviewValue").textContent =
      `${report.reviewCount} / ${report.closed}`;
    document.getElementById("validationScreenshotValue").textContent =
      `${report.screenshotCount} / ${report.closed}`;

    const gradeBody = document.getElementById("validationGradeRows");
    gradeBody.replaceChildren();
    report.grades.forEach(function (grade) {
      const row = document.createElement("tr");
      const gradeCell = textCell(grade.grade, "validation-grade");
      gradeCell.dataset.grade = grade.grade.toLowerCase().replace(/\s+/g, "-");
      row.append(
        gradeCell,
        textCell(String(grade.evidence)),
        textCell(String(grade.closed)),
        textCell(grade.winRate === null ? "--" : `${grade.winRate}%`),
        textCell(formatR(grade.averageR), grade.averageR < 0 ? "negative" : ""),
        textCell(grade.skipAccuracy === null ? "--" : `${grade.skipAccuracy}%`)
      );
      gradeBody.appendChild(row);
    });

    const signalBody = document.getElementById("validationSignalRows");
    const signalEmpty = document.getElementById("validationSignalEmpty");
    signalBody.replaceChildren();
    signalEmpty.hidden = Boolean(report.scoreSignals.length);
    report.scoreSignals.forEach(function (signal) {
      const row = document.createElement("tr");
      const difference = signal.difference === null ? "--" :
        `${signal.difference > 0 ? "+" : ""}${signal.difference} pts`;
      const differenceClass = signal.difference === null ? "" :
        signal.difference > 0 ? "positive" :
          signal.difference < 0 ? "negative" : "";
      row.append(
        textCell(signal.label),
        textCell(String(signal.wins)),
        textCell(signal.winAverage === null ? "--" : `${signal.winAverage}%`),
        textCell(String(signal.losses)),
        textCell(signal.lossAverage === null ? "--" : `${signal.lossAverage}%`),
        textCell(difference, differenceClass)
      );
      signalBody.appendChild(row);
    });

    const queue = document.getElementById("validationQueue");
    const queueEmpty = document.getElementById("validationQueueEmpty");
    queue.replaceChildren();
    queueEmpty.hidden = Boolean(report.queue.length);
    queueEmpty.textContent = report.validated ?
      "ไม่มีข้อมูลค้าง ระบบพร้อมใช้หลักฐานที่มีในการทบทวนรอบถัดไป" :
      "ยังไม่มีผลลัพธ์จริง เริ่มจาก New Trade และปิดผลใน Journal เมื่อ Trade จบ";
    report.queue.forEach(function (task) {
      const item = document.createElement("article");
      item.className = "validation-task";
      const copy = document.createElement("div");
      const instrument = document.createElement("span");
      instrument.textContent = task.instrument;
      const heading = document.createElement("strong");
      heading.textContent = task.task;
      const reason = document.createElement("p");
      reason.textContent = task.reason;
      copy.append(instrument, heading, reason);
      const action = document.createElement("a");
      action.className = "button button-secondary";
      action.href = task.href;
      action.textContent = task.action;
      item.append(copy, action);
      queue.appendChild(item);
    });
    document.getElementById("validationQueueCount").textContent =
      `${report.queue.length} รายการ`;
  }

  window.TradingValidation = {
    TARGET,
    COVERAGE_TARGET,
    buildValidationReport,
    summarizeGrades,
    summarizeScoreSignals,
    createWorkQueue
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", renderPage);
  }
})();
