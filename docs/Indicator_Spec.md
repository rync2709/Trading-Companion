# Trading OS Indicator Specification

Version: v0.3.9
Phase: Pine Track - Modules 1, 2, 4, Internal/Swing Structure, chart Order Blocks, CISD, Displacement, Entry FVG, Risk / Entry, Manual/Automatic Score, Alert JSON, HTF Order Block, and Breaker baselines

## Purpose

This document converts the Trading OS rulebook into module-level requirements for future automation. The current checklist remains manual. Pine Script implementation starts only after the rules and module outputs are clear.

## Design Principles

- The indicator should support decisions, not blindly call buy or sell.
- Every signal must be explainable by a rulebook condition.
- Modules should produce states that can be shown in the web checklist and reused in Pine Script.
- Missing confirmation should return WAIT or NO TRADE, not force a signal.

## State Model

| State | Description |
| --- | --- |
| NO_TRADE | Invalid context or blocked setup |
| WAITING | Setup not active yet |
| DEVELOPING | Conditions are forming but incomplete |
| READY | Required conditions and risk checks are complete |

## Direction Model

| Direction | Description |
| --- | --- |
| BULLISH | Long-side idea |
| BEARISH | Short-side idea |
| NEUTRAL | No clear directional edge |

## Module 1 - HTF Bias

Implementation status: `Pine v0.1.0-alpha`

Input:

- 4H structure
- 1H structure
- Swing highs and lows
- Premium/discount context
- Recent displacement direction

Process:

- Identify whether 4H and 1H support bullish, bearish, or neutral context.
- Flag conflict when 4H and 1H are not aligned.
- Do not allow LTF signals to override HTF context.

Output:

- bias: BULLISH, BEARISH, or NEUTRAL
- confidence: low, medium, or high
- conflict: true or false

Initial structure heuristic:

- Confirm swing highs and lows with a configurable symmetric pivot length.
- Higher High and Higher Low produce BULLISH structure.
- Lower High and Lower Low produce BEARISH structure.
- Mixed or incomplete structure produces NEUTRAL.
- Matching directional 4H and 1H states produce high confidence.
- Directional 4H with neutral 1H produces medium confidence.
- Opposite directional states produce conflict and a neutral combined bias.
- Neutral 4H cannot be overridden by directional 1H.

Confirmation rule:

- Use the previous completed HTF state for chart output.
- Do not use a still-forming HTF bar as confirmed structure.
- Accept intentional lag from pivot confirmation and the completed-bar offset.

Not included in the first heuristic:

- Premium/discount context
- Recent displacement direction
- HTF POI quality
- Manual narrative override

These inputs remain required for later confidence calibration and should not be implied by the first Pine output.

## Module 2 - HTF POI

Implementation status: `Pine v0.12.0-alpha - FVG candidate plus latest 4H/1H Order Block and Breaker chart context`

Input:

- HTF FVG zones
- Order blocks
- Breaker or mitigation zones
- Liquidity areas
- Premium/discount zones
- Current price

Process:

- Detect whether price is inside or near a planned POI.
- Mark whether the POI is fresh, mitigated, or invalid.
- Check whether the POI supports the selected trade direction.

Output:

- poi_active: true or false
- poi_type: FVG, OB, BREAKER, LIQUIDITY, PREMIUM_DISCOUNT, or NONE
- poi_status: FRESH, PARTIAL, FILLED, INVALID, or NONE

Initial FVG candidate heuristic:

- Use a completed three-candle imbalance.
- Bullish FVG: latest completed candle low is above the high two candles earlier.
- Bearish FVG: latest completed candle high is below the low two candles earlier.
- Track the latest Bullish and Bearish candidate independently on 4H and 1H.
- Mark Partial when a completed HTF candle enters the zone.
- Mark Filled when a completed HTF candle crosses the opposite boundary.
- Select only a candidate aligned with the combined HTF Bias.
- Prefer the Primary 4H candidate before the Secondary 1H candidate.
- Return no selected candidate during neutral or conflicting Bias.

