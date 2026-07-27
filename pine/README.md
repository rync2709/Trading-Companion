# Trading OS Pine Indicator

Version: v0.2.1-alpha

The Pine track automates selected Trading OS context checks without replacing trader judgment.

## Current Module

`TradingOS.pine` currently implements:

- Module 1: HTF Bias baseline
- Module 2 baseline: aligned HTF FVG candidate

Defaults:

- Primary HTF: 4H
- Secondary HTF: 1H
- Confirmed swing length: 3

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

This is a POI candidate, not a valid Entry FVG. Displacement, Structure, CISD, and setup-window confirmation are not implemented yet.

## Non-Repainting Baseline

The script requests the previous completed HTF state. Confirmed pivots also require bars on both sides, so the output intentionally lags live price. This tradeoff avoids treating a still-forming HTF structure as confirmed.

## TradingView Test

Compile status:

- Compiled successfully in TradingView Pine Editor on 2026-07-27.
- Render smoke test passed on XAUUSD at 5M, 15M, 1H, and 4H.
- The HTF Context table and selected FVG box rendered without a compiler error.
- Manual structure and FVG comparison remains pending and must not be inferred from the smoke test.

1. Open Pine Editor in TradingView.
2. Paste the contents of `TradingOS.pine`.
3. Add the indicator to a chart.
4. Test on 5M, 15M, 1H, and 4H charts.
5. Compare the table with manually marked 4H and 1H swing structure.
6. Compare the selected FVG candidate with manually marked three-candle imbalances.
7. Confirm Fresh, Partial, and Filled transitions on completed HTF candles.
8. Record disagreements before changing the structure or FVG rules.

## Current Limits

- HTF POI currently supports FVG candidates only.
- No Order Block, Breaker, mitigation block, or liquidity POI.
- No liquidity, MSS/CHOCH/BOS, CISD, or displacement module.
- No Entry FVG confirmation or setup-window validation.
- No Entry grade or alert.
- Premium/discount and displacement are not yet included in HTF confidence.
- Compilation and rendering are confirmed, but manual comparison and heuristic calibration are still required before release readiness.
