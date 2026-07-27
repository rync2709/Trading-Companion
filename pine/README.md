# Trading OS Pine Indicator

Version: v0.1.0-alpha

The Pine track automates selected Trading OS context checks without replacing trader judgment.

## Current Module

`TradingOS.pine` currently implements only Module 1: HTF Bias.

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

## Non-Repainting Baseline

The script requests the previous completed HTF state. Confirmed pivots also require bars on both sides, so the output intentionally lags live price. This tradeoff avoids treating a still-forming HTF structure as confirmed.

## TradingView Test

1. Open Pine Editor in TradingView.
2. Paste the contents of `TradingOS.pine`.
3. Save and add the indicator to a chart.
4. Test on 5M, 15M, 1H, and 4H charts.
5. Compare the table with manually marked 4H and 1H swing structure.
6. Record disagreements before changing the swing length or structure rules.

## Current Limits

- No HTF POI detection.
- No liquidity, MSS/CHOCH/BOS, CISD, displacement, or FVG module.
- No Entry grade or alert.
- Premium/discount and displacement are not yet included in HTF confidence.
- The file must still be compiled in TradingView Pine Editor before it is considered release-ready.
