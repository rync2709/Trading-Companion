# Trading OS Pine Indicator

Version: v0.11.0-alpha

The Pine track automates selected Trading OS context checks without replacing trader judgment.

## Current Module

`TradingOS.pine` currently implements:

- Module 1: HTF Bias baseline
- Module 2 baseline: aligned HTF FVG candidate and HTF Order Block chart context
- Module 4 baseline: Previous Day High/Low liquidity
- Module 5 baseline: execution-chart BOS/CHOCH/MSS
- Module 6 baseline: strict execution-chart CISD
- Module 7 baseline: execution-chart Displacement and follow-through
- Module 8 baseline: Displacement-linked Entry FVG and retracement
- Module 9 baseline: locked Entry, Stop, Target, and planned RR
- Module 10 baseline: automated Setup State, Score, and final Grade
- Module 11 baseline: configurable confirmed-bar Alert System

Defaults:

- Primary HTF: 4H
- Secondary HTF: 1H
- Confirmed swing length: 3
- Execution swing length: 3
- Structure context window: 20 chart bars
- CISD delivery candles: minimum 3, maximum 8
- CISD minimum delivery leg: 0.8 ATR using ATR 14
- CISD confirmation window: 8 chart bars
- CISD active context window: 20 chart bars
- Displacement body baseline: 20 completed chart candles
- Displacement minimum body: 1.5 times average body
- Displacement minimum range: 1.0 ATR using ATR 14
- Displacement minimum body share: 60%
- Displacement follow-through window: 2 chart bars
- Displacement active context window: 20 chart bars
- Minimum planned RR: 2.0R
- HTF OB break lookback: 5 completed HTF candles
- HTF OB opposing-candle search: 6 HTF candles

Structure heuristic:

- Higher High and Higher Low: `BULLISH`
- Lower High and Lower Low: `BEARISH`
- Mixed or incomplete structure: `NEUTRAL`
- Opposite non-neutral 4H and 1H states: `CONFLICT`

Combined bias is conservative:

- Matching directional 4H and 1H: directional bias with `HIGH` confidence
- Directional 4H with neutral 1H: 4H bias with `MEDIUM` confidence
- Conflicting timeframes or neutral 4H: `NEUTRAL` with `LOW` confidence

## HTF FVG Candidate

The first POI baseline scans completed 4H and 1H candles using three-candle imbalance logic:

- Bullish candidate: the latest completed candle low is above the high two candles earlier.
- Bearish candidate: the latest completed candle high is below the low two candles earlier.
- Fresh: price has not re-entered the candidate on completed HTF candles.
- Partial: price has entered part of the candidate.
- Filled: price has crossed the opposite boundary.

Selection rules:

- The candidate direction must match the combined HTF Bias.
- The Primary 4H candidate has priority.
- The Secondary 1H candidate is used only when no active aligned 4H candidate exists.
- Neutral or conflicting Bias produces no selected candidate.
- Only the latest Bullish and Bearish candidate on each HTF is tracked.

This is a POI candidate, not a valid Entry FVG. The separate Displacement baseline does not yet validate this HTF candidate, and complete setup-window confirmation is not implemented.

## HTF Order Block Baseline

The v0.11.0 Order Block baseline scans completed 4H and 1H candles:

- A Bullish departure candle must close above the previous HTF range.
- A Bearish departure candle must close below the previous HTF range.
- The departure must pass the existing Displacement body, range/ATR, and body
  share thresholds.
- The latest opposing candle before the departure becomes the OB source.
- The OB uses the source candle's full high-to-low range.
- Bullish invalidation requires a completed HTF close below the OB low.
- Bearish invalidation requires a completed HTF close above the OB high.
- First price overlap changes the state from `FRESH` to `MITIGATED`.
- Only OBs aligned with the combined HTF Bias are drawn.
- The latest active 4H and 1H zones can appear together.
- The 4H box uses a stronger dashed border; the 1H box is lighter.