Initial Order Block heuristic:

- Evaluate completed 4H and 1H candles only.
- Require a directional departure candle to pass the existing Displacement
  body, range/ATR, and body-share thresholds.
- Require the departure close to break the configured prior HTF range.
- Select the nearest opposing candle within the configured search window.
- Use the opposing candle's full high-to-low range as the OB zone.
- Track the latest Bullish and Bearish OB independently on each HTF.
- Mark the zone `MITIGATED` after price first overlaps it.
- Invalidate Bullish OB after a completed HTF close below its low.
- Invalidate Bearish OB after a completed HTF close above its high.
- Select the newest active Bullish or Bearish OB on each HTF by source time.
- Draw the latest active zone regardless of the combined HTF Bias.
- Use the directional color when the OB aligns with the combined HTF Bias.
- Use neutral gray and the `UNALIGNED` flag when it does not align.
- Allow the latest active Primary 4H and Secondary 1H zones to appear together.

Initial Breaker heuristic:

- Evaluate completed 4H and 1H Order Block invalidations only.
- Convert an invalidated Bullish OB into a Bearish Breaker after a completed
  HTF close below the OB low.
- Convert an invalidated Bearish OB into a Bullish Breaker after a completed
  HTF close above the OB high.
- Retain the invalidated OB's full-candle range and source time.
- Record the invalidating HTF candle time as Breaker activation time.
- Mark the Breaker `MITIGATED` after a later completed HTF candle overlaps it.
- Invalidate a Bullish Breaker after a completed HTF close below its low.
- Invalidate a Bearish Breaker after a completed HTF close above its high.
- Select the newest active Bullish or Bearish Breaker on each HTF by activation
  time.
- Draw aligned Breakers in their directional color.
- Draw unaligned Breakers in neutral gray with the `UNALIGNED` flag.
- Allow the latest active Primary 4H and Secondary 1H Breakers to appear
  together.

Current limitation:

- The candidate is not confirmed by displacement.
- Filled status is based on completed HTF candles and intentionally updates with HTF confirmation lag.
- INVALID status is not automated because structure invalidation rules are not yet explicit.
- Order Block is chart context only and does not yet participate in selected
  POI logic, scoring, or Alerts.
- Breaker is chart context only and does not yet participate in selected POI
  logic, scoring, or Alerts.
- Liquidity and Premium/Discount POIs are not implemented.
- The output must be described as an HTF FVG candidate, not a ready Entry zone.

Current display:

- The selected FVG is reported in the fixed Dashboard and Data Window.
- An optional box starts at the actual HTF origin time and uses the candidate's exact top and bottom prices.
- Optional dashed 4H and 1H OB boxes start at the source candle's actual HTF
  time and use its exact full-candle range.
- Optional dotted 4H and 1H Breaker boxes retain the invalidated OB's actual
  source time and full-candle range.
- Disabling the chart box must not change candidate selection, zone prices, status, or Entry logic.

## Module 3 - LTF Context

Input:

- Execution timeframe structure
- Selected setup mode: reversal or continuation
- Local swing points
- Current setup window

Process:

- Determine whether the setup is reversal or continuation.
- Identify local structure and relevant liquidity.
- Confirm the setup is happening inside one active context window.

Output:

- setup_type: REVERSAL or CONTINUATION
- ltf_context_valid: true or false
- setup_window_active: true or false

## Module 4 - Liquidity

Implementation status: `Pine v0.6.1-alpha - Previous Day High/Low baseline with optional chart levels`

Input:

- Asia high and low
- Previous day high and low
- Equal highs and equal lows
- Internal and external liquidity levels
- Current high and low

Process:

- Detect sweep or raid events.
- Classify liquidity as internal or external.
- Check whether the sweep supports trade direction.

Output:

- liquidity_swept: true or false
- liquidity_type: INTERNAL, EXTERNAL, SESSION, DAILY, EQUAL_LEVEL, or NONE
- sweep_direction: BULLISH, BEARISH, or NEUTRAL

