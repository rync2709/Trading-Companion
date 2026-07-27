# Trading OS Pine Indicator

Version: v0.6.0-alpha

The Pine track automates selected Trading OS context checks without replacing trader judgment.

## Current Module

`TradingOS.pine` currently implements:

- Module 1: HTF Bias baseline
- Module 2 baseline: aligned HTF FVG candidate
- Module 4 baseline: Previous Day High/Low liquidity
- Module 5 baseline: execution-chart BOS/CHOCH/MSS
- Module 6 baseline: strict execution-chart CISD
- Module 7 baseline: execution-chart Displacement and follow-through

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

This is a POI candidate, not a valid Entry FVG. Displacement and complete setup-window confirmation are not implemented yet.

## Compact Dashboard

The dashboard uses ten rows to reduce chart obstruction. Its text size defaults to `Small` and can be changed under Display to `Tiny`, `Small`, or `Normal`.

- HTF: grouped Primary and Secondary states
- Bias: Combined Bias and Confidence
- Context: HTF alignment
- POI: selected timeframe, direction, and FVG type
- Status: FVG status and current price location
- Liquidity: confirmed PDH/PDL sweep state
- Structure: active BOS, CHOCH, MSS, or WAIT
- CISD: active direction with Weak, Medium, Strong, or WAIT quality
- Displacement: Watch candidate, confirmed Medium/Strong direction, conflict, or WAIT

POI and Status rows remain neutral gray while price is `AWAY`. They receive active colors only when price is `TOUCH` or `IN ZONE`. Bias and Context colors remain directional because they describe market context rather than POI interaction.

## Daily Liquidity Baseline

The first Liquidity module uses the confirmed Previous Day High (`PDH`) and Previous Day Low (`PDL`):

- PDH and PDL come from the previous completed Daily candle.
- A PDH sweep requires a confirmed chart candle to trade above PDH and close back below it.
- A PDL sweep requires a confirmed chart candle to trade below PDL and close back above it.
- Only the first confirmed sweep of each level is recorded per exchange day.
- PDH and PDL remain available in the Data Window without drawing horizontal lines on the chart.
- The dashboard remains neutral while waiting and colors the Liquidity row after a sweep.

## Chart Presentation

- The indicator does not draw an FVG box or PDH/PDL lines on the price chart.
- FVG candidate, price-location, and Liquidity states remain in the fixed Dashboard.
- Exact FVG top/bottom and PDH/PDL values remain available in the Data Window.
- The optional HTF Bias background remains the only full-chart visual.
- Structure and CISD remain in the Dashboard and Data Window only.
- No Structure or CISD lines or labels are drawn over the price chart.
- Displacement remains in the Dashboard and Data Window without lines, boxes, or labels.
- Removing chart drawings changes presentation only. Detection and status logic remain unchanged.

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
- No structure lines or labels are drawn over the price chart.

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
- No CISD lines or labels are drawn over the price chart.

CISD remains context only. Displacement is evaluated by a separate module; risk and Entry readiness are not automated.

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
- No Displacement line, box, or label is drawn over the price chart.

Displacement remains decision-support context. It does not generate a Buy/Sell signal, grade, alert, or automatic Entry.

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
- Manual structure and FVG comparison remains pending and must not be inferred from the smoke test.
- Manual PDH/PDL and sweep-event comparison remains pending.
- Manual Displacement candidate and follow-through comparison remains pending.

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
13. Confirm Trading OS adds no CISD or Structure drawing to the price chart.
14. Compare Watch, Medium, and Strong Displacement states with manually marked expansion and follow-through.
15. Confirm Trading OS adds no Displacement drawing to the price chart.
16. Record disagreements before changing the Structure, CISD, Displacement, FVG, or Liquidity rules.

## Current Limits

- HTF POI currently supports FVG candidates only.
- No Order Block, Breaker, mitigation block, or liquidity POI.
- Liquidity currently supports PDH and PDL only.
- No Asia High/Low, Equal High/Low, or Internal/External Liquidity.
- Structure is a baseline without automated setup type, POI proximity, or a complete setup window.
- CISD and Displacement remain separate conservative baselines without a complete setup-window state machine.
- Displacement has not been calibrated against a manual sample.
- No Entry FVG confirmation or setup-window validation.
- No Entry grade or alert.
- Premium/discount and displacement are not yet included in HTF confidence.
- Compilation and rendering are confirmed, but manual comparison and heuristic calibration are still required before release readiness.