OB boxes use actual source time and price and extend right until invalidated or
replaced. The Display switch is enabled by default. This baseline is chart
context only and does not yet replace the selected FVG POI, alter the setup
score, or create a separate Alert event.

## Compact Dashboard

The dashboard uses ten rows to reduce chart obstruction. Its text size defaults to `Small` and can be changed under Display to `Tiny`, `Small`, or `Normal`.

- HTF: grouped Primary and Secondary states
- Bias: Combined Bias and Confidence
- Context: HTF alignment
- POI: selected timeframe, direction, and FVG type
- Setup: automated setup state, final score, and Grade when READY
- Liquidity: confirmed PDH/PDL sweep state
- Structure: active BOS, CHOCH, MSS, or WAIT
- CISD: active direction with Weak, Medium, Strong, or WAIT quality
- Displacement: Watch candidate, confirmed Medium/Strong direction, conflict, or WAIT

The POI row remains neutral gray until price touches or enters the zone. The
Setup row is neutral while waiting, directional while developing or ready,
yellow during Risk Review, and red when blocked. Bias and Context colors remain
directional because they describe market context rather than POI interaction.

## Daily Liquidity Baseline

The first Liquidity module uses the confirmed Previous Day High (`PDH`) and Previous Day Low (`PDL`):

- PDH and PDL come from the previous completed Daily candle.
- A PDH sweep requires a confirmed chart candle to trade above PDH and close back below it.
- A PDL sweep requires a confirmed chart candle to trade below PDL and close back above it.
- Only the first confirmed sweep of each level is recorded per exchange day.
- PDH and PDL remain available in the Data Window and can be drawn as historical chart levels.
- The dashboard remains neutral while waiting and colors the Liquidity row after a sweep.

## Chart Presentation

- The selected HTF FVG is drawn from its actual HTF origin time and price and extends right until replaced.
- PDH and PDL are drawn as historical steplines with right-edge labels.
- Confirmed PDH and PDL sweeps can display event markers.
- Current confirmed swing high and low levels can display with labels.
- Confirmed BOS, CHOCH, and MSS events can display as historical break segments and labels.
- Armed CISD candidates use dashed levels; confirmed CISD events use solid historical levels and labels.
- A Displacement Watch candidate can display its expansion range; confirmed events keep historical range boxes and labels.
- The latest Entry FVG can display as a price/time-anchored box with creation, retracement, and fill labels.
- FVG, liquidity, Structure, CISD, Displacement, Entry FVG, and Bias-background drawings have independent Display toggles.
- Chart drawings are enabled by default and use actual bar time and price coordinates rather than viewport positioning.
- Detection, Dashboard, and Data Window state remain available when any drawing group is disabled.
- The compact Dashboard remains ten rows with `Small` as the default text size.

Interpretation remains manual:

- PDH sweep is a potential bearish liquidity event.
- PDL sweep is a potential bullish liquidity event.
- A sweep is not an Entry Signal and still requires POI, Structure, CISD, Displacement, and risk confirmation.

## Execution Structure Baseline

The first Structure module runs on the current chart timeframe:

- Swing levels use symmetric confirmed pivots with three bars on each side by default.
- A break requires a confirmed candle close through an unbroken swing level.
- BOS means the break continues the current execution structure direction.
- CHOCH means the break is the first confirmed change against the prior structure direction.
- MSS means the CHOCH follows the matching confirmed liquidity sweep within 20 chart bars by default.
- Bullish MSS requires a recent PDL sweep; Bearish MSS requires a recent PDH sweep.
- The active Structure event expires from the Dashboard after the configured context window.
- Direction matching the combined HTF Bias uses directional color; conflict uses the warning color.
- Exact event codes, direction, trend, break level, and swing values remain available in the Data Window.
- Current swing levels and confirmed BOS/CHOCH/MSS events can be drawn on the price chart.

This baseline does not yet know Reversal versus Continuation setup type, full POI proximity, or a complete setup-window state.

## CISD Baseline

The first CISD module runs on the current chart timeframe:

- A delivery leg is an uninterrupted series of bullish or bearish candles.
- The first retained delivery candle's opening price becomes the candidate level.
- The leg must contain at least three candles and span at least 0.8 ATR by default.
- A Bullish CISD requires a confirmed bullish body close above the Bearish delivery level.
- A Bearish CISD requires a confirmed bearish body close below the Bullish delivery level.
- Wick-only violations do not confirm CISD.
- Unconfirmed candidate levels expire after eight chart bars by default.
- Confirmed CISD remains active for 20 chart bars by default.
- Weak means the mechanical CISD exists without enough aligned context.
- Medium requires HTF alignment plus matching POI, Sweep, or Structure context.
- Strong requires HTF alignment and matching Structure supported by a matching POI interaction or Sweep.
- Context can strengthen after the CISD because the confirmation events may occur in different orders inside one setup window.
- Exact candidate and confirmed event values remain available in the Data Window.
- CISD automatically uses the current chart timeframe and has no separate timeframe setting.
- Changing timeframe recalculates the complete CISD state.
- CISD is not projected from the previous chart timeframe onto the new one.
- Exact armed candidate and confirmed CISD values remain available in the Data Window.
- Armed and confirmed CISD levels can be drawn on the current chart timeframe.

CISD remains context only. Displacement and Entry readiness are evaluated by
separate modules.

## Displacement Baseline

The first Displacement module runs on the current chart timeframe:

- The expansion candle must be confirmed and directional.
- Its body must be at least 1.5 times the average body of the prior 20 completed chart candles by default.
- Its range must be at least 1.0 ATR using the prior completed ATR baseline.
- Its body must occupy at least 60% of the candle range to reduce isolated-wick candidates.
- Direction must match combined HTF Bias, active Structure, and valid CISD.
- The expansion candle must close beyond the latest Structure break level.
- The Dashboard shows `WATCH` while waiting up to two confirmed chart bars for a close beyond the expansion candle close.
- A candidate expires after that window or invalidates when price closes back through its Structure level.
- Confirmed displacement is Medium by default and Strong when expansion is materially larger while CISD is Strong.
- The confirmed state remains active for 20 chart bars by default.
- Exact direction, quality, Structure level, body multiple, range/ATR multiple, body share, and candidate state remain available in the Data Window.
- Watch and confirmed Displacement ranges can be drawn as chart boxes with confirmed-event labels.

Displacement remains decision-support context. It does not generate a Buy/Sell
signal or automatic Entry by itself.

## Entry FVG / Entry Zone Baseline

The first Entry FVG module runs on the current chart timeframe:

- A confirmed Displacement event must exist first.
- The Displacement expansion candle must be the middle candle of a valid three-candle imbalance.
- Bullish Entry FVG: the right candle low is above the left candle high.
- Bearish Entry FVG: the right candle high is below the left candle low.
- The module supports Displacement follow-through on either the first or second candle after expansion.
- A new zone starts as `FRESH`.
- The zone becomes `PARTIAL` after price enters it without crossing the opposite boundary.
- The zone becomes `FILLED` after price reaches or crosses the opposite boundary.
- Creation, retracement, and filled events are recorded separately.
- The latest zone uses actual formation time and exact top/bottom prices.
- The existing Dashboard Status row temporarily becomes `Entry FVG` while the zone is active, so the Dashboard remains ten rows.
- Exact direction, status, boundaries, event pulses, creation bar, and price-interaction state remain available in the Data Window.

This baseline tracks the latest Entry FVG only. It does not automate
invalidation beyond a full fill or a broker Entry trigger. Module 9 uses the
active zone as the source for a proposed risk plan.

## Entry / Risk Planning Baseline

The first Risk / Entry baseline locks a proposed plan when a new Entry FVG is
created:

- Entry: midpoint of the latest Entry FVG
- Bullish Stop Loss: latest confirmed execution swing low
- Bearish Stop Loss: latest confirmed execution swing high
- Bullish Target: confirmed Previous Day High
- Bearish Target: confirmed Previous Day Low
- Planned RR: absolute reward distance divided by risk distance
- Minimum RR: configurable, with `2.0R` as the default