Previous Day Liquidity heuristic:

- Request PDH and PDL from the previous completed Daily candle.
- Use a one-bar offset with `lookahead_on` so historical and realtime levels use confirmed values.
- PDH sweep: a confirmed chart candle trades above PDH and closes back below PDH.
- PDL sweep: a confirmed chart candle trades below PDL and closes back above PDL.
- Record only the first confirmed sweep of each level per exchange day.
- PDH sweep maps to a potential BEARISH liquidity event.
- PDL sweep maps to a potential BULLISH liquidity event.
- Both levels swept in one day produce mixed context and must not imply a direction.
- PDH/PDL values remain in the Data Window while sweep calculations use the confirmed historical series.

Session Liquidity WATCH heuristic:

- Track Asia `20:00-00:00` and London `02:00-05:00` in the configurable
  Session timezone; default to `America/New_York` for DST-aware ICT-style
  ranges.
- Freeze each Session High/Low only after its range closes.
- Session High sweep: a confirmed chart candle trades above the finalized High
  and closes back below it.
- Session Low sweep: a confirmed chart candle trades below the finalized Low
  and closes back above it.
- Record only the first confirmed sweep of each finalized Session level.
- Emit independent WATCH events for Asia High, Asia Low, London High, and
  London Low.
- Do not add Session Sweep WATCH to Liquidity Score, MSS, or READY in the
  initial baseline.

Current limitation:

- Sweep detection uses the chart timeframe candle.
- Equal High/Low and Internal/External classification are not automated.
- Asia/London Session ranges require manual comparison against the separate
  Session indicator before they can influence scoring.
- Liquidity is not yet linked to a setup window, POI proximity, or Structure confirmation.
- The output is context only and cannot mark an Entry ready.
- Historical PDH/PDL steplines and confirmed sweep markers can be enabled independently.

## Module 5 - Structure

Implementation status: `Pine v0.15.0-alpha - Internal/Swing BOS/CHoCH/MSS and chart Order Block visual layer`

Input:

- Confirmed execution-chart swing highs and lows
- Current and previous closes
- Prior execution structure direction
- Recent confirmed PDH or PDL sweep; Session Sweep remains WATCH-only
- Configurable Internal and Swing pivot lengths
- Structure display filter and context window
- Independent Internal and Swing Order Block display limits
- Configurable Order Block source search and invalidation mode

Process:

- Confirm a swing only after the configured number of bars on both sides.
- Require a confirmed candle close through an unbroken swing level.
- Classify a break in the current direction as BOS.
- Classify the first break against the prior direction as CHOCH.
- Upgrade CHOCH to MSS when the matching confirmed PDH/PDL sweep occurred within the context window.
- Keep the latest event active in the Dashboard for the configured number of chart bars.
- Compare the event direction with combined HTF Bias for display context only.
- Run a separate larger Swing structure on the same chart timeframe.
- Draw Internal events with dashed lines and Swing events with solid lines.
- Center BOS, CHoCH, and MSS labels between source pivots and confirming bars.
- On a confirmed structure break, select the extreme source candle between the
  pivot and confirming close as a chart Order Block.
- Retain multiple Internal and Swing Order Blocks independently.
- Fade mitigated zones and remove invalidated zones on confirmed bars.

Output:

- structure_event_pulse: MSS, CHOCH, BOS, or NONE
- active_structure_event: MSS, CHOCH, BOS, or NONE
- structure_direction: BULLISH, BEARISH, or NEUTRAL
- execution_structure_trend: BULLISH, BEARISH, or NEUTRAL
- structure_break_level
- latest_confirmed_swing_high
- latest_confirmed_swing_low
- structure_aligned_with_htf: true or false
- internal_structure_drawings: dashed BOS, CHoCH, or MSS
- swing_structure_drawings: solid BOS or CHoCH
- chart_order_blocks: active Internal and Swing zones

Current limitation:

- The baseline runs on the current chart timeframe and should be used on the intended execution chart.
- MSS context currently recognizes PDH/PDL sweeps only; Session Sweep alerts
  do not upgrade CHoCH to MSS.
- Setup type, POI proximity, and a complete setup-window state machine are not automated.
- A Structure event is decision-support context, not an Entry Signal.
- Manual comparison against marked BOS/CHOCH/MSS examples remains required.
- Current swing levels and confirmed BOS/CHOCH/MSS events can be drawn from
  their source bars.
- Each Structure event label is centered between its source swing and
  confirmed break bar to reduce endpoint congestion.
- Swing Structure and chart Order Blocks are visual context only. Dashboard
  scoring, POI selection, and Alerts continue to use the existing execution
  structure baseline.

## Module 6 - CISD

Implementation status: `Pine v0.6.1-alpha - strict current-chart CISD with optional chart levels`

Input:

- Consecutive bullish or bearish delivery candles
- Opening price of the first retained candle in the delivery series
- Delivery-leg high-to-low range
- ATR length and minimum ATR multiple
- Maximum confirmation bars
- HTF Bias, POI interaction, Liquidity, and Structure context

Process:

- Track the latest uninterrupted bullish and bearish delivery series.
- Require the configured minimum number of candles and minimum ATR range.
- Retain at most the configured maximum number of delivery candles.
- Arm a Bullish CISD level at the opening of the first retained Bearish delivery candle.
- Arm a Bearish CISD level at the opening of the first retained Bullish delivery candle.
- Require a confirmed bullish body close above the Bullish level or bearish body close below the Bearish level.
- Expire an unconfirmed level after the configured confirmation window.
- Keep the latest confirmed event active for the configured CISD context window.
- Calculate CISD from the current chart timeframe automatically.
- Recalculate candidates, confirmed events, and levels when the chart timeframe changes.
- Keep candidate and confirmed levels in the Data Window and optionally draw them over the current chart timeframe.
- Assign Weak when only the mechanical event exists.
- Assign Medium when direction matches HTF Bias and at least one matching POI, Sweep, or Structure context exists.
- Assign Strong when direction matches HTF Bias and matching Structure is supported by a matching POI interaction or Sweep.

Output:

- cisd_event_pulse: BULLISH, BEARISH, or NONE
- active_cisd_direction: BULLISH, BEARISH, or NEUTRAL
- active_cisd_level
- active_delivery_candle_count
- active_delivery_leg_range
- cisd_valid: true or false
- cisd_quality: weak, medium, strong, or none
- armed_bullish_cisd_level
- armed_bearish_cisd_level

Current limitation:

- The baseline runs on the current chart timeframe.
- CISD has no independent timeframe setting.
- CISD is never projected from one chart timeframe onto another.
- Armed CISD levels use dashed lines and confirmed events use solid historical lines when enabled.
- It uses a conservative delivery-series and body-close heuristic; manual comparison remains required.
- Context may strengthen while the event remains active because Sweep, Structure, and CISD can occur in different orders inside one setup window.
- Displacement and follow-through are not yet part of CISD quality.
- CISD is decision-support context, not an Entry Signal.

## Module 7 - Displacement

Implementation status: `Pine v0.6.1-alpha - current-chart expansion and follow-through with optional range boxes`

Input:

- Candle body size
- Candle range
- Average body size from completed chart candles
- ATR from completed chart candles
- Body share of the candle range
- Active HTF and Structure context
- Valid CISD context, except Balanced BOS Continuation may qualify without a
  separate CISD when the remaining evidence threshold passes
- Close relative to the latest Structure break level
- Configurable follow-through window

Process:

