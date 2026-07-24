(function () {
  "use strict";

  const TIME_ZONE = "Asia/Bangkok";
  const CURRENCIES = ["USD", "THB", "EUR", "GBP", "JPY", "AUD", "SGD", "USDT"];
  const SESSION_WINDOWS = [
    { start: 0, end: 2 * 3600, key: "new-york", label: "New York", next: "Off Session" },
    { start: 2 * 3600, end: 7 * 3600, key: "off", label: "Off Session", next: "Asia" },
    { start: 7 * 3600, end: 14 * 3600, key: "asia", label: "Asia", next: "London" },
    { start: 14 * 3600, end: 19 * 3600, key: "london", label: "London", next: "London / New York" },
    {
      start: 19 * 3600,
      end: 21 * 3600,
      key: "overlap",
      label: "London / New York",
      next: "New York"
    },
    {
      start: 21 * 3600,
      end: 26 * 3600,
      key: "new-york",
      label: "New York",
      next: "Off Session"
    }
  ];

  function toNumber(value) {
    if (value === null || value === undefined || String(value).trim() === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function round(value, digits) {
    if (!Number.isFinite(value)) return null;
    const scale = 10 ** (digits === undefined ? 8 : digits);
    return Math.round((value + Number.EPSILON) * scale) / scale;
  }

  function calculateRiskReward(input) {
    const source = input && typeof input === "object" ? input : {};
    const direction = ["bullish", "bearish"].includes(source.direction) ?
      source.direction : "";
    const entry = toNumber(source.entry);
    const stopLoss = toNumber(source.stopLoss);
    const takeProfit = toNumber(source.takeProfit);
    const complete = Boolean(direction) &&
      [entry, stopLoss, takeProfit].every((value) => value !== null);

    if (!complete) {
      return {
        complete: false,
        valid: false,
        riskDistance: null,
        rewardDistance: null,
        ratio: null,
        breakEvenWinRate: null,
        message: "กรอก Direction, Entry, Stop Loss และ Take Profit ให้ครบ"
      };
    }

    if (entry <= 0 || stopLoss <= 0 || takeProfit <= 0) {
      return {
        complete: true,
        valid: false,
        riskDistance: null,
        rewardDistance: null,
        ratio: null,
        breakEvenWinRate: null,
        message: "ราคาทุกช่องต้องมากกว่า 0"
      };
    }

    const riskDistance = Math.abs(entry - stopLoss);
    const rewardDistance = direction === "bullish" ?
      takeProfit - entry : entry - takeProfit;
    const stopIsValid = direction === "bullish" ?
      stopLoss < entry : stopLoss > entry;
    const targetIsValid = rewardDistance > 0;

    if (!riskDistance || !stopIsValid || !targetIsValid) {
      return {
        complete: true,
        valid: false,
        riskDistance: round(riskDistance),
        rewardDistance: round(Math.max(rewardDistance, 0)),
        ratio: null,
        breakEvenWinRate: null,
        message: "ตำแหน่ง Stop Loss หรือ Take Profit ไม่สอดคล้องกับ Direction"
      };
    }

    const ratio = rewardDistance / riskDistance;
    return {
      complete: true,
      valid: true,
      riskDistance: round(riskDistance),
      rewardDistance: round(rewardDistance),
      ratio: round(ratio, 4),
      breakEvenWinRate: round(100 / (1 + ratio), 2),
      message: ratio >= 2 ?
        "RR ผ่านเกณฑ์อ้างอิง 1:2" : "RR ต่ำกว่าเกณฑ์อ้างอิง 1:2"
    };
  }

  function calculatePositionSize(input) {
    const source = input && typeof input === "object" ? input : {};
    const accountBalance = toNumber(source.accountBalance);
    const riskPercent = toNumber(source.riskPercent);
    const entry = toNumber(source.entry);
    const stopLoss = toNumber(source.stopLoss);
    const valuePerMove = toNumber(source.valuePerMove);
    const complete = [accountBalance, riskPercent, entry, stopLoss, valuePerMove]
      .every((value) => value !== null);

    if (!complete) {
      return {
        complete: false,
        valid: false,
        riskAmount: null,
        stopDistance: null,
        lossPerSizeUnit: null,
        positionSize: null,
        message: "กรอกข้อมูลให้ครบเพื่อคำนวณขนาด Position"
      };
    }

    if (
      accountBalance <= 0 ||
      riskPercent <= 0 ||
      riskPercent > 100 ||
      entry <= 0 ||
      stopLoss <= 0 ||
      valuePerMove <= 0
    ) {
      return {
        complete: true,
        valid: false,
        riskAmount: null,
        stopDistance: null,
        lossPerSizeUnit: null,
        positionSize: null,
        message: "ตรวจ Balance, ราคา, Value per Move และกำหนด Risk % ระหว่าง 0 ถึง 100"
      };
    }

    const stopDistance = Math.abs(entry - stopLoss);
    if (!stopDistance) {
      return {
        complete: true,
        valid: false,
        riskAmount: null,
        stopDistance: 0,
        lossPerSizeUnit: null,
        positionSize: null,
        message: "Entry และ Stop Loss ต้องไม่ใช่ราคาเดียวกัน"
      };
    }

    const riskAmount = accountBalance * riskPercent / 100;
    const lossPerSizeUnit = stopDistance * valuePerMove;
    const positionSize = riskAmount / lossPerSizeUnit;
    return {
      complete: true,
      valid: true,
      riskAmount: round(riskAmount),
      stopDistance: round(stopDistance),
      lossPerSizeUnit: round(lossPerSizeUnit),
      positionSize: round(positionSize),
      message: "ตรวจ Contract Specification ของโบรกเกอร์ก่อนส่งคำสั่ง"
    };
  }

  function calculateConversion(input) {
    const source = input && typeof input === "object" ? input : {};
    const amount = toNumber(source.amount);
    const rate = toNumber(source.rate);
    const from = CURRENCIES.includes(source.from) ? source.from : "";
    const to = CURRENCIES.includes(source.to) ? source.to : "";
    const currenciesComplete = Boolean(from && to);
    const complete = amount !== null &&
      currenciesComplete &&
      (from === to || rate !== null);

    if (!complete) {
      return {
        complete: false,
        valid: false,
        converted: null,
        message: "กรอก Amount และ Exchange Rate ที่ตรวจสอบแล้ว"
      };
    }

    if (amount < 0 || (from !== to && rate <= 0)) {
      return {
        complete: true,
        valid: false,
        converted: null,
        message: "Amount ต้องไม่ติดลบ และ Exchange Rate ต้องมากกว่า 0"
      };
    }

    if (from === to) {
      return {
        complete: true,
        valid: true,
        converted: round(amount),
        message: `${from} และ ${to} เป็นสกุลเงินเดียวกัน`
      };
    }

    return {
      complete: true,
      valid: true,
      converted: round(amount * rate),
      message: `ใช้อัตรา 1 ${from} = ${rate} ${to}`
    };
  }

  function getBangkokTimeParts(value) {
    const date = value instanceof Date ? value : new Date(value === undefined ? Date.now() : value);
    if (!Number.isFinite(date.getTime())) return null;
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date);
    const result = {};
    parts.forEach(function (part) {
      if (["hour", "minute", "second"].includes(part.type)) {
        result[part.type] = Number(part.value);
      }
    });
    return [result.hour, result.minute, result.second].every(Number.isFinite) ? result : null;
  }

  function getSessionTimer(value) {
    const date = value instanceof Date ? value : new Date(value === undefined ? Date.now() : value);
    const parts = getBangkokTimeParts(date);
    if (!parts) return null;
    const seconds = parts.hour * 3600 + parts.minute * 60 + parts.second;
    const session = SESSION_WINDOWS.find(function (window) {
      if (window.end > 24 * 3600) return seconds >= window.start;
      return seconds >= window.start && seconds < window.end;
    });
    if (!session) return null;
    const countdownSeconds = session.end - seconds;
    return {
      key: session.key,
      label: session.label,
      nextLabel: session.next,
      countdownSeconds,
      timeLabel: new Intl.DateTimeFormat("th-TH", {
        timeZone: TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
      }).format(date)
    };
  }

  function formatNumber(value, maximumFractionDigits) {
    if (!Number.isFinite(value)) return "--";
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: maximumFractionDigits === undefined ? 4 : maximumFractionDigits
    }).format(value);
  }

  function formatCountdown(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "--:--:--";
    const whole = Math.floor(seconds);
    const hours = Math.floor(whole / 3600);
    const minutes = Math.floor((whole % 3600) / 60);
    const remainingSeconds = whole % 60;
    return [hours, minutes, remainingSeconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  }

  function setResultState(element, state, label) {
    element.dataset.state = state;
    element.querySelector(".pill-copy").textContent = label;
  }

  function initializePage() {
    const rrForm = document.getElementById("rrCalculator");
    if (!rrForm) return;

    const rrElements = {
      status: document.getElementById("rrStatus"),
      value: document.getElementById("rrValue"),
      risk: document.getElementById("rrRiskDistance"),
      reward: document.getElementById("rrRewardDistance"),
      breakEven: document.getElementById("rrBreakEven"),
      message: document.getElementById("rrMessage")
    };
    const positionForm = document.getElementById("positionCalculator");
    const positionElements = {
      status: document.getElementById("positionStatus"),
      value: document.getElementById("positionValue"),
      riskAmount: document.getElementById("positionRiskAmount"),
      stopDistance: document.getElementById("positionStopDistance"),
      lossPerUnit: document.getElementById("positionLossPerUnit"),
      message: document.getElementById("positionMessage")
    };
    const currencyForm = document.getElementById("currencyCalculator");
    const currencyElements = {
      status: document.getElementById("currencyStatus"),
      value: document.getElementById("currencyValue"),
      rate: document.getElementById("currencyRateLabel"),
      message: document.getElementById("currencyMessage")
    };

    function renderRiskReward() {
      const checkedDirection = rrForm.querySelector('input[name="rrDirection"]:checked');
      const result = calculateRiskReward({
        direction: checkedDirection ? checkedDirection.value : "",
        entry: rrForm.elements.entry.value,
        stopLoss: rrForm.elements.stopLoss.value,
        takeProfit: rrForm.elements.takeProfit.value
      });
      const state = result.valid ? (result.ratio >= 2 ? "ready" : "developing") :
        result.complete ? "no-trade" : "waiting";
      setResultState(
        rrElements.status,
        state,
        result.valid ? (result.ratio >= 2 ? "RR VALID" : "RR BELOW 1:2") :
          result.complete ? "INVALID LEVELS" : "WAITING FOR INPUT"
      );
      rrElements.value.textContent = result.valid ? `1:${formatNumber(result.ratio, 2)}` : "1:--";
      rrElements.risk.textContent = formatNumber(result.riskDistance);
      rrElements.reward.textContent = formatNumber(result.rewardDistance);
      rrElements.breakEven.textContent = result.breakEvenWinRate === null ?
        "--" : `${formatNumber(result.breakEvenWinRate, 2)}%`;
      rrElements.message.textContent = result.message;
    }

    function renderPositionSize() {
      const currency = positionForm.elements.currency.value;
      const result = calculatePositionSize({
        accountBalance: positionForm.elements.accountBalance.value,
        riskPercent: positionForm.elements.riskPercent.value,
        entry: positionForm.elements.entry.value,
        stopLoss: positionForm.elements.stopLoss.value,
        valuePerMove: positionForm.elements.valuePerMove.value
      });
      setResultState(
        positionElements.status,
        result.valid ? "ready" : result.complete ? "no-trade" : "waiting",
        result.valid ? "SIZE CALCULATED" :
          result.complete ? "INVALID INPUT" : "WAITING FOR INPUT"
      );
      positionElements.value.textContent = formatNumber(result.positionSize, 6);
      positionElements.riskAmount.textContent = result.riskAmount === null ?
        `-- ${currency}` : `${formatNumber(result.riskAmount, 2)} ${currency}`;
      positionElements.stopDistance.textContent = formatNumber(result.stopDistance);
      positionElements.lossPerUnit.textContent = result.lossPerSizeUnit === null ?
        `-- ${currency}` : `${formatNumber(result.lossPerSizeUnit, 4)} ${currency}`;
      positionElements.message.textContent = result.message;
    }

    function renderCurrency() {
      const from = currencyForm.elements.from.value;
      const to = currencyForm.elements.to.value;
      const rate = toNumber(currencyForm.elements.rate.value);
      const result = calculateConversion({
        amount: currencyForm.elements.amount.value,
        rate: currencyForm.elements.rate.value,
        from,
        to
      });
      setResultState(
        currencyElements.status,
        result.valid ? "ready" : result.complete ? "no-trade" : "waiting",
        result.valid ? "CONVERTED" :
          result.complete ? "INVALID RATE" : "MANUAL RATE REQUIRED"
      );
      currencyElements.value.textContent = result.converted === null ?
        `-- ${to}` : `${formatNumber(result.converted, 4)} ${to}`;
      currencyElements.rate.textContent = from === to ?
        `1 ${from} = 1 ${to}` :
        rate && from && to ?
          `1 ${from} = ${formatNumber(rate, 8)} ${to}` : "ยังไม่ได้ระบุ Exchange Rate";
      currencyElements.message.textContent = result.message;
    }

    function renderSession() {
      const session = getSessionTimer();
      if (!session) return;
      const sessionStatus = document.getElementById("sessionTimerStatus");
      setResultState(
        sessionStatus,
        session.key === "off" ? "waiting" : "open",
        session.key === "off" ? "OFF SESSION" : "MARKET SESSION"
      );
      document.getElementById("sessionTimerName").textContent = session.label;
      document.getElementById("sessionBangkokTime").textContent = session.timeLabel;
      document.getElementById("sessionNextName").textContent = session.nextLabel;
      document.getElementById("sessionCountdown").textContent =
        formatCountdown(session.countdownSeconds);
    }

    rrForm.addEventListener("input", renderRiskReward);
    positionForm.addEventListener("input", renderPositionSize);
    currencyForm.addEventListener("input", renderCurrency);
    document.getElementById("swapCurrencies").addEventListener("click", function () {
      const from = currencyForm.elements.from.value;
      const to = currencyForm.elements.to.value;
      const rate = toNumber(currencyForm.elements.rate.value);
      currencyForm.elements.from.value = to;
      currencyForm.elements.to.value = from;
      currencyForm.elements.rate.value = rate && rate > 0 ?
        String(round(1 / rate, 8)) : "";
      renderCurrency();
    });

    renderRiskReward();
    renderPositionSize();
    renderCurrency();
    renderSession();
    window.setInterval(renderSession, 1000);
  }

  window.TradingTools = {
    TIME_ZONE,
    CURRENCIES,
    calculateRiskReward,
    calculatePositionSize,
    calculateConversion,
    getSessionTimer,
    formatNumber,
    formatCountdown
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initializePage);
  }
})();