Entry, Stop, and Target geometry must agree with the setup direction. The plan
is locked to its Entry FVG creation event, so later swing updates do not move
the original levels. Optional Entry, SL, and Target drawings use actual time and
price coordinates.

This is a planning baseline. It does not confirm a broker fill, calculate
position size, check news or emotion, place an order, or replace trader
approval.

## Setup State / Score Engine

The automated score baseline maps confirmed Pine outputs to the
versioned `score-v1` weights:

- HTF Context: up to 20
- POI: up to 15
- Liquidity: up to 15
- Structure: up to 15
- CISD: up to 15
- Displacement: up to 10
- FVG / Entry Zone: up to 5
- Entry / Risk: 5 when the locked plan has valid geometry and meets minimum RR

The final score can reach 100. A final A+ to D Grade appears only after the
setup reaches READY; pending states continue to show `--`.

Setup states:

- `NO TRADE`: an active timeframe or direction conflict blocks the setup.
- `WAITING`: the automated score is below 25 and no blocker is active.
- `DEVELOPING`: the automated score is at least 25 but the confirmation chain
  is incomplete.
- `RISK REVIEW`: HTF alignment, recent POI interaction, direction-aligned
  liquidity, Structure, CISD, Displacement, active Entry FVG, and retracement
  are all present, but valid Entry/Stop/Target geometry or minimum RR is
  missing.
- `READY`: the complete confirmation chain and locked risk plan pass on a
  confirmed chart candle.

The existing Dashboard remains ten rows. Its Status row becomes `Setup` and
shows the short state, final score, and Grade. Automated category scores, final
score, planned RR, Entry readiness, Grade code, and the next-step code remain
available in the Data Window.

## Alert System

The v0.10.0 Alert System runs only on confirmed chart candles and supports:

- First interaction with the selected HTF POI
- Confirmed PDH or PDL sweep
- Confirmed BOS, CHOCH, or MSS
- Valid Bullish or Bearish CISD
- Confirmed Bullish or Bearish Displacement
- Entry FVG creation, retracement, or fill
- Transition into RISK REVIEW
- Transition into READY TO ENTER
- Transition into NO TRADE

The Alerts settings include one master switch and an independent switch for
each event group. When several enabled events occur on the same confirmed
candle, the script combines them into one dynamic message containing the
symbol, chart timeframe, event list, Setup State, Score, Grade, planned RR, and
close price.

The Pine script exposes one `alert()` call with once-per-bar-close frequency.
It does not create or start a TradingView alert automatically. To receive
notifications:

1. Add the saved indicator to the chart.
2. Configure the event switches under the indicator's Alerts settings.
3. Select Create alert in TradingView.
4. Select `Trading OS - HTF Context` as the condition.
5. Select `Any alert() function call`.
6. Choose the required notification channel and create the alert.
7. Recreate the alert after changing the symbol, timeframe, or indicator
   settings that the running alert must use.

## Non-Repainting Baseline

The script requests the previous completed HTF state. Confirmed pivots also require bars on both sides, so the output intentionally lags live price. This tradeoff avoids treating a still-forming HTF structure as confirmed.

## TradingView Test

Compile status:

- Compiled successfully in TradingView Pine Editor on 2026-07-27.
- Render smoke test passed on XAUUSD at 5M, 15M, 1H, and 4H.
- The HTF Context table and selected FVG data rendered without a compiler error.
- The v0.3.0 PDH/PDL levels and Liquidity dashboard state rendered without a runtime error at 5M, 15M, 1H, and 4H.
- The v0.3.1 pinned current-context display compiled successfully and passed horizontal scroll and zoom checks on XAUUSD 15M.
- The v0.3.2 dashboard-only chart presentation compiled successfully and visually confirmed that Trading OS draws no FVG box or PDH/PDL chart lines on XAUUSD 15M.
- The v0.4.0 execution Structure baseline compiled successfully and passed render smoke tests on XAUUSD at 5M, 15M, 1H, and 4H.
- The v0.4.0 eight-row Dashboard displayed an active Structure state on XAUUSD 15M without adding chart drawings.
- The v0.5.0 strict CISD baseline compiled successfully and passed render smoke tests on XAUUSD at 5M, 15M, 1H, and 4H.
- The v0.5.0 nine-row Dashboard displayed CISD direction and quality without adding chart drawings.
- The v0.5.1 timeframe-scoped CISD levels compiled successfully in TradingView.
- Confirmed CISD levels render on XAUUSD 5M and remain hidden on XAUUSD 4H.
- Confirmed the 4H Dashboard displays `5M ONLY` and returned the chart to 5M after testing.
- The v0.5.2 automatic chart-timeframe behavior compiled successfully in TradingView.
- Confirmed XAUUSD 5M and 4H each calculate their own CISD state without cross-timeframe level projection.
- Returned the chart to its original 15M timeframe after testing.
- The v0.5.3 Dashboard-only presentation compiled successfully in TradingView.
- Confirmed the nine-row Dashboard renders without Trading OS CISD or Structure drawings on XAUUSD 15M.
- The v0.6.0 Displacement baseline compiled successfully in TradingView.
- Confirmed the updated indicator and Displacement settings load without a runtime error on XAUUSD at 5M, 15M, 1H, and 4H.
- Returned the chart to its original 15M timeframe.
- Saved the private TradingView script as `Trading OS HTF Context v0.6.0` without publishing.
- The v0.6.1 full chart presentation compiled successfully in TradingView.
- Confirmed one v0.6.1 indicator instance and no runtime alerts on XAUUSD at 5M, 15M, 1H, and 4H.
- Confirmed the selected FVG, PDH/PDL, Structure, CISD, and Displacement drawing groups load with actual time and price anchors.
- Removed the previous v0.6.0 chart instance, returned the chart to 15M, and saved the layout.
- Saved the private TradingView script as `Trading OS HTF Context v0.6.1` without publishing.
- The v0.7.0 Entry FVG baseline compiled successfully in TradingView.
- Confirmed one v0.7.0 indicator instance and no runtime alerts on XAUUSD at 5M, 15M, 1H, and 4H.
- Confirmed a Displacement-linked Entry FVG and its exact boundaries appear in the XAUUSD 15M Data Window.
- Removed the previous v0.6.1 chart instance, returned the chart to 15M, and saved the layout.
- Saved the private TradingView script as `Trading OS HTF Context v0.7.0` without publishing.
- The v0.8.0 provisional Setup State and Score Engine compiled successfully in
  TradingView.
- Confirmed setup-state, total-score, category-score, next-step, manual Risk,
  and pending-Grade outputs in the XAUUSD Data Window.
- Confirmed no runtime errors on XAUUSD at 5M, 15M, 1H, and 4H.
- Returned the chart to 15M and saved the private TradingView script as
  `Trading OS HTF Context v0.8.0` without publishing.
- The v0.9.0 Entry/Risk planning baseline compiled successfully after keeping
  total Pine plot outputs within TradingView's 64-plot limit.
- Confirmed one v0.9.0 indicator instance and no runtime errors on XAUUSD at
  5M, 15M, 1H, and 4H.
- Confirmed final score, planned RR, Entry readiness, and Grade outputs in the
  XAUUSD Data Window.
- Removed the previous v0.8.0 and the discarded runtime-error chart instances,
  returned the chart to 15M, and saved the layout.
- Saved the private TradingView script as
  `Trading OS HTF Context v0.9.0` without publishing.
- The v0.10.0 Alert System compiled successfully in TradingView.
- Confirmed the Alerts settings expose the master switch and all nine event
  groups.
- Confirmed one valid v0.10.0 indicator instance and no compile or runtime
  errors on XAUUSD at 5M, 15M, 1H, and 4H.