- Run automatically on the current chart timeframe.
- Require a confirmed directional candle body to exceed the configured average-body multiple.
- Require the candle range to exceed the configured ATR multiple.
- Require the candle body to occupy the configured minimum share of the range.
- Require direction to match combined HTF Bias, active Structure, and valid CISD.
- Require the expansion candle to close beyond the latest Structure break level.
- Keep the expansion as a Watch candidate until a later confirmed candle closes beyond the expansion close.
- Expire or invalidate the candidate when follow-through does not occur inside the configured window or price closes back through the Structure level.
- Classify confirmed displacement as Medium by default.
- Classify it as Strong only when expansion exceeds the stronger body, range, and body-share thresholds while CISD quality is Strong.
- Keep all exact values in the Data Window and optionally draw Watch and confirmed range boxes with event labels.

Output:

- displacement_event_pulse: BULLISH, BEARISH, or NONE
- displacement_valid: true or false
- displacement_direction: BULLISH, BEARISH, or NEUTRAL
- displacement_quality: watch/weak, medium, strong, or none
- displacement_structure_level
- displacement_body_multiple
- displacement_range_atr_multiple
- displacement_body_share
- displacement_candidate_direction

Current limitation:

- The baseline uses the current chart timeframe and has no independent execution-timeframe setting.
- It requires an active aligned Structure event and valid CISD, so valid displacement is intentionally conservative.
- Follow-through uses a confirmed close beyond the expansion candle close; it does not classify news events directly.
- Manual comparison against marked displacement examples remains required.
- Displacement is decision-support context, not an Entry Signal.

## Module 8 - FVG / Entry Zone

Implementation status: `Pine v0.7.0-alpha - latest Displacement-linked Entry FVG baseline`

Input:

- Confirmed Displacement direction and expansion candle
- Three-candle imbalance logic
- Retracement into imbalance
- Mitigation status

Process:

- Require the confirmed Displacement expansion candle to be the middle candle of the three-candle pattern.
- Support Displacement follow-through confirmation one or two candles after expansion.
- Create a Bullish FVG when the right candle low is above the left candle high.
- Create a Bearish FVG when the right candle high is below the left candle low.
- Track the latest zone as Fresh, Partial, or Filled using confirmed chart candles.
- Emit separate creation, first retracement, and filled event pulses.
- Confirm whether current price touches or closes inside the active entry zone.
- Draw the latest zone with actual formation time and exact top/bottom prices.
- Reuse the existing Dashboard Status row so the table remains ten rows.

Output:

- entry_fvg_created_event: BULLISH, BEARISH, or NONE
- entry_fvg_retrace_event: BULLISH, BEARISH, or NONE
- entry_fvg_filled_event: BULLISH, BEARISH, or NONE
- entry_fvg_direction: BULLISH, BEARISH, or NONE
- entry_fvg_status: FRESH, PARTIAL, FILLED, or NONE
- entry_fvg_top
- entry_fvg_bottom
- entry_fvg_active: true or false
- entry_fvg_price_interaction: true or false

Current limitation:

- The baseline runs on the current chart timeframe.
- Only the latest confirmed Entry FVG is tracked.
- INVALID is not automated because non-fill invalidation rules are not explicit.
- A direct full fill emits Filled without requiring a prior Partial state.
- Entry FVG is decision-support context, not an Entry Signal.
- Non-fill Entry FVG invalidation, alerts, and trader execution remain manual.

## Module 9 - Risk / Entry Decision

Implementation status: `Pine v0.9.0-alpha - locked Entry/Risk planning baseline`

Input:

- Latest active Entry FVG
- Latest confirmed execution swing high and low
- Confirmed Previous Day High and Previous Day Low
- Minimum planned RR, configurable with `2.0R` as the default

Process:

- Lock the plan when a new Entry FVG is created so later swing updates do not
  move the original Entry, Stop, or Target.
- Set Entry to the midpoint of the Entry FVG.
- Set Bullish Stop Loss to the latest confirmed execution swing low.
- Set Bearish Stop Loss to the latest confirmed execution swing high.
- In Strict A+, set Bullish Target to confirmed Previous Day High liquidity
  and Bearish Target to confirmed Previous Day Low liquidity.
- In Balanced, select the nearest valid forward target from PDH/PDL, the
  latest confirmed execution swing, or the latest confirmed major swing.
