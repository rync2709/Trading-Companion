# Trading OS Indicator Specification

Version: v0.2.8
Phase: Pine Track - Modules 1, 2, 4, Structure, CISD, and Displacement baselines

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

Implementation status: `Pine v0.6.1-alpha - FVG candidate with optional price/time-anchored chart box`

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

Current limitation:

- The candidate is not confirmed by displacement.
- Filled status is based on completed HTF candles and intentionally updates with HTF confirmation lag.
- INVALID status is not automated because structure invalidation rules are not yet explicit.
- Order Block, Breaker, Liquidity, and Premium/Discount POIs are not implemented.
- The output must be described as an HTF FVG candidate, not a ready Entry zone.

Current display:

- The selected FVG is reported in the fixed Dashboard and Data Window.
- An optional box starts at the actual HTF origin time and uses the candidate's exact top and bottom prices.
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

Initial Previous Day Liquidity heuristic:

- Request PDH and PDL from the previous completed Daily candle.
- Use a one-bar offset with `lookahead_on` so historical and realtime levels use confirmed values.
- PDH sweep: a confirmed chart candle trades above PDH and closes back below PDH.
- PDL sweep: a confirmed chart candle trades below PDL and closes back above PDL.
- Record only the first confirmed sweep of each level per exchange day.
- PDH sweep maps to a potential BEARISH liquidity event.
- PDL sweep maps to a potential BULLISH liquidity event.
- Both levels swept in one day produce mixed context and must not imply a direction.
- PDH/PDL values remain in the Data Window while sweep calculations use the confirmed historical series.

Current limitation:

- Sweep detection uses the chart timeframe candle.
- Asia High/Low, Equal High/Low, and Internal/External classification are not automated.
- Liquidity is not yet linked to a setup window, POI proximity, or Structure confirmation.
- The output is context only and cannot mark an Entry ready.
- Historical PDH/PDL steplines and confirmed sweep markers can be enabled independently.

## Module 5 - Structure

Implementation status: `Pine v0.4.0-alpha - execution-chart BOS/CHOCH/MSS baseline`

Input:

- Confirmed execution-chart swing highs and lows
- Current and previous closes
- Prior execution structure direction
- Recent confirmed PDH or PDL sweep
- Configurable swing length and context window

Process:

- Confirm a swing only after the configured number of bars on both sides.
- Require a confirmed candle close through an unbroken swing level.
- Classify a break in the current direction as BOS.
- Classify the first break against the prior direction as CHOCH.
- Upgrade CHOCH to MSS when the matching confirmed PDH/PDL sweep occurred within the context window.
- Keep the latest event active in the Dashboard for the configured number of chart bars.
- Compare the event direction with combined HTF Bias for display context only.

Output:

- structure_event_pulse: MSS, CHOCH, BOS, or NONE
- active_structure_event: MSS, CHOCH, BOS, or NONE
- structure_direction: BULLISH, BEARISH, or NEUTRAL
- execution_structure_trend: BULLISH, BEARISH, or NEUTRAL
- structure_break_level
- latest_confirmed_swing_high
- latest_confirmed_swing_low
- structure_aligned_with_htf: true or false

Current limitation:

- The baseline runs on the current chart timeframe and should be used on the intended execution chart.
- MSS context currently recognizes PDH/PDL sweeps only.
- Setup type, POI proximity, and a complete setup-window state machine are not automated.
- A Structure event is decision-support context, not an Entry Signal.
- Manual comparison against marked BOS/CHOCH/MSS examples remains required.
- Current swing levels and confirmed BOS/CHOCH/MSS events can be drawn from their source bars.

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
- Active HTF, Structure, and valid CISD context
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

Input:

- Displacement candles
- Three-candle imbalance logic
- Retracement into imbalance
- Mitigation status

Process:

- Detect FVG created by valid displacement.
- Track fresh, partial, filled, or invalid status.
- Confirm whether price retraces into the entry zone.

Output:

- fvg_present: true or false
- fvg_status: FRESH, PARTIAL, FILLED, INVALID, or NONE
- entry_zone_active: true or false

## Module 9 - Risk / Entry Decision

Input:

- Entry trigger
- Stop loss level
- Invalidation level
- Target level
- Risk/reward ratio
- Trader checklist confirmation

Process:

- Confirm entry trigger on execution timeframe.
- Confirm SL represents true invalidation.
- Confirm RR passes minimum requirement.
- Block entries marked as emotional or forced.

Output:

- entry_ready: true or false
- rr_valid: true or false
- final_state: NO_TRADE, WAITING, DEVELOPING, or READY

## Module 10 - Score Engine

Input:

- Outputs from all prior modules
- Setup type
- Direction
- Risk checks

Process:

- Assign weights to each required condition.
- Penalize conflicts, invalidation, weak displacement, or missing confirmation.
- Convert numeric score into grade.

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

Output:

- score: 0 to 100
- grade: A+, A, B, C, or D
- final_state: NO_TRADE, WAITING, DEVELOPING, or READY

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
