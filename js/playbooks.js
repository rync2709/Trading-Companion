(function () {
  "use strict";

  const PLAYBOOKS = [
    {
      id: "a-plus-reversal",
      name: "A+ Reversal",
      tier: "A+",
      description: "Reversal ที่เริ่มจาก HTF POI และ Liquidity Sweep ก่อนเปลี่ยน Structure พร้อม Intent ชัดเจน",
      criteria: {
        setupTypes: ["reversal"],
        grades: ["A+"]
      },
      sequence: ["HTF POI", "Liquidity Sweep", "MSS / CHOCH", "CISD", "Displacement", "FVG Retrace"],
      rules: [
        "4H และ 1H ต้องมี Narrative ไปทางเดียวกับแผน",
        "ราคาอยู่ใน HTF POI และตำแหน่ง Premium / Discount ที่เหมาะสม",
        "Sweep, Structure Shift และ CISD ต้องเป็น Setup Window เดียวกัน",
        "Entry เกิดหลัง Displacement สร้าง FVG และราคากลับมา Retrace"
      ],
      invalidations: [
        "ไม่มี Liquidity Sweep ที่สัมพันธ์กับ POI",
        "4H และ 1H ขัดแย้งกัน",
        "Displacement ไม่มี Follow-through หรือเป็นเพียง News Wick",
        "RR ไม่ผ่านเกณฑ์ขั้นต่ำหรือ Entry เป็นการไล่ราคา"
      ],
      checklist: ["HTF aligned", "POI valid", "Liquidity swept", "MSS / CHOCH", "CISD", "Displacement + FVG", "Retrace + trigger", "Risk valid"]
    },
    {
      id: "a-continuation",
      name: "A Continuation",
      tier: "A",
      description: "Continuation ตาม HTF Bias หลังตลาดยืนยัน Trend ใหม่และ Pullback เข้า LTF POI",
      criteria: {
        setupTypes: ["continuation"],
        grades: ["A+", "A"]
      },
      sequence: ["HTF Bias", "External BOS", "Pullback", "LTF POI", "CISD", "FVG Entry"],
      rules: [
        "HTF Bias ต้องยังไม่ถูก Invalidate",
        "ต้องมี External BOS ยืนยัน Trend ก่อนมอง Continuation",
        "รอ Pullback เข้า LTF POI ไม่เข้าเทรดกลาง Move",
        "CISD และ Displacement ต้องไปทางเดียวกับ Trend"
      ],
      invalidations: [
        "ราคา Sweep ฝั่งตรงข้ามและสร้าง Reversal Structure",
        "Pullback ทะลุ Origin ที่ทำให้เกิด BOS",
        "ไม่มี Liquidity Target ให้ราคาวิ่งหา",
        "เข้า Late หลังราคาวิ่งออกจาก POI แล้ว"
      ],
      checklist: ["Bias intact", "External BOS", "Pullback", "LTF POI", "Liquidity target", "CISD", "Displacement", "RR valid"]
    },
    {
      id: "ny-open-sweep",
      name: "NY Open Sweep",
      tier: "Session",
      description: "Setup รอบ New York ที่เริ่มจากการกวาด Session Liquidity แล้วรอ Structure และ Intent ยืนยัน",
      criteria: {
        sessions: ["new-york"],
        requireSweep: true
      },
      sequence: ["Pre-NY Range", "Liquidity Raid", "MSS", "CISD", "Displacement", "Retrace"],
      rules: [
        "กำหนด Asia / London High-Low และ Liquidity Target ก่อน NY Open",
        "Sweep ต้องเกิดในตำแหน่งที่สอดคล้องกับ HTF Narrative",
        "ไม่ใช้เวลา Session เป็นเหตุผลเข้าเทรดโดยไม่มี Structure",
        "รอ Retrace หลัง Displacement ก่อน Entry"
      ],
      invalidations: [
        "ข่าวแรงทำให้เกิด Wick โดยไม่มี Follow-through",
        "Sweep เกิดกลาง Range และไม่มี HTF POI",
        "Structure Shift ขัดกับ HTF Narrative",
        "หมด Session Window ก่อนเกิด Entry Trigger"
      ],
      checklist: ["Session levels mapped", "HTF context", "Liquidity raid", "MSS", "CISD", "Displacement", "Retrace", "News checked"]
    },
    {
      id: "london-reversal",
      name: "London Reversal",
      tier: "Session",
      description: "Reversal ใน London Session หลัง Raid Asian Liquidity ภายใน HTF POI ที่กำหนดไว้",
      criteria: {
        setupTypes: ["reversal"],
        sessions: ["london"]
      },
      sequence: ["Asian Range", "HTF POI", "Asia H/L Raid", "MSS", "CISD", "London Entry"],
      rules: [
        "ทำเครื่องหมาย Asian High-Low ก่อน London เปิด",
        "Liquidity Raid ต้องเข้า HTF POI หรือ Premium / Discount ที่เหมาะสม",
        "รอ LTF MSS และ CISD ก่อนมอง Entry",
        "เป้าหมายต้องเป็น Liquidity ฝั่งตรงข้ามที่ชัดเจน"
      ],
      invalidations: [
        "Asia Range ใหญ่ผิดปกติจน RR ไม่คุ้ม",
        "London เปิดแล้วไม่มี Raid หรือ Intent",
        "ราคา Consolidate ต่อใน POI โดยไม่เปลี่ยน Structure",
        "Entry อยู่ใกล้ Liquidity Target เกินไป"
      ],
      checklist: ["Asian range mapped", "HTF POI", "Liquidity raid", "MSS", "CISD", "Displacement", "Opposing target", "RR valid"]
    },
    {
      id: "asian-liquidity-raid",
      name: "Asian Liquidity Raid",
      tier: "Session",
      description: "Setup ที่ใช้ Liquidity ภายใน Asia Session เป็น Context และรอ Confirmation ครบก่อนตัดสินใจ",
      criteria: {
        sessions: ["asia"],
        requireSweep: true
      },
      sequence: ["Daily Bias", "Asia Range", "Internal Sweep", "Structure", "CISD", "Target"],
      rules: [
        "Daily Bias และ Previous Day Liquidity ต้องถูกกำหนดก่อน",
        "ใช้ Position ใน Daily Range ประกอบการอ่าน Sweep",
        "ลดความคาดหวังเรื่อง Momentum เมื่อสภาพคล่องบาง",
        "ออกจากแผนหากไม่มี Follow-through หลัง Confirmation"
      ],
      invalidations: [
        "Spread หรือ Volatility ไม่เหมาะกับ Risk Plan",
        "ไม่มี Daily Bias และ Liquidity Target ที่ชัด",
        "Sweep เกิดซ้ำหลายครั้งโดย Structure ไม่เปลี่ยน",
        "Entry ก่อน Confirmation เพราะกลัวพลาด Move"
      ],
      checklist: ["Daily bias", "PDH / PDL mapped", "Asia range", "Sweep", "Structure", "CISD", "Follow-through", "Risk valid"]
    }
  ];

  function matchesPlaybook(trade, playbook) {
    if (!trade || !playbook) return false;
    const criteria = playbook.criteria || {};
    if (
      criteria.setupTypes &&
      !criteria.setupTypes.includes(String(trade.setupType || ""))
    ) return false;
    if (
      criteria.grades &&
      !criteria.grades.includes(String(trade.result && trade.result.grade || ""))
    ) return false;
    if (
      criteria.sessions &&
      !criteria.sessions.includes(String(trade.session || ""))
    ) return false;
    if (
      criteria.requireSweep &&
      (!trade.answers || trade.answers.sweep !== "yes")
    ) return false;
    return true;
  }

  function optionalNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function summarizeExamples(trades) {
    const records = Array.isArray(trades) ? trades : [];
    let closed = 0;
    let wins = 0;
    let losses = 0;
    let realizedCount = 0;
    let totalR = 0;

    records.forEach(function (trade) {
      const lifecycle = trade.lifecycle || {};
      const closeReview = trade.journal && trade.journal.closeReview || {};
      const realizedRr = optionalNumber(closeReview.realizedRr);
      if (lifecycle.status === "closed") closed += 1;
      if (lifecycle.outcome === "win") wins += 1;
      if (lifecycle.outcome === "loss") losses += 1;
      if (realizedRr !== null) {
        realizedCount += 1;
        totalR += realizedRr;
      }
    });

    return {
      total: records.length,
      closed,
      wins,
      losses,
      winRate: wins + losses ? Math.round((wins / (wins + losses)) * 100) : null,
      averageR: realizedCount ? Math.round((totalR / realizedCount) * 100) / 100 : null,
      realizedCount
    };
  }

  function tradeTimestamp(trade) {
    const value = trade && trade.lifecycle && trade.lifecycle.openedAt ||
      trade && trade.savedAt ||
      trade && trade.createdAt;
    const timestamp = Date.parse(value || "");
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  function formatDate(value) {
    const date = new Date(value || "");
    if (Number.isNaN(date.getTime())) return "--";
    return new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      dateStyle: "medium"
    }).format(date);
  }

  function formatR(value) {
    const number = optionalNumber(value);
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

  function initializePage() {
    const root = document.getElementById("playbookLibrary");
    if (!root) return;

    const storage = window.TradingStorage;
    const media = window.TradingMedia;
    const trades = storage.loadJournalTrades();
    const imageUrls = new Map();
    let imageGeneration = 0;
    let activeId = window.location.hash.slice(1);
    if (!PLAYBOOKS.some(function (playbook) {
      return playbook.id === activeId;
    })) activeId = PLAYBOOKS[0].id;

    const elements = {
      list: document.getElementById("playbookList"),
      name: document.getElementById("playbookName"),
      tier: document.getElementById("playbookTier"),
      description: document.getElementById("playbookDescription"),
      sequence: document.getElementById("playbookSequence"),
      total: document.getElementById("playbookTotal"),
      closed: document.getElementById("playbookClosed"),
      winRate: document.getElementById("playbookWinRate"),
      averageR: document.getElementById("playbookAverageR"),
      rules: document.getElementById("playbookRules"),
      invalidations: document.getElementById("playbookInvalidations"),
      checklist: document.getElementById("playbookChecklist"),
      checklistProgress: document.getElementById("playbookChecklistProgress"),
      checklistReset: document.getElementById("playbookChecklistReset"),
      noteForm: document.getElementById("playbookNotesForm"),
      personalRules: document.getElementById("playbookPersonalRules"),
      whatWorked: document.getElementById("playbookWhatWorked"),
      avoidNextTime: document.getElementById("playbookAvoidNextTime"),
      noteState: document.getElementById("playbookNoteState"),
      examples: document.getElementById("playbookExamples"),
      exampleEmpty: document.getElementById("playbookExampleEmpty"),
      exampleSummary: document.getElementById("playbookExampleSummary")
    };

    function activePlaybook() {
      return PLAYBOOKS.find(function (playbook) {
        return playbook.id === activeId;
      });
    }

    function matchingTrades(playbook) {
      return trades
        .filter(function (trade) {
          return matchesPlaybook(trade, playbook);
        })
        .sort(function (left, right) {
          return tradeTimestamp(right) - tradeTimestamp(left);
        });
    }

    function replaceList(list, values) {
      list.replaceChildren();
      values.forEach(function (value) {
        const item = document.createElement("li");
        item.textContent = value;
        list.appendChild(item);
      });
    }

    function renderLibrary() {
      elements.list.replaceChildren();
      PLAYBOOKS.forEach(function (playbook) {
        const evidence = matchingTrades(playbook);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "playbook-list-item";
        button.dataset.playbookId = playbook.id;
        button.dataset.active = playbook.id === activeId ? "true" : "false";

        const copy = document.createElement("span");
        const name = document.createElement("strong");
        name.textContent = playbook.name;
        const description = document.createElement("small");
        description.textContent = playbook.description;
        copy.append(name, description);

        const count = document.createElement("span");
        count.className = "playbook-list-count";
        count.textContent = String(evidence.length);
        count.title = `${evidence.length} matching trades`;
        button.append(copy, count);
        elements.list.appendChild(button);
      });
    }

    function renderSequence(playbook) {
      elements.sequence.replaceChildren();
      playbook.sequence.forEach(function (step, index) {
        const item = document.createElement("div");
        item.className = "playbook-sequence-step";
        const number = document.createElement("span");
        number.textContent = String(index + 1);
        const copy = document.createElement("strong");
        copy.textContent = step;
        item.append(number, copy);
        elements.sequence.appendChild(item);
      });
    }

    function renderChecklist(playbook) {
      elements.checklist.replaceChildren();
      playbook.checklist.forEach(function (text, index) {
        const labelElement = document.createElement("label");
        labelElement.className = "playbook-check";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.dataset.playbookCheck = String(index);
        const copy = document.createElement("span");
        copy.textContent = text;
        labelElement.append(input, copy);
        elements.checklist.appendChild(labelElement);
      });
      updateChecklistProgress();
    }

    function updateChecklistProgress() {
      const checks = elements.checklist.querySelectorAll("[data-playbook-check]");
      const complete = [...checks].filter(function (input) {
        return input.checked;
      }).length;
      elements.checklistProgress.textContent = `${complete} / ${checks.length}`;
      elements.checklistProgress.dataset.complete =
        checks.length && complete === checks.length ? "true" : "false";
    }

    function renderNotes(playbook) {
      const note = storage.loadPlaybookNote(playbook.id);
      elements.personalRules.value = note.personalRules;
      elements.whatWorked.value = note.whatWorked;
      elements.avoidNextTime.value = note.avoidNextTime;
      elements.noteState.textContent = note.updatedAt ?
        `บันทึกล่าสุด ${formatDate(note.updatedAt)}` : "ยังไม่มี Personal Notes";
      elements.noteState.dataset.state = note.updatedAt ? "saved" : "idle";
    }

    function clearImageUrls() {
      imageUrls.forEach(function (url) {
        URL.revokeObjectURL(url);
      });
      imageUrls.clear();
    }

    async function loadExampleImages(records, generation) {
      for (const trade of records) {
        if (!trade.journal || !trade.journal.screenshot) continue;
        try {
          const entry = await media.loadScreenshot(trade.id);
          if (!entry || generation !== imageGeneration) continue;
          const target = Array.from(
            elements.examples.querySelectorAll("[data-example-image]")
          ).find(
            (candidate) =>
              candidate.dataset.exampleImage === String(trade.id)
          );
          if (!target) continue;
          const url = URL.createObjectURL(entry.blob);
          imageUrls.set(String(trade.id), url);
          const image = document.createElement("img");
          image.src = url;
          image.alt = `${trade.instrument || "Trade"} Screenshot`;
          target.replaceChildren(image);
          target.dataset.state = "loaded";
        } catch (error) {
          // Keep the structure preview when a local Screenshot is unavailable.
        }
      }
    }

    function renderExamples(playbook, records) {
      clearImageUrls();
      imageGeneration += 1;
      const generation = imageGeneration;
      const selected = [
        ...records.filter(function (trade) {
          return trade.lifecycle && trade.lifecycle.outcome === "win";
        }).slice(0, 3),
        ...records.filter(function (trade) {
          return trade.lifecycle && trade.lifecycle.outcome === "loss";
        }).slice(0, 3)
      ];
      records.forEach(function (trade) {
        if (selected.length >= 6 || selected.includes(trade)) return;
        selected.push(trade);
      });

      elements.examples.replaceChildren();
      elements.exampleEmpty.hidden = selected.length !== 0;
      elements.exampleSummary.textContent =
        `${records.length} matching trades · ${selected.length} shown`;

      selected.forEach(function (trade) {
        const lifecycle = trade.lifecycle || {};
        const journal = storage.normalizeJournal(trade.journal);
        const card = document.createElement("article");
        card.className = "playbook-example";
        card.dataset.outcome = lifecycle.outcome || lifecycle.status || "open";

        const visual = document.createElement("a");
        visual.className = "playbook-example-visual";
        visual.dataset.exampleImage = String(trade.id);
        visual.href = `journal.html#trade-${encodeURIComponent(String(trade.id))}`;
        const fallback = document.createElement("span");
        fallback.textContent = playbook.sequence.slice(0, 3).join(" → ");
        visual.appendChild(fallback);

        const body = document.createElement("div");
        body.className = "playbook-example-body";
        const heading = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = trade.instrument || "Trade";
        const outcome = document.createElement("span");
        outcome.textContent = label(lifecycle.outcome || lifecycle.status);
        heading.append(title, outcome);

        const context = document.createElement("p");
        context.textContent =
          `${formatDate(lifecycle.openedAt || trade.savedAt)} · ` +
          `${label(trade.session)} · ${trade.result && trade.result.grade || "--"}`;

        const result = document.createElement("p");
        result.className = "playbook-example-result";
        result.textContent =
          `Planned ${formatR(trade.tradePlan && trade.tradePlan.plannedRr)} · ` +
          `Realized ${formatR(journal.closeReview.realizedRr)}`;

        const link = document.createElement("a");
        link.href = `journal.html#trade-${encodeURIComponent(String(trade.id))}`;
        link.textContent = "เปิด Journal";
        body.append(heading, context, result, link);
        card.append(visual, body);
        elements.examples.appendChild(card);
      });

      loadExampleImages(selected, generation);
    }

    function renderDetail() {
      const playbook = activePlaybook();
      const records = matchingTrades(playbook);
      const summary = summarizeExamples(records);
      elements.name.textContent = playbook.name;
      elements.tier.textContent = playbook.tier;
      elements.description.textContent = playbook.description;
      elements.total.textContent = String(summary.total);
      elements.closed.textContent = String(summary.closed);
      elements.winRate.textContent =
        summary.winRate === null ? "--" : `${summary.winRate}%`;
      elements.averageR.textContent =
        summary.averageR === null ? "--" : formatR(summary.averageR);
      renderSequence(playbook);
      replaceList(elements.rules, playbook.rules);
      replaceList(elements.invalidations, playbook.invalidations);
      renderChecklist(playbook);
      renderNotes(playbook);
      renderExamples(playbook, records);
    }

    function selectPlaybook(id) {
      if (!PLAYBOOKS.some(function (playbook) {
        return playbook.id === id;
      })) return;
      activeId = id;
      window.history.replaceState(null, "", `#${id}`);
      renderLibrary();
      renderDetail();
    }

    elements.list.addEventListener("click", function (event) {
      const button = event.target.closest("[data-playbook-id]");
      if (button) selectPlaybook(button.dataset.playbookId);
    });

    elements.checklist.addEventListener("change", updateChecklistProgress);
    elements.checklistReset.addEventListener("click", function () {
      elements.checklist.querySelectorAll("[data-playbook-check]").forEach(function (input) {
        input.checked = false;
      });
      updateChecklistProgress();
    });

    elements.noteForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const note = storage.savePlaybookNote(activeId, {
        personalRules: elements.personalRules.value,
        whatWorked: elements.whatWorked.value,
        avoidNextTime: elements.avoidNextTime.value
      });
      elements.noteState.textContent = note ?
        `บันทึกแล้ว ${formatDate(note.updatedAt)}` : "บันทึกไม่สำเร็จ";
      elements.noteState.dataset.state = note ? "saved" : "error";
    });

    window.addEventListener("beforeunload", clearImageUrls);
    renderLibrary();
    renderDetail();
  }

  window.TradingPlaybooks = {
    PLAYBOOKS,
    matchesPlaybook,
    summarizeExamples
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initializePage);
  }
})();
