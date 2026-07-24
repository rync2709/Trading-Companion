(function () {
  "use strict";

  const STAGES = [
    { id: "htf", label: "HTF" },
    { id: "poi", label: "POI" },
    { id: "setup", label: "Setup" },
    { id: "confirm", label: "Confirm" },
    { id: "entry", label: "Entry" }
  ];

  function yesNoQuestion(id, stage, prompt, help, yesLabel, noLabel) {
    return {
      id,
      target: "answer",
      stage,
      prompt,
      help,
      options: [
        { value: "yes", label: yesLabel || "ใช่", continue: true },
        { value: "no", label: noLabel || "ไม่ใช่", continue: false },
        { value: "__unknown", label: "ยังไม่ชัด", continue: false }
      ]
    };
  }

  const QUESTIONS = [
    {
      id: "direction",
      target: "field",
      stage: "htf",
      prompt: "HTF Bias ของแผนนี้คืออะไร?",
      help: "ใช้ 4H และ 1H เป็นหลัก",
      options: [
        { value: "bullish", label: "Bullish", continue: true },
        { value: "bearish", label: "Bearish", continue: true },
        { value: "neutral", label: "No Bias", continue: false }
      ]
    },
    yesNoQuestion(
      "htfNarrative",
      "htf",
      "อธิบาย HTF Narrative ได้ชัดเจนหรือยัง?",
      "ต้องอธิบายเหตุผลได้ ไม่ใช่เลือกทิศทางจากความรู้สึก",
      "ชัดเจน",
      "ยังอธิบายไม่ได้"
    ),
    yesNoQuestion(
      "htfAligned",
      "htf",
      "4H และ 1H สอดคล้องกับ Trade Direction หรือไม่?",
      "Timeframe ที่ขัดแย้งกันเป็น Blocking condition",
      "สอดคล้อง",
      "ขัดแย้ง"
    ),
    yesNoQuestion(
      "priceLocation",
      "htf",
      "ราคาอยู่ใน Premium / Discount ที่สนับสนุนแผนหรือไม่?",
      "หลีกเลี่ยงการเปิดแผนกลาง Range",
      "อยู่ในตำแหน่ง",
      "ผิดตำแหน่ง"
    ),
    yesNoQuestion(
      "poiPresent",
      "poi",
      "มี HTF POI ที่ชัดเจนหรือไม่?",
      "FVG, Order Block, Breaker หรือ Liquidity Area",
      "มี",
      "ยังไม่มี"
    ),
    yesNoQuestion(
      "poiReached",
      "poi",
      "ราคาแตะหรือเข้าใกล้ POI แล้วหรือยัง?",
      "หากยังไม่ถึง ให้รอโดยไม่ลดเงื่อนไข",
      "ถึงแล้ว",
      "ยังไม่ถึง"
    ),
    yesNoQuestion(
      "poiValid",
      "poi",
      "POI ยัง Valid อยู่หรือไม่?",
      "POI ที่ถูก Invalidate แล้วไม่ควรถูกนำกลับมาใช้",
      "Valid",
      "Invalid"
    ),
    yesNoQuestion(
      "notChasing",
      "poi",
      "Entry นี้ไม่ได้ไล่ราคาหลัง Move เกิดขึ้นแล้วใช่หรือไม่?",
      "รอ Pullback เมื่อราคาออกจาก POI ไปแล้ว",
      "ไม่ได้ไล่ราคา",
      "กำลังไล่ราคา"
    ),
    {
      id: "setupType",
      target: "field",
      stage: "setup",
      prompt: "Setup นี้เป็นแบบใด?",
      help: "ประเภท Setup กำหนด Structure Confirmation ที่ต้องใช้",
      options: [
        { value: "reversal", label: "Reversal", continue: true },
        { value: "continuation", label: "Continuation", continue: true },
        { value: "__unknown", label: "ยังไม่ชัด", continue: false }
      ]
    },
    yesNoQuestion(
      "ltfMapped",
      "setup",
      "กำหนด LTF Structure ก่อนหน้าได้แล้วหรือยัง?",
      "ต้องรู้ Swing และโครงสร้างที่ราคาจะต้องเปลี่ยนหรือทำต่อ",
      "ได้แล้ว",
      "ยังไม่ได้"
    ),
    yesNoQuestion(
      "liquidityTarget",
      "setup",
      "มี Liquidity Target ที่เหมาะสมหรือไม่?",
      "Session high/low, PDH/PDL หรือ equal highs/lows",
      "มี",
      "ยังไม่มี"
    ),
    yesNoQuestion(
      "sweep",
      "confirm",
      "มี Liquidity Sweep / Raid ที่สนับสนุน Direction แล้วหรือยัง?",
      "Sweep ควรสัมพันธ์กับ POI และแผนเดียวกัน",
      "มีแล้ว",
      "ยังไม่มี"
    ),
    yesNoQuestion(
      "structureShift",
      "confirm",
      "เกิด MSS / CHOCH / BOS ไปทางเดียวกับแผนแล้วหรือยัง?",
      "ใช้ MSS/CHOCH สำหรับ Reversal และ BOS สำหรับ Continuation",
      "เกิดแล้ว",
      "ยังไม่เกิด"
    ),
    yesNoQuestion(
      "cisd",
      "confirm",
      "เกิด CISD ไปทางเดียวกับ Trade Direction แล้วหรือยัง?",
      "CISD ต้องมี Context และ Follow-through",
      "เกิดแล้ว",
      "ยังไม่เกิด"
    ),
    yesNoQuestion(
      "setupWindow",
      "confirm",
      "Confirmation ทั้งหมดอยู่ใน Setup Window เดียวกันหรือไม่?",
      "เหตุการณ์ที่ห่างกันจนเป็นคนละ Idea ต้องเริ่มประเมินใหม่",
      "อยู่ใน Setup เดียวกัน",
      "คนละ Setup"
    ),
    yesNoQuestion(
      "displacement",
      "entry",
      "มี Displacement ที่ชัดเจนหรือไม่?",
      "Body และ Range ควรขยายพร้อมปิดผ่าน Structure",
      "มี",
      "ยังไม่มี"
    ),
    yesNoQuestion(
      "displacementClean",
      "entry",
      "Displacement มี Follow-through และไม่ใช่เพียง News Wick ใช่หรือไม่?",
      "แท่งใหญ่ที่ไม่มีการไปต่อไม่ใช่ Strong Displacement",
      "มี Follow-through",
      "ไม่มี Follow-through"
    ),
    yesNoQuestion(
      "validFvg",
      "entry",
      "Displacement สร้าง FVG ที่ยัง Valid หรือไม่?",
      "ใช้ FVG ที่เกิดจาก Intent เดียวกับ Setup",
      "Valid",
      "ยังไม่มี / Invalid"
    ),
    yesNoQuestion(
      "retrace",
      "entry",
      "ราคากลับมา Retrace เข้า Entry Zone แล้วหรือยัง?",
      "ไม่เข้าเทรดกลาง Move โดยไม่มี Pullback",
      "Retrace แล้ว",
      "ยังไม่ Retrace"
    ),
    yesNoQuestion(
      "entryTrigger",
      "entry",
      "มี Entry Trigger บน Execution TF หรือไม่?",
      "Sweep, MSS/BOS หรือ Reaction ที่กำหนดไว้ในแผน",
      "มี Trigger",
      "ยังไม่มี"
    ),
    yesNoQuestion(
      "slValid",
      "entry",
      "Stop Loss อยู่ที่จุดที่ Setup ถูก Invalidate จริงหรือไม่?",
      "SL ต้องสะท้อนความผิดของ Trade Idea",
      "อยู่ที่ Invalidation",
      "ไม่ใช่"
    ),
    yesNoQuestion(
      "rrValid",
      "entry",
      "RR ผ่านเกณฑ์ขั้นต่ำของแผนหรือไม่?",
      "RR ไม่ผ่านเป็น Blocking condition",
      "ผ่าน",
      "ไม่ผ่าน"
    ),
    yesNoQuestion(
      "emotionalClear",
      "entry",
      "การตัดสินใจนี้ปลอดจาก FOMO / Revenge Trade หรือไม่?",
      "ตอบตามจริงก่อนพิจารณา Execute",
      "ปลอด",
      "ไม่ปลอด"
    )
  ];

  function applyQuestionAnswer(draft, question, value) {
    const next = {
      ...draft,
      answers: { ...(draft.answers || {}) }
    };
    if (!question || value === "__unknown") return next;
    if (question.target === "field") {
      next[question.id] = value;
    } else {
      next.answers[question.id] = value;
    }
    return next;
  }

  function clearQuestionAnswer(draft, question) {
    const next = {
      ...draft,
      answers: { ...(draft.answers || {}) }
    };
    if (!question) return next;
    if (question.target === "field") {
      next[question.id] = "";
    } else {
      delete next.answers[question.id];
    }
    return next;
  }

  function getAssistantVerdict(evaluation) {
    if (evaluation.blockers.length) {
      return {
        state: "no-trade",
        label: "NO TRADE",
        title: "หยุดแผนนี้",
        summary: evaluation.blockers[0]
      };
    }
    if (evaluation.state === "ready") {
      return {
        state: "ready",
        label: "READY",
        title: `${evaluation.grade} READY`,
        summary: "Confirmation ครบตาม Rulebook ตรวจราคาจริงและ Risk ก่อน Execute"
      };
    }
    return {
      state: evaluation.state === "developing" ? "developing" : "waiting",
      label: "WAIT",
      title: "ยังไม่พร้อมเข้าเทรด",
      summary: evaluation.nextAction
    };
  }

  function createMessage(role, label, text) {
    const message = document.createElement("div");
    message.className = "assistant-message";
    message.dataset.role = role;

    const sender = document.createElement("span");
    sender.className = "assistant-message-sender";
    sender.textContent = label;

    const copy = document.createElement("p");
    copy.textContent = text;
    message.append(sender, copy);
    return message;
  }

  function initializePage() {
    const root = document.getElementById("decisionAssistant");
    if (!root) return;

    const storage = window.TradingStorage;
    const logic = window.TradingLogic;
    let session = storage.loadAssistantSession() || {
      draft: storage.createDraft(),
      currentIndex: 0,
      answerLog: [],
      completed: false,
      haltReason: ""
    };
    if (session.currentIndex >= QUESTIONS.length) {
      session.currentIndex = QUESTIONS.length - 1;
      session.completed = true;
      session.haltReason = "complete";
    }

    const elements = {
      instrument: document.getElementById("assistantInstrument"),
      marketSession: document.getElementById("assistantSession"),
      saveState: document.getElementById("assistantSaveState"),
      reset: document.getElementById("assistantReset"),
      stages: document.getElementById("assistantStages"),
      thread: document.getElementById("assistantThread"),
      questionStage: document.getElementById("assistantQuestionStage"),
      questionHelp: document.getElementById("assistantQuestionHelp"),
      choices: document.getElementById("assistantChoices"),
      back: document.getElementById("assistantBack"),
      completeActions: document.getElementById("assistantCompleteActions"),
      revise: document.getElementById("assistantRevise"),
      verdictStatus: document.getElementById("assistantVerdictStatus"),
      verdictTitle: document.getElementById("assistantVerdictTitle"),
      verdictSummary: document.getElementById("assistantVerdictSummary"),
      grade: document.getElementById("assistantGrade"),
      score: document.getElementById("assistantScore"),
      answered: document.getElementById("assistantAnswered"),
      progress: document.getElementById("assistantProgress"),
      nextAction: document.getElementById("assistantNextAction"),
      blockers: document.getElementById("assistantBlockers"),
      transfer: document.getElementById("assistantTransfer")
    };

    function saveSession() {
      session = storage.saveAssistantSession(session);
      elements.saveState.textContent = "บันทึกในเครื่องแล้ว";
    }

    function currentQuestion() {
      return QUESTIONS[Math.min(session.currentIndex, QUESTIONS.length - 1)];
    }

    function renderStages(evaluation) {
      elements.stages.replaceChildren();
      const activeQuestion = currentQuestion();
      STAGES.forEach(function (stage, index) {
        const item = document.createElement("div");
        item.className = "assistant-stage";
        const evaluationStep = evaluation.steps[index];
        item.dataset.state = evaluationStep.complete ? "complete" :
          activeQuestion && activeQuestion.stage === stage.id && !session.completed ?
            "active" : "waiting";

        const number = document.createElement("span");
        number.textContent = String(index + 1);
        const label = document.createElement("strong");
        label.textContent = stage.label;
        item.append(number, label);
        elements.stages.appendChild(item);
      });
    }

    function renderThread(verdict) {
      elements.thread.replaceChildren();
      elements.thread.appendChild(
        createMessage("assistant", "Trading OS", "Should I trade?")
      );

      session.answerLog.forEach(function (entry) {
        const question = QUESTIONS.find(function (item) {
          return item.id === entry.questionId;
        });
        if (!question) return;
        elements.thread.appendChild(
          createMessage("assistant", "Trading OS", question.prompt)
        );
        elements.thread.appendChild(
          createMessage("trader", "Trader", entry.label)
        );
      });

      if (session.completed) {
        elements.thread.appendChild(
          createMessage("assistant", verdict.label, `${verdict.title}: ${verdict.summary}`)
        );
      } else {
        elements.thread.appendChild(
          createMessage("assistant", "Trading OS", currentQuestion().prompt)
        );
      }

      window.requestAnimationFrame(function () {
        elements.thread.scrollTop = elements.thread.scrollHeight;
      });
    }

    function renderQuestion() {
      const question = currentQuestion();
      elements.questionStage.textContent =
        `${STAGES.find((stage) => stage.id === question.stage).label} · ` +
        `${session.answerLog.length + 1} / ${QUESTIONS.length}`;
      elements.questionHelp.textContent = question.help;
      elements.choices.replaceChildren();

      question.options.forEach(function (option) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "assistant-choice";
        button.dataset.assistantOption = option.value;
        button.dataset.intent = option.continue ? "continue" :
          option.value === "__unknown" ? "unknown" : "stop";
        button.textContent = option.label;
        elements.choices.appendChild(button);
      });

      elements.choices.hidden = session.completed;
      elements.questionHelp.hidden = session.completed;
      elements.questionStage.hidden = session.completed;
      elements.back.hidden = session.completed;
      elements.back.disabled = session.answerLog.length === 0;
      elements.completeActions.hidden = !session.completed;
      elements.revise.disabled = session.answerLog.length === 0;
    }

    function renderResult(evaluation, verdict) {
      elements.verdictStatus.dataset.state = verdict.state;
      elements.verdictStatus.querySelector(".pill-copy").textContent = verdict.label;
      elements.verdictTitle.textContent = verdict.title;
      elements.verdictSummary.textContent = verdict.summary;
      elements.grade.textContent = evaluation.grade;
      elements.grade.dataset.grade = evaluation.grade === "NO TRADE" ?
        "no-trade" : evaluation.grade.toLowerCase();
      elements.score.textContent = `${evaluation.score} / 100`;
      elements.answered.textContent = `${session.answerLog.length} / ${QUESTIONS.length}`;
      elements.progress.style.width = `${evaluation.progress.percent}%`;
      elements.nextAction.textContent = evaluation.nextAction;
      elements.transfer.disabled = session.answerLog.length === 0;

      elements.blockers.replaceChildren();
      const blockers = evaluation.blockers.length ?
        evaluation.blockers : ["ยังไม่พบ Blocking condition"];
      blockers.forEach(function (blocker) {
        const item = document.createElement("li");
        item.textContent = blocker;
        elements.blockers.appendChild(item);
      });
    }

    function render() {
      const evaluation = logic.evaluate(session.draft);
      const verdict = getAssistantVerdict(evaluation);
      elements.instrument.value = session.draft.instrument;
      elements.marketSession.value = session.draft.session;
      renderStages(evaluation);
      renderThread(verdict);
      renderQuestion();
      renderResult(evaluation, verdict);
    }

    function answerCurrentQuestion(value) {
      const question = currentQuestion();
      const option = question.options.find(function (item) {
        return item.value === value;
      });
      if (!option) return;

      session.draft = applyQuestionAnswer(session.draft, question, option.value);
      session.answerLog = [
        ...session.answerLog,
        {
          questionId: question.id,
          value: option.value,
          label: option.label
        }
      ];

      if (!option.continue) {
        session.completed = true;
        session.haltReason = option.value === "__unknown" ? "unknown" : "negative";
      } else if (session.currentIndex >= QUESTIONS.length - 1) {
        session.completed = true;
        session.haltReason = "complete";
      } else {
        session.currentIndex += 1;
        session.completed = false;
        session.haltReason = "";
      }
      saveSession();
      render();
    }

    function reviseLastAnswer() {
      const last = session.answerLog[session.answerLog.length - 1];
      if (!last) return;
      const questionIndex = QUESTIONS.findIndex(function (question) {
        return question.id === last.questionId;
      });
      if (questionIndex < 0) return;

      session.answerLog = session.answerLog.slice(0, -1);
      session.draft = clearQuestionAnswer(session.draft, QUESTIONS[questionIndex]);
      session.currentIndex = questionIndex;
      session.completed = false;
      session.haltReason = "";
      saveSession();
      render();
    }

    elements.choices.addEventListener("click", function (event) {
      const button = event.target.closest("[data-assistant-option]");
      if (button) answerCurrentQuestion(button.dataset.assistantOption);
    });

    elements.back.addEventListener("click", reviseLastAnswer);
    elements.revise.addEventListener("click", reviseLastAnswer);

    elements.instrument.addEventListener("change", function (event) {
      session.draft.instrument = event.target.value;
      saveSession();
      render();
    });

    elements.marketSession.addEventListener("change", function (event) {
      session.draft.session = event.target.value;
      saveSession();
      render();
    });

    elements.reset.addEventListener("click", function () {
      if (
        session.answerLog.length &&
        !window.confirm("เริ่ม Decision Assistant ใหม่และล้างคำตอบปัจจุบันหรือไม่?")
      ) return;
      storage.clearAssistantSession();
      session = {
        draft: storage.createDraft(),
        currentIndex: 0,
        answerLog: [],
        completed: false,
        haltReason: ""
      };
      saveSession();
      render();
    });

    elements.transfer.addEventListener("click", function () {
      const existingDraft = storage.loadDraft();
      if (
        existingDraft &&
        storage.hasMeaningfulDraft(existingDraft) &&
        existingDraft.id !== session.draft.id &&
        !window.confirm("ใช้คำตอบจาก Decision Assistant แทน Draft ใน New Trade หรือไม่?")
      ) return;

      const evaluation = logic.evaluate(session.draft);
      const firstIncomplete = evaluation.steps.findIndex(function (step) {
        return !step.complete;
      });
      session.draft.currentStep = firstIncomplete < 0 ? 4 : firstIncomplete;
      storage.saveDraft(session.draft);
      window.location.href = "trade.html";
    });

    saveSession();
    render();
  }

  window.TradingAssistant = {
    STAGES,
    QUESTIONS,
    applyQuestionAnswer,
    clearQuestionAnswer,
    getAssistantVerdict
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initializePage);
  }
})();
