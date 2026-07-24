(function () {
  "use strict";

  const TIME_ZONE = "Asia/Bangkok";
  const BIAS_LABELS = {
    bullish: "Bullish",
    bearish: "Bearish",
    neutral: "Neutral"
  };
  const REQUIREMENTS = [
    { key: "bias", label: "กำหนด Today's Bias", complete: (plan) => Boolean(plan.bias) },
    { key: "htfNarrative", label: "เขียน HTF Narrative", complete: (plan) => Boolean(plan.htfNarrative) },
    { key: "keyPois", label: "ระบุ Key POIs", complete: (plan) => Boolean(plan.keyPois) },
    { key: "liquidityTargets", label: "ระบุ Liquidity Targets", complete: (plan) => Boolean(plan.liquidityTargets) },
    {
      key: "sessionPlan",
      label: "วางแผน London หรือ New York",
      complete: (plan) => Boolean(plan.londonPlan || plan.newYorkPlan)
    },
    {
      key: "newsStatus",
      label: "ตรวจข่าวและระบุเวลาเมื่อมีข่าวแรง",
      complete: (plan) => plan.newsStatus === "clear" ||
        (plan.newsStatus === "high-impact" && Boolean(plan.newsNote))
    },
    {
      key: "noTradeConditions",
      label: "กำหนด No Trade Conditions",
      complete: (plan) => Boolean(plan.noTradeConditions)
    }
  ];

  function getDateParts(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(date.getTime())) return null;
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date);
    const result = {};
    parts.forEach(function (part) {
      if (["year", "month", "day"].includes(part.type)) {
        result[part.type] = Number(part.value);
      }
    });
    return result.year && result.month && result.day ? result : null;
  }

  function partsToKey(parts) {
    if (!parts) return "";
    return [
      String(parts.year).padStart(4, "0"),
      String(parts.month).padStart(2, "0"),
      String(parts.day).padStart(2, "0")
    ].join("-");
  }

  function keyToDate(key) {
    if (typeof key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const values = key.split("-").map(Number);
    const date = new Date(Date.UTC(values[0], values[1] - 1, values[2], 12));
    if (
      date.getUTCFullYear() !== values[0] ||
      date.getUTCMonth() !== values[1] - 1 ||
      date.getUTCDate() !== values[2]
    ) return null;
    return date;
  }

  function dateToKey(date) {
    return [
      String(date.getUTCFullYear()).padStart(4, "0"),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0")
    ].join("-");
  }

  function shiftDateKey(key, days) {
    const date = keyToDate(key);
    if (!date || !Number.isFinite(Number(days))) return "";
    date.setUTCDate(date.getUTCDate() + Number(days));
    return dateToKey(date);
  }

  function getTodayKey(value) {
    return partsToKey(getDateParts(value === undefined ? new Date() : value));
  }

  function evaluatePlan(plan) {
    const source = plan && typeof plan === "object" ? plan : {};
    const requirements = REQUIREMENTS.map(function (requirement) {
      return {
        key: requirement.key,
        label: requirement.label,
        complete: requirement.complete(source)
      };
    });
    const complete = requirements.filter((requirement) => requirement.complete).length;
    const hasContent = window.TradingStorage &&
      typeof window.TradingStorage.hasMeaningfulSessionPlan === "function" ?
      window.TradingStorage.hasMeaningfulSessionPlan(source) :
      complete > 0;
    const state = complete === requirements.length ? "ready" :
      hasContent ? "draft" : "empty";
    const next = requirements.find((requirement) => !requirement.complete);
    return {
      state,
      complete,
      total: requirements.length,
      percent: Math.round(complete / requirements.length * 100),
      requirements,
      nextRequirement: next ? next.label : "ข้อมูลพร้อมสำหรับใช้เป็นแผนก่อนตลาดเปิด"
    };
  }

  function getCurrentSession(value) {
    const date = value instanceof Date ? value : new Date(value === undefined ? Date.now() : value);
    if (!Number.isFinite(date.getTime())) {
      return { key: "off", label: "Off session", note: "เวลาอ้างอิงกรุงเทพฯ" };
    }
    const hour = Number(new Intl.DateTimeFormat("en-GB", {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      hourCycle: "h23"
    }).format(date));
    if (hour >= 19 && hour < 21) {
      return { key: "overlap", label: "London / New York", note: "ช่วงตลาดซ้อนกัน" };
    }
    if (hour >= 21 || hour < 2) {
      return { key: "new-york", label: "New York", note: "เวลาอ้างอิงกรุงเทพฯ" };
    }
    if (hour >= 14 && hour < 19) {
      return { key: "london", label: "London", note: "เวลาอ้างอิงกรุงเทพฯ" };
    }
    if (hour >= 7 && hour < 14) {
      return { key: "asia", label: "Asia", note: "เตรียมแผน London" };
    }
    return { key: "off", label: "Off session", note: "เตรียมแผนก่อนตลาดเปิด" };
  }

  function getSessionPlanPreview(plan, sessionKey) {
    const source = plan && typeof plan === "object" ? plan : {};
    if (["new-york", "overlap"].includes(sessionKey)) {
      return source.newYorkPlan || "ยังไม่มี New York Plan";
    }
    return source.londonPlan || "ยังไม่มี London Plan";
  }

  function formatPlanDate(dateKey) {
    const date = keyToDate(dateKey);
    if (!date) return "--";
    return new Intl.DateTimeFormat("th-TH", {
      timeZone: "UTC",
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function formatSavedAt(value) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "บันทึกไว้ในอุปกรณ์นี้";
    return `บันทึกล่าสุด ${new Intl.DateTimeFormat("th-TH", {
      timeZone: TIME_ZONE,
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date)}`;
  }

  function initializePage() {
    const form = document.getElementById("sessionPlanForm");
    if (!form) return;

    const storage = window.TradingStorage;
    const todayKey = getTodayKey();
    let selectedDate = todayKey;
    let activePlan = storage.loadSessionPlan(selectedDate);
    let dirty = false;
    const fields = {
      htfNarrative: document.getElementById("htfNarrative"),
      keyPois: document.getElementById("keyPois"),
      liquidityTargets: document.getElementById("liquidityTargets"),
      londonPlan: document.getElementById("londonPlan"),
      newYorkPlan: document.getElementById("newYorkPlan"),
      newsNote: document.getElementById("newsNote"),
      noTradeConditions: document.getElementById("noTradeConditions")
    };

    function readForm() {
      const checkedBias = form.querySelector('input[name="bias"]:checked');
      const checkedNews = form.querySelector('input[name="newsStatus"]:checked');
      return storage.normalizeSessionPlan({
        bias: checkedBias ? checkedBias.value : "",
        htfNarrative: fields.htfNarrative.value,
        keyPois: fields.keyPois.value,
        liquidityTargets: fields.liquidityTargets.value,
        londonPlan: fields.londonPlan.value,
        newYorkPlan: fields.newYorkPlan.value,
        newsStatus: checkedNews ? checkedNews.value : "not-reviewed",
        newsNote: fields.newsNote.value,
        noTradeConditions: fields.noTradeConditions.value,
        updatedAt: activePlan.updatedAt
      }, selectedDate);
    }

    function writeForm(plan) {
      form.querySelectorAll('input[name="bias"]').forEach(function (input) {
        input.checked = input.value === plan.bias;
      });
      form.querySelectorAll('input[name="newsStatus"]').forEach(function (input) {
        input.checked = input.value === plan.newsStatus;
      });
      Object.keys(fields).forEach(function (field) {
        fields[field].value = plan[field] || "";
      });
    }

    function renderRequirements(evaluation) {
      const list = document.getElementById("plannerRequirements");
      list.replaceChildren();
      evaluation.requirements.forEach(function (requirement) {
        const item = document.createElement("li");
        item.dataset.complete = String(requirement.complete);
        const marker = document.createElement("i");
        marker.textContent = requirement.complete ? "✓" : "";
        const copy = document.createElement("span");
        copy.textContent = requirement.label;
        item.append(marker, copy);
        list.appendChild(item);
      });
    }

    function renderEvaluation(plan) {
      const evaluation = evaluatePlan(plan);
      const pill = document.getElementById("planReadinessState");
      const statusBar = document.getElementById("plannerStatusBar");
      const stateData = {
        empty: { label: "PLAN EMPTY", state: "waiting" },
        draft: { label: "PLAN DRAFT", state: "developing" },
        ready: { label: "PLAN READY", state: "ready" }
      }[evaluation.state];
      pill.dataset.state = stateData.state;
      pill.querySelector(".pill-copy").textContent = stateData.label;
      statusBar.dataset.state = stateData.state;
      document.getElementById("plannerStatusText").textContent =
        evaluation.state === "ready" ?
          "ข้อมูล Pre-market Plan ครบ 7 ข้อ พร้อมใช้เป็นกรอบตัดสินใจ" :
          evaluation.state === "draft" ?
            `Daily Plan ยังขาด: ${evaluation.nextRequirement}` :
            "ยังไม่มี Daily Plan สำหรับวันที่เลือก";
      document.getElementById("plannerProgressCount").textContent =
        `${evaluation.complete} / ${evaluation.total}`;
      document.getElementById("plannerProgressValue").style.width = `${evaluation.percent}%`;
      document.getElementById("plannerNextRequirement").textContent =
        evaluation.nextRequirement;
      renderRequirements(evaluation);

      const isToday = selectedDate === todayKey;
      const session = isToday ? getCurrentSession() :
        { key: "archived", label: "Saved plan", note: "วันที่ที่เลือก" };
      document.getElementById("plannerCurrentSession").textContent = session.label;
      document.getElementById("plannerSessionNote").textContent = session.note;
      document.getElementById("plannerActivePlan").textContent = session.key === "archived" ?
        plan.londonPlan || plan.newYorkPlan || "ยังไม่มี Session Plan" :
        getSessionPlanPreview(plan, session.key);
      return evaluation;
    }

    function renderSaveState(plan) {
      const state = document.getElementById("plannerSaveState");
      const saved = Boolean(plan.updatedAt);
      state.textContent = saved ? "บันทึกแล้ว" : "ยังไม่ได้บันทึก";
      state.dataset.state = saved ? "saved" : "unsaved";
      document.getElementById("plannerUpdatedAt").textContent =
        saved ? formatSavedAt(plan.updatedAt) : "บันทึกไว้ในอุปกรณ์นี้";
    }

    function loadDate(dateKey) {
      selectedDate = dateKey;
      activePlan = storage.loadSessionPlan(selectedDate);
      dirty = false;
      document.getElementById("plannerDateLabel").textContent = formatPlanDate(selectedDate);
      writeForm(activePlan);
      renderEvaluation(activePlan);
      renderSaveState(activePlan);
      document.getElementById("clearSessionPlan").disabled =
        !storage.hasMeaningfulSessionPlan(activePlan);
    }

    function canLeaveDirtyPlan() {
      if (!dirty) return true;
      return window.confirm("มีการแก้ไขที่ยังไม่บันทึก ต้องการออกจากวันนี้หรือไม่?");
    }

    form.addEventListener("input", function () {
      dirty = true;
      const plan = readForm();
      renderEvaluation(plan);
      const state = document.getElementById("plannerSaveState");
      state.textContent = "มีการแก้ไขที่ยังไม่บันทึก";
      state.dataset.state = "unsaved";
      document.getElementById("clearSessionPlan").disabled =
        !storage.hasMeaningfulSessionPlan(plan);
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const saved = storage.saveSessionPlan(selectedDate, readForm());
      if (!saved) return;
      activePlan = saved;
      dirty = false;
      renderEvaluation(activePlan);
      renderSaveState(activePlan);
      document.getElementById("clearSessionPlan").disabled = false;
    });
    document.getElementById("clearSessionPlan").addEventListener("click", function () {
      const plan = readForm();
      if (!storage.hasMeaningfulSessionPlan(plan)) return;
      if (!window.confirm("ล้าง Session Plan ของวันที่เลือกหรือไม่?")) return;
      storage.clearSessionPlan(selectedDate);
      loadDate(selectedDate);
    });
    document.getElementById("previousPlanDay").addEventListener("click", function () {
      if (!canLeaveDirtyPlan()) return;
      loadDate(shiftDateKey(selectedDate, -1));
    });
    document.getElementById("nextPlanDay").addEventListener("click", function () {
      if (!canLeaveDirtyPlan()) return;
      loadDate(shiftDateKey(selectedDate, 1));
    });
    document.getElementById("currentPlanDay").addEventListener("click", function () {
      if (selectedDate === todayKey || !canLeaveDirtyPlan()) return;
      loadDate(todayKey);
    });
    window.addEventListener("storage", function () {
      if (!dirty) loadDate(selectedDate);
    });
    loadDate(selectedDate);
  }

  window.TradingPlanner = {
    TIME_ZONE,
    BIAS_LABELS,
    REQUIREMENTS,
    getDateParts,
    partsToKey,
    keyToDate,
    dateToKey,
    shiftDateKey,
    getTodayKey,
    evaluatePlan,
    getCurrentSession,
    getSessionPlanPreview,
    formatPlanDate
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initializePage);
  }
})();
