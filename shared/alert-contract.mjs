export const ALERT_SCHEMA = "trading-companion.alert.v1";
export const INBOX_SCHEMA = "trading-companion.inbox.v1";
export const ALERT_STATES = [
  "no-trade",
  "waiting",
  "developing",
  "risk-review",
  "ready"
];
export const ALERT_NARRATIVES = ["bullish", "bearish", "neutral"];
export const ALERT_MODES = ["manual", "automatic"];
export const ALERT_GRADES = ["A+", "A", "B", "C", "D", "--", "NO TRADE"];
export const ALERT_DECISIONS = ["new", "wait", "skip", "review"];
export const ALERT_CHECKLIST = [
  ["htf", 20],
  ["poi", 15],
  ["liquidity", 15],
  ["structure", 15],
  ["cisd", 15],
  ["displacement", 10],
  ["entryFvg", 5],
  ["risk", 5]
];

export const ALERT_EXAMPLE = {
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

export function optionalNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function alertString(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function decodeAlertSnapshotCode(value) {
  const code = Number(value);
  if (!Number.isSafeInteger(code) || code < 0 || code > 33554431) {
    throw new Error("Trading Companion snapshot code ไม่ถูกต้อง");
  }

  const modeCode = code % 2;
  const narrativeCode = Math.floor(code / 2) % 4;
  const stateCode = Math.floor(code / 8) % 8;
  const score = Math.floor(code / 64) % 128;
  const gradeCode = Math.floor(code / 8192) % 8;
  const blocked = Math.floor(code / 65536) % 2 === 1;
  const checklistCode = Math.floor(code / 131072) % 256;
  const narratives = ["neutral", "bullish", "bearish"];
  const states = ["no-trade", "waiting", "developing", "risk-review", "ready"];
  const grades = ["--", "D", "C", "B", "A", "A+", "NO TRADE"];

  if (
    !narratives[narrativeCode] ||
    !states[stateCode] ||
    !grades[gradeCode] ||
    score > 100
  ) {
    throw new Error("Trading Companion snapshot code ใช้ค่าที่ไม่รองรับ");
  }

  const checklist = {};
  ALERT_CHECKLIST.forEach(function ([key], index) {
    checklist[key] = (checklistCode & (1 << index)) !== 0;
  });

  return {
    mode: modeCode === 1 ? "manual" : "automatic",
    narrative: narratives[narrativeCode],
    state: states[stateCode],
    score,
    grade: grades[gradeCode],
    blocked,
    checklist
  };
}

export function parseIndicatorAlert(value) {
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
  if (source.snapshotCode !== undefined && source.snapshotCode !== null) {
    source = {
      ...source,
      ...decodeAlertSnapshotCode(source.snapshotCode)
    };
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
  if (!Number.isInteger(score) || score < 0 || score > 100) {
    throw new Error("Score ต้องเป็นจำนวนเต็มระหว่าง 0 ถึง 100");
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
  if (mode === "manual") {
    const expectedScore = blocked ? 0 : ALERT_CHECKLIST.reduce(function (total, item) {
      return total + (checklist[item[0]] ? item[1] : 0);
    }, 0);
    if (expectedScore !== score) {
      throw new Error(`Manual Score ไม่ตรงกับ Checklist: ควรเป็น ${expectedScore}`);
    }
  }

  let time = Number(source.time);
  if (
    (!Number.isSafeInteger(time) || time <= 0) &&
    typeof source.time === "string"
  ) {
    time = Date.parse(source.time);
  }
  const occurredDate = new Date(time);
  if (
    !Number.isSafeInteger(time) ||
    time <= 0 ||
    Number.isNaN(occurredDate.getTime())
  ) {
    throw new Error("Alert time ไม่ถูกต้อง");
  }

  return {
    schema: ALERT_SCHEMA,
    source: "tradingview",
    indicator: "trading-os",
    indicatorVersion: alertString(source.indicatorVersion, 30),
    event: alertString(source.event, 400) || "TRADING OS SNAPSHOT",
    symbol,
    ticker,
    timeframe,
    time,
    occurredAt: occurredDate.toISOString(),
    mode,
    narrative,
    state,
    score,
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
}

export function indicatorAlertFingerprint(alert) {
  return [
    ALERT_SCHEMA,
    alert && alert.symbol || "",
    alert && alert.timeframe || "",
    alert && alert.time || "",
    alert && alert.event || ""
  ].join("|");
}

export function normalizeDecision(value) {
  return ALERT_DECISIONS.includes(value) ? value : "new";
}