- Removed the discarded compile-error chart instance, returned the chart to
  15M, and saved the layout.
- Saved the private TradingView script as
  `Trading OS HTF Context v0.10.0` without publishing.
- No running TradingView alert was created during implementation.
- The v0.11.0 HTF Order Block baseline compiled successfully in TradingView.
- Confirmed the OB break-lookback, opposing-candle search, and chart-display
  settings load correctly.
- Confirmed one v0.11.0 indicator instance and no compile or runtime errors on
  XAUUSD at 5M, 15M, 1H, and 4H.
- Removed the previous v0.10.0 chart instance, returned the chart to 15M, and
  confirmed the layout was saved.
- Saved the private TradingView script as
  `Trading OS HTF Context v0.11.0` without publishing.
- Manual structure and FVG comparison remains pending and must not be inferred from the smoke test.
- Manual PDH/PDL and sweep-event comparison remains pending.
- Manual Displacement candidate and follow-through comparison remains pending.
- Manual Entry, Stop, Target, and RR comparison remains pending.

1. Open Pine Editor in TradingView.
2. Paste the contents of `TradingOS.pine`.
3. Add the indicator to a chart.
4. Test on 5M, 15M, 1H, and 4H charts.
5. Compare the table with manually marked 4H and 1H swing structure.
6. Compare the selected FVG candidate with manually marked three-candle imbalances.
7. Confirm Fresh, Partial, and Filled transitions on completed HTF candles.
8. Compare PDH and PDL with the previous completed Daily candle.
9. Confirm sweep state only after a candle crosses a level and closes back inside.
10. Compare BOS, CHOCH, and MSS with manually marked execution structure.
11. Compare Bullish and Bearish CISD with manually marked delivery changes.
12. Confirm CISD recalculates from the current chart after every timeframe change.
13. Confirm CISD and Structure drawings use only the current chart timeframe.
14. Compare Watch, Medium, and Strong Displacement states with manually marked expansion and follow-through.
15. Confirm each Entry FVG uses a confirmed Displacement candle as the middle candle of its three-candle pattern.
16. Confirm Fresh, Partial, and Filled Entry FVG transitions against manual markup.
17. Confirm all drawings remain anchored to their source bar time and price while scrolling or zooming.
18. Compare the locked Entry midpoint, swing invalidation, PDH/PDL Target, and
    planned RR against manual plans.
19. Create a temporary `Any alert() function call` alert and confirm each
    enabled event group on realtime candles before relying on notifications.
20. Compare 4H and 1H OB source candles, mitigation, and invalidation against
    manual markup.
21. Record disagreements before changing the Structure, CISD, Displacement, FVG, OB, Liquidity, Risk, or Alert rules.

## Current Limits

- HTF POI currently supports FVG candidates only.
- Order Block is chart context only and is not yet part of POI selection,
  scoring, or Alerts.
- No Breaker, mitigation block, or liquidity POI.
- Liquidity currently supports PDH and PDL only.
- No Asia High/Low, Equal High/Low, or Internal/External Liquidity.
- Structure is a baseline without automated setup type, POI proximity, or a complete setup window.
- CISD and Displacement remain separate conservative baselines without a complete setup-window state machine.
- Displacement has not been calibrated against a manual sample.
- Entry FVG tracks the latest confirmed zone only and has not been calibrated against a manual sample.
- No Entry FVG invalidation beyond Filled status or complete setup-window validation.
- Entry, Stop, and Target use one mechanical baseline each and have not been
  calibrated against manual plans.
- The final Grade covers automated evidence and planned RR only; it does not
  include emotion, news, spread, slippage, or position-size checks.
- No order execution.
- Alert code is implemented, but notifications require a user-created running
  TradingView alert and only trigger on realtime confirmed candles.
- Alert delivery and webhook integration have not yet been validated.
- Premium/discount and displacement are not yet included in HTF confidence.
- Compilation and rendering are confirmed, but manual comparison and heuristic calibration are still required before release readiness.