- Reject inverted Stop or Target geometry.
- Calculate planned reward-to-risk and require it to meet the configured
  minimum before the setup becomes READY.
- Keep the setup in RISK_REVIEW when the automated confirmation chain is
  complete but a valid risk plan is unavailable.
- Return NO_TRADE when the complete automated chain has an available plan whose
  RR is below the configured minimum.
- Draw optional price/time-anchored Entry, Stop, and Target levels for the
  latest active plan.

Output:

- entry_ready: true or false
- planned_entry
- planned_stop
- planned_target
- planned_rr
- final_state: NO_TRADE, WAITING, DEVELOPING, RISK_REVIEW, or READY

Current limitation:

- Entry is a proposed FVG-midpoint plan, not a confirmed broker fill.
- Stop uses the latest confirmed execution swing. Target uses either the
  Strict PDH/PDL baseline or the Balanced forward-liquidity selection.
- Trader emotion, forced-entry checks, position sizing, news risk, and order
  execution remain outside Pine.
- The plan tracks the latest active Entry FVG only.

## Module 10 - Score Engine

Implementation status: `Pine v0.16.2-alpha - manual plus Balanced/Strict automated assessment modes`

Input:

- Outputs from all prior modules
- Setup type
- Direction
- Risk checks

Process:

- Assign weights to each required condition.
- Penalize conflicts, invalidation, weak displacement, or missing confirmation.
- Convert numeric score into grade.
- Use Manual Assessment as the default Dashboard source.
- Let the trader select Bullish, Bearish, or Neutral Narrative.
- Let the trader confirm eight weighted checklist categories.
- Keep Setup Status separate from score and require all core confirmations plus
  Risk / RR for manual READY.
- Allow an explicit manual NO TRADE override.
- Preserve Automatic mode for comparison with confirmed indicator events.

Initial scoring draft:

| Condition | Weight |
| --- | ---: |
| HTF context | 20 |
| POI | 15 |
| Liquidity | 15 |
| Structure | 15 |
| CISD | 15 |
| Displacement | 10 |
| FVG / Entry Zone | 5 |
| RR / Risk | 5 |

Current web profile: `score-v1`

The score is calculated continuously, but the grade remains pending until the
setup reaches READY. Every saved assessment includes the profile name and
category breakdown so future calibration does not mix records produced by
different formulas.

Pine maps the currently automated evidence to these weights. HTF
alignment earns 20, while Primary-only context earns 10. A selected HTF FVG
earns 5 and a recent interaction with that same zone earns 15. Direction-aligned
recent PDH/PDL liquidity, Structure, valid CISD, Displacement, and Entry FVG
then earn their category weights. A valid locked risk plan earns the remaining
5 points.

Automatic completion profiles:

- `Balanced Reversal`: aligned HTF, recent HTF POI interaction, matching
  PDH/PDL Sweep, MSS, valid CISD, confirmed Displacement, later Entry FVG
  retracement, and Risk / RR.
- `Balanced Continuation`: aligned HTF, BOS, confirmed Displacement, POI
  interaction or valid CISD, later Entry FVG retracement, at least 65 evidence
  points before Risk, and Risk / RR.
- `Strict A+`: every automated checklist category is required.

CHoCH earns 5 of 15 Structure points as a Developing warning. Only BOS or MSS
can complete an automated setup. The evidence present when an Entry FVG is
created is locked to that zone so a later retracement does not lose valid
earlier events merely because their display context expired.

Pine displays a final Grade only when the setup reaches READY. Pending states
show `--`; NO_TRADE remains explicitly blocked.

Current Pine setup states:

- NO_TRADE: timeframe or active direction conflict.
- WAITING: score below 25 with no active blocker.
- DEVELOPING: score at least 25 with an incomplete automated chain.
- RISK_REVIEW: the automated chain and Entry FVG interaction are complete, but
  the locked plan is missing valid geometry or minimum RR.
- READY: the complete automated chain and locked risk plan pass on a confirmed
  chart candle.

The Dashboard remains ten rows. The existing Status row becomes Setup and shows
the short state, final score, and Grade. Automated category scores, final score,
planned RR, Entry readiness, final Grade code, and a numeric next-step code are
exposed in the Data Window.

Output:

- score: 0 to 100
- grade: A+, A, B, C, or D
- final_state: NO_TRADE, WAITING, DEVELOPING, RISK_REVIEW, or READY

Current limitation:

- Pine Dashboard tables are not interactive; manual values are changed in the
  indicator's Settings panel.
- Manual selections affect Dashboard presentation only.
- Data Window score fields and confirmed-bar Alerts use the selected Manual or
  Automatic assessment values defined by the versioned integration contract.
- Manual Assessment does not place orders or send data directly to GitHub
  Pages.

## Module 11 - Alert System

Implementation status: `Pine v0.17.1-alpha - confirmed-bar Setup and separate Session Sweep WATCH alerts`

Input:

- Selected HTF POI interaction
- PDH and PDL sweep pulses
- Asia High/Low and London High/Low sweep pulses
- BOS, CHOCH, and MSS pulses
- Valid CISD event pulse
- Confirmed Displacement pulse
- Entry FVG creation, retracement, and fill pulses
- Setup State transitions
- Master Alert switch and individual event-group switches

Process:

- Evaluate Alert events only after the current chart candle is confirmed.
- Suppress disabled event groups.
- Trigger POI interaction once for the active selected zone.
- Trigger Risk Review, READY, and NO TRADE only when the Setup State enters the
  matching state.
- Combine multiple enabled same-candle events into one message.
- Emit `trading-companion.alert.v1` JSON.
- Include symbol, ticker, chart timeframe, close time, event list, assessment
  mode, Narrative, Setup State, Score, Grade, blocked state, eight checklist
  values, available risk plan, and close price.
- Call `alert()` once per confirmed bar at most.
- Expose a named `Trading Companion Sync` fallback condition with one compact
  snapshot code for TradingView clients that do not register the dynamic
  `alert()` option.
- Expose one combined `Session Sweep Watch` condition and four independent
  Asia/London High/Low conditions using the same compact snapshot contract.

Output:

- alert_event_count: zero or more enabled events on the confirmed candle
- alert_event_list: human-readable aggregated event description
- alert_message: valid `trading-companion.alert.v1` JSON
- alert_frequency: once per bar close
- fallback_snapshot: one integer encoding mode, Narrative, State, Score, Grade,
  blocked state, and all eight checklist values
- named_session_conditions: combined WATCH plus Asia High, Asia Low, London
  High, and London Low

Current limitation:

- The script does not create a running TradingView alert automatically.
- Notifications begin only after the trader creates an alert using
  `Any alert() function call` or one of the named Session Sweep conditions.
- Alert execution is realtime only; historical bars do not deliver
  notifications.
- Trading Companion supports validated manual JSON import and an optional
  authenticated remote Inbox.
- The Cloudflare Worker, D1, Secrets, Companion Sync, and running TradingView
  alert are configured in production.
- TradingView 2FA, the protected Worker URL, and live Webhook delivery are
  verified in production.
- The existing v0.14.1 production alert remains active while v0.17.1 is
  validated as the private chart version.

## Current Checklist Mapping

| Checklist Section | Future Module |
| --- | --- |
| HTF Context - 4H / 1H | HTF Bias, HTF POI |
| Price reaches POI | HTF POI |
| LTF Context | LTF Context |
| Confirmation Events | Liquidity, Structure, CISD |
| Displacement Confirmation | Displacement |
| FVG / Entry Zone | FVG / Entry Zone |
| Entry Decision | Risk / Entry Decision |
| Trade Notes | Journal / Review, future phase |

## Phase 0 Decision

The web app and selected Pine modules now implement parts of this specification. Unimplemented sections remain target behavior and require manual validation before release readiness.
