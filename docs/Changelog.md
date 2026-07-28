# Changelog

All notable changes to Trading OS will be documented in this file.

## Pine v0.12.0-alpha - 2026-07-28

### Added

- Added completed-close 4H and 1H Breaker detection from invalidated Order
  Blocks.
- Converted invalidated Bullish OBs into Bearish Breakers and invalidated
  Bearish OBs into Bullish Breakers.
- Retained the invalidated OB's full-candle range and source time.
- Added Fresh, Mitigated, and Invalid Breaker lifecycle states.
- Selected the newest active Bullish or Bearish Breaker on each HTF by
  activation time.
- Added dotted 4H and 1H Breaker boxes with directional color when Bias-aligned
  and gray `UNALIGNED` presentation otherwise.
- Added a Display switch for latest HTF Breakers.

### Kept

- Kept the compact ten-row Dashboard and `Small` default size unchanged.
- Kept selected FVG POI, score, Grade, Alerts, and automatic execution behavior
  unchanged.
- Kept Breaker as chart context pending manual calibration.

### Validated

- Compiled Pine v0.12.0-alpha successfully in TradingView Pine Editor.
- Confirmed visible `BEAR BRK · MITIGATED · UNALIGNED` chart context on XAUUSD.
- Confirmed one valid indicator instance and no compile or runtime errors on
  XAUUSD at 5M, 15M, 1H, and 4H.
- Returned the chart to 15M and saved the private script as
  `Trading OS HTF Context v0.12.0` without publishing.

### Pending Manual Review

- Compare Breaker activation, mitigation, invalidation, and source-zone
  selection against manual 4H and 1H markup.

## Pine v0.11.2-alpha - 2026-07-28

### Changed

- Removed the combined HTF Bias gate from Order Block chart visibility.
- When both Bullish and Bearish OBs remain active on one HTF, the zone with the
  newest source candle is shown.
- Kept Bias-aligned OBs in their directional color and changed unaligned OBs
  to neutral gray with an `UNALIGNED` label.

### Kept

- Kept selected FVG POI, score, Grade, Alerts, and automatic execution behavior
  unchanged.

### Validated

- Compiled Pine v0.11.2-alpha successfully in TradingView Pine Editor.
- Confirmed a gray `1H BEAR OB · FRESH · UNALIGNED` zone remains visible while
  the Dashboard reports `4H NEUTRAL · 1H BEAR`.
- Confirmed one valid indicator instance and no compile or runtime errors on
  XAUUSD at 5M, 15M, and 1H.
- Returned the chart to 15M and saved the private script as
  `Trading OS HTF Context v0.11.2` without publishing.
- Confirmed the local Pine source exactly matches the compiled and saved
  TradingView payload.

## Pine v0.11.1-alpha - 2026-07-28

### Changed

- Moved BOS, CHOCH, and MSS labels from the confirmed break bar to the midpoint
  of each historical Structure line.
- Kept the original source swing, confirmed break endpoint, line price, event
  classification, Dashboard, Score, and Alert logic unchanged.

### Validated

- Compiled Pine v0.11.1-alpha successfully in TradingView Pine Editor.
- Saved the private script as `Trading OS HTF Context v0.11.1` without
  publishing.

## Pine v0.11.0-alpha - 2026-07-28

### Added

- Added completed-candle 4H and 1H Order Block detection.
- Required the departure candle to pass the existing Displacement thresholds
  and close beyond the configured prior HTF range.
- Selected the nearest opposing candle as the full-candle OB zone.
- Added Fresh, Mitigated, and Invalid lifecycle states.
- Added Bias-aligned 4H and 1H dashed boxes anchored to actual source time and
  price.
- Added settings for HTF break lookback, opposing-candle search, and OB display.

### Kept

- Kept the compact ten-row Dashboard and `Small` default size unchanged.
- Kept the existing selected FVG POI, score, Grade, and Alert rules unchanged.
- Kept OB as chart context without Buy/Sell orders or automatic execution.

### Validated

- Compiled Pine v0.11.0-alpha successfully in TradingView Pine Editor.
- Confirmed the new OB settings load correctly.
- Confirmed one valid v0.11.0 indicator instance and no compile or runtime
  errors on XAUUSD at 5M, 15M, 1H, and 4H.
- Removed the previous v0.10.0 chart instance.
- Returned the chart to 15M and confirmed the layout was saved.
- Saved the private script as `Trading OS HTF Context v0.11.0` without
  publishing.
- Confirmed the local Pine source exactly matches the compiled and saved
  TradingView payload.

### Pending Manual Review

- Compare 4H and 1H Order Block source candles, mitigation, and invalidation
  against manual markup before adding OB to POI selection or scoring.

## Pine v0.10.0-alpha - 2026-07-28

### Added

- Added one master Alert switch and independent switches for POI, Liquidity,
  Structure, CISD, Displacement, Entry FVG, Risk Review, READY, and NO TRADE.
- Added confirmed-bar event pulses for the existing automated modules.
- Added transition-only alerts for RISK REVIEW, READY TO ENTER, and NO TRADE.
- Added one aggregated dynamic message for multiple enabled events on the same
  candle.
- Added symbol, timeframe, Setup State, Score, Grade, planned RR, and close
  price to the Alert message.

### Kept

- Kept the compact ten-row Dashboard and `Small` default size unchanged.
- Kept the indicator as decision support without Buy/Sell orders or automatic
  execution.
- Kept Alert delivery disabled unless the trader creates a running TradingView
  alert using `Any alert() function call`.

### Validated

- Compiled Pine v0.10.0-alpha successfully in TradingView Pine Editor.
- Confirmed the master switch and all nine Alert event groups load in Settings.
- Confirmed one valid v0.10.0 indicator instance and no compile or runtime
  errors on XAUUSD at 5M, 15M, 1H, and 4H.
- Removed the discarded compile-error chart instance.
- Returned the chart to 15M, saved the layout, and saved the private script as
  `Trading OS HTF Context v0.10.0` without publishing.
- Confirmed the local Pine source exactly matches the compiled and saved
  TradingView payload.

### Pending Manual Review

- Create a temporary running TradingView alert and validate realtime delivery
  for each event group before relying on notifications.
- Validate the alert message against a future Trading Companion webhook
  contract before integration.

## Pine v0.9.0-alpha - 2026-07-28

### Added

- Added a locked Entry/Risk plan for each newly created Entry FVG.
- Set proposed Entry at the Entry FVG midpoint.
- Set Bullish/Bearish Stop Loss at the latest confirmed execution swing
  invalidation.
- Set Bullish/Bearish Target at confirmed PDH/PDL liquidity.
- Added configurable minimum planned RR with `2.0R` as the default.
- Added optional price/time-anchored Entry, Stop, and Target lines and labels.
- Added READY state, final 0-100 score, and A+ to D Grade after the complete
  automated chain and planned RR pass.
- Added final score, planned RR, Entry readiness, and Grade code to the Data
  Window.

### Kept

- Kept the compact ten-row Dashboard and `Small` default size unchanged.
- Kept pending states without a Grade and kept NO TRADE explicit.
- Kept the indicator as decision support without Buy/Sell orders, alerts, or
  automatic execution.

### Validated

- Compiled Pine v0.9.0-alpha successfully in TradingView Pine Editor.
- Reduced duplicate Data Window outputs to stay within TradingView's 64-plot
  limit.
- Confirmed no compile or runtime errors on XAUUSD at 5M, 15M, 1H, and 4H.
- Confirmed final score, planned RR, Entry readiness, and Grade outputs in the
  XAUUSD Data Window.
- Removed the previous v0.8.0 and discarded runtime-error chart instances.
- Returned the chart to 15M, saved the layout, and saved the private script as
  `Trading OS HTF Context v0.9.0` without publishing.

### Pending Manual Review

- Compare Entry midpoint, swing invalidation, PDH/PDL Target, planned RR, READY,
  and Grade against manually reviewed setups before calibration.

## Pine v0.8.0-alpha - 2026-07-28

### Added

- Added a provisional automated Setup State and Score Engine using the
  versioned `score-v1` category weights.
- Added NO TRADE, WAITING, DEVELOPING, and RISK REVIEW states.
- Preserved a confirmed interaction with the currently selected HTF FVG for
  the active setup context window.
- Added direction-aware Liquidity, Structure, CISD, Displacement, and Entry FVG
  scoring.
- Added exact category scores, setup-state code, and next-step code to the Data
  Window.

### Kept

- Kept Entry / Risk at 0 of 5 and the automated Pine score capped at 95.
- Kept the final Grade pending instead of inferring unimplemented risk checks.
- Kept the compact ten-row Dashboard and `Small` default size unchanged.
- Kept the indicator as decision support without Buy/Sell orders or alerts.

### Validated

- Compiled Pine v0.8.0-alpha successfully in TradingView Pine Editor.
- Confirmed the setup-state, total-score, category-score, next-step, manual
  Risk, and pending-Grade outputs in the XAUUSD Data Window.
- Confirmed no runtime errors on XAUUSD at 5M, 15M, 1H, and 4H.
- Returned the chart to 15M and saved the private TradingView script as
  `Trading OS HTF Context v0.8.0` without publishing.

### Pending Manual Review

- Compare each score category and state transition against manual markup.

## Pine v0.7.0-alpha - 2026-07-27

### Added

- Added current-chart Entry FVG detection tied to a confirmed Displacement event.
- Required the Displacement expansion candle to be the middle candle of a valid three-candle imbalance.
- Added support for follow-through confirmation on the first or second candle after expansion.
- Added Fresh, Partial, and Filled Entry FVG lifecycle states.
- Added separate creation, first-retracement, and filled event outputs and labels.
- Added a latest Entry FVG box anchored to actual formation time and exact prices.
- Added exact Entry FVG evidence and price-interaction state to the Data Window.

### Kept

- Reused the existing Status row for active Entry FVG context.
- Kept the compact ten-row Dashboard and `Small` default size unchanged.
- Kept Entry FVG as decision-support context without Buy/Sell signals, grades, risk decisions, or alerts.

### Validated

- Compiled Pine v0.7.0-alpha successfully in TradingView Pine Editor.
- Confirmed one v0.7.0 indicator instance and no runtime alerts on XAUUSD at 5M, 15M, 1H, and 4H.
- Confirmed a Displacement-linked Entry FVG and exact boundaries render in the XAUUSD 15M Data Window.
- Removed the previous v0.6.1 chart instance, returned the chart to 15M, and saved the layout.
- Saved the private TradingView script as `Trading OS HTF Context v0.7.0` without publishing.

## Pine v0.6.1-alpha - 2026-07-27

### Added

- Restored a selected HTF FVG box anchored to its actual origin time and price.
- Added historical PDH/PDL levels, right-edge labels, and confirmed sweep markers.
- Added current swing levels and historical BOS/CHOCH/MSS break segments and labels.
- Added dashed armed CISD levels and solid confirmed CISD event levels on the current chart timeframe.
- Added Displacement Watch and confirmed range boxes with event labels.
- Added independent Display toggles for every chart-drawing group, enabled by default.

### Kept

- Kept the compact ten-row Dashboard and `Small` default text size unchanged.
- Kept all modules as decision-support context without Buy/Sell signals, Entry grades, or alerts.

### Validated

- Compiled Pine v0.6.1-alpha successfully in TradingView Pine Editor.
- Confirmed one v0.6.1 indicator instance and no runtime alerts on XAUUSD at 5M, 15M, 1H, and 4H.
- Confirmed the drawing groups load using actual bar time and price coordinates rather than viewport positioning.
- Removed the previous v0.6.0 chart instance, returned the chart to 15M, and saved the layout.
- Saved the private TradingView script as `Trading OS HTF Context v0.6.1` without publishing.

## Pine v0.6.0-alpha - 2026-07-27

### Added

- Added confirmed current-chart candle body and range expansion checks.
- Added configurable average-body, ATR, body-share, follow-through, and active-context settings.
- Added directional alignment with combined HTF Bias, active Structure, and valid CISD.
- Added a Watch candidate that requires a later confirmed close beyond the expansion candle close.
- Added Medium and Strong Displacement quality.
- Added a Displacement row to the Dashboard and detailed evidence to the Data Window.

### Important

- Displacement remains decision-support context and does not generate a Buy/Sell signal, grade, or alert.
- No Displacement line, box, or label is drawn over the price chart.
- Manual comparison and calibration remain required.

### Validated

- Compiled Pine v0.6.0-alpha successfully in TradingView Pine Editor.
- Confirmed the Displacement settings and updated indicator load without a runtime error on XAUUSD at 5M, 15M, 1H, and 4H.
- Returned the chart to its original 15M timeframe.
- Saved the private TradingView script as `Trading OS HTF Context v0.6.0` without publishing.

## Pine v0.5.3-alpha - 2026-07-27

### Changed

- Removed all armed and confirmed CISD lines from the price chart.
- Removed the CISD line-display setting and line-object code.
- Kept HTF, FVG, Liquidity, Structure, and CISD detection unchanged.
- Kept Structure and CISD state in the Dashboard.
- Kept exact candidate and confirmed values in the Data Window.

### Validated

- Compiled Pine v0.5.3-alpha successfully in TradingView Pine Editor.
- Confirmed Trading OS renders the nine-row Dashboard without CISD or Structure chart drawings on XAUUSD 15M.
- Saved the private TradingView script as `Trading OS HTF Context v0.5.3` without publishing.

## Pine v0.5.2-alpha - 2026-07-27

### Changed

- Removed the separate `CISD timeframe` setting.
- CISD now calculates automatically from the current chart timeframe.
- Changing chart timeframe recalculates delivery legs, candidates, confirmed events, Dashboard state, Data Window values, and CISD lines.
- CISD levels from one chart timeframe are never projected onto another timeframe.

### Validated

- Compiled Pine v0.5.2-alpha successfully in TradingView Pine Editor.
- Confirmed XAUUSD 5M renders the current 5M CISD state and level.
- Confirmed XAUUSD 4H recalculates its own CISD state without retaining the 5M level.
- Returned the chart to the original 15M timeframe.
- Saved the private TradingView script as `Trading OS HTF Context v0.5.2` without publishing.

## Pine v0.5.1-alpha - 2026-07-27

### Added

- Added a selectable CISD timeframe with 5M as the default.
- Added dashed Bullish and Bearish armed CISD candidate levels.
- Added a solid level for the latest active confirmed CISD.
- Added a `Show CISD levels` setting.

### Changed

- CISD state and Data Window values are active only when the chart timeframe matches the selected CISD timeframe.
- Non-matching timeframes show the selected timeframe followed by `ONLY` in the Dashboard.
- CISD is not projected across timeframes.

### Validated

- Compiled Pine v0.5.1-alpha successfully in TradingView Pine Editor.
- Confirmed CISD levels render on XAUUSD 5M.
- Confirmed CISD levels remain hidden and the Dashboard shows `5M ONLY` on XAUUSD 4H.
- Returned the chart to the original 5M timeframe.
- Saved the private TradingView script as `Trading OS HTF Context v0.5.1` without publishing.

## Pine v0.5.0-alpha - 2026-07-27

### Added

- Added strict CISD detection from consecutive bullish and bearish delivery candles.
- Added configurable minimum and maximum delivery candles.
- Added an ATR-based minimum delivery-leg range.
- Added expiring Bullish and Bearish CISD candidate levels.
- Added body-close confirmation through the opening price of the first retained delivery candle.
- Added Weak, Medium, and Strong CISD context quality.
- Added a CISD row to the Dashboard and detailed values to the Data Window.

### Important

- CISD quality uses HTF Bias, POI interaction, confirmed PDH/PDL Sweep, and Structure context.
- Displacement and follow-through are not yet included.
- No CISD lines or labels are drawn over the price chart.
- CISD does not generate Buy/Sell signals or alerts.

### Validated

- Compiled Pine v0.5.0-alpha successfully in TradingView Pine Editor.
- Smoke-tested XAUUSD at 5M, 15M, 1H, and 4H without a runtime error.
- Confirmed the nine-row Dashboard renders CISD direction and quality.
- Saved the private TradingView script as `Trading OS HTF Context v0.5.0` without publishing.

## Pine v0.4.0-alpha - 2026-07-27

### Added

- Added configurable confirmed swing detection on the current execution chart.
- Added close-confirmed BOS when price breaks structure in the current direction.
- Added CHOCH when price closes through structure against the prior direction.
- Added MSS when a CHOCH follows the matching confirmed PDH/PDL sweep within the configured context window.
- Added active Structure state to the Dashboard.
- Added structure event, direction, trend, break level, and confirmed swing values to the Data Window.

### Important

- Structure uses confirmed pivots and confirmed candle closes, so signals intentionally lag live price.
- The baseline does not automate setup type, POI proximity, or the complete setup window.
- Structure remains decision-support context and does not produce Buy/Sell signals or alerts.
- No structure lines or labels are drawn on the price chart.

### Validated

- Compiled Pine v0.4.0-alpha successfully in TradingView Pine Editor.
- Smoke-tested XAUUSD at 5M, 15M, 1H, and 4H without a runtime error.
- Confirmed the eight-row Dashboard renders the active Structure state on XAUUSD 15M.
- Saved the private TradingView script as `Trading OS HTF Context v0.4.0` without publishing.

## Pine v0.3.2-alpha - 2026-07-27

### Changed

- Removed the selected FVG box from the price chart.
- Removed current and historical PDH/PDL chart lines.
- Removed the viewport-pinning and chart-drawing settings.
- Kept FVG state, price location, Liquidity state, and exact values in the Dashboard or Data Window.
- Kept HTF Bias, FVG selection, daily levels, and sweep detection unchanged.

### Important

- This is a presentation-only correction after mobile usability review.
- The optional HTF Bias background remains available.

### Validated

- Compiled Pine v0.3.2-alpha successfully in TradingView Pine Editor.
- Confirmed on XAUUSD 15M that Trading OS draws no FVG box or PDH/PDL chart lines while Dashboard states remain visible.

## Pine v0.3.1-alpha - 2026-07-27

### Changed

- Added a default-on option to stretch the selected current FVG and current PDH/PDL across the visible chart.
- Added a historical display mode that restores the FVG origin and daily PDH/PDL step plots.
- Kept confirmed FVG selection, daily levels, and sweep detection unchanged.
- Added current PDH and PDL values to the Data Window.

### Important

- Viewport-pinned drawings show current context over the visible chart and are not historical evidence.
- Price-level drawings remain attached to their actual prices and still move vertically when the price scale changes.

### Validated

- Compiled Pine v0.3.1-alpha successfully in TradingView Pine Editor.
- Confirmed the current FVG and PDH/PDL remain stretched across the visible XAUUSD 15M chart after horizontal scrolling and zooming.

## Pine v0.3.0-alpha - 2026-07-27

### Added

- Added confirmed Previous Day High and Previous Day Low levels.
- Added confirmed-candle PDH and PDL sweep detection.
- Added one-sweep-per-level tracking that resets each exchange day.
- Added optional PDH/PDL chart plots.
- Added Liquidity state to the compact dashboard and sweep events to the Data Window.

### Validated

- Compiled the v0.3.0 Liquidity baseline in TradingView Pine Editor.
- Confirmed rendering without runtime errors on XAUUSD at 5M, 15M, 1H, and 4H.

### Important

- A sweep is context, not a Buy/Sell or Entry Signal.
- Asia, Equal High/Low, and Internal/External Liquidity remain unimplemented.
- Structure, CISD, Displacement, and risk confirmation remain manual.
- Manual PDH/PDL and sweep-event comparison remains pending.

## Pine v0.2.4-alpha - 2026-07-27

### Changed

- Changed inactive POI and Status dashboard rows to neutral gray.
- Applied active colors only when price touches or enters the selected FVG candidate.
- Kept Bias and Context colors directional because they do not represent POI interaction.

### Important

- This is a presentation-state change only and does not alter FVG detection or selection.

## Pine v0.2.3-alpha - 2026-07-27

### Changed

- Increased the compact dashboard default text size from Tiny to Small.
- Added a Display setting for Tiny, Small, or Normal dashboard text.
- Kept the seven-row compact grouping and all existing Bias/FVG logic unchanged.

## Pine v0.2.2-alpha - 2026-07-27

### Changed

- Reduced the HTF Context dashboard from 11 rows to 7 rows.
- Grouped Primary and Secondary HTF states into one compact row.
- Grouped Combined Bias with Confidence.
- Grouped POI timeframe, direction, and type.
- Grouped FVG status with current price location.
- Reduced all dashboard text to Pine `tiny` size.

### Important

- The compact layout changes presentation only and does not change Bias or FVG logic.

## Pine v0.2.1-alpha - 2026-07-27

### Fixed

- Reformatted tuple returns and tuple declarations for TradingView Pine v6 compiler compatibility.

### Validated

- Compiled the indicator successfully in TradingView Pine Editor.
- Confirmed the indicator renders on XAUUSD at 5M, 15M, 1H, and 4H.
- Confirmed the HTF Context table and selected FVG box render without a compiler error.

### Important

- This was a compile and rendering smoke test, not semantic validation against a complete manual-markup sample.
- Manual structure, FVG selection, and status-transition comparison remain pending.

## Pine v0.2.0-alpha - 2026-07-27

### Added

- Added completed-candle Bullish and Bearish FVG detection on the Primary and Secondary HTFs.
- Added Fresh, Partial, and Filled FVG candidate status.
- Added conservative Bias-aligned candidate selection with Primary HTF priority.
- Added a single latest-candidate box to keep the chart readable.
- Added POI timeframe, status, and current price-location rows to the Pine dashboard.
- Added selected FVG levels and status to the Data Window.

### Important

- The detected zone is an HTF FVG candidate, not a confirmed Entry FVG.
- Displacement, Structure, CISD, and setup-window confirmation are still required in later modules.
- Order Block and Breaker detection remain intentionally unimplemented until their selection rules are explicit.

## Pine v0.1.0-alpha - 2026-07-27

### Added

- Added the Pine Script v6 project baseline under `pine/`.
- Added the first HTF Bias module using confirmed swing structure.
- Added separate Primary 4H and Secondary 1H states.
- Added conservative alignment, conflict, combined Bias, and confidence logic.
- Added a fixed HTF Bias table and optional chart background.
- Added Data Window outputs for Primary, Secondary, Combined, and Conflict states.
- Added Pine setup, test, non-repainting, and limitation notes.

### Important

- The indicator does not generate Buy/Sell signals.
- The first Pine file still requires compilation and chart validation in TradingView Pine Editor.

## v0.11.1 - 2026-07-27

### Added

- Added a dedicated Validation Center for the real-use calibration sprint.
- Added four explicit v1.0 readiness checks.
- Added Realized R, post-trade review, and Screenshot evidence coverage.
- Added Grade Calibration for A+, A, B, and NO TRADE.
- Added Win/Loss score-category comparison using the versioned score breakdown.
- Added a Review Queue for Open Trades, pending SKIP reviews, missing Actual Exit, and incomplete Journal reviews.
- Added Validation Center links to the Dashboard and app navigation.

### Changed

- Defined an 80% minimum target for Realized R and post-trade review coverage.
- Updated the PWA cache for the Validation Sprint release.

## v0.11.0 - 2026-07-27

### Added

- Added five starter Playbooks for Reversal, Continuation, and Session setups.
- Added Setup sequences, rules, invalidations, and execution checklists.
- Added automatic Playbook matching against local Journal trades.
- Added Matching Trades, Closed Trades, Win Rate, and Average R summaries.
- Added Personal Trade examples with local Screenshot previews and Journal links.
- Added local Personal Rules, What Worked, and Avoid Next Time notes.
- Added Playbooks to desktop and mobile navigation.

### Changed

- Promoted the planned Playbook Library to Phase 11.
- Updated the visible Trading OS phase to Phase 11.
- Updated the PWA cache for the Playbook Library release.

## v0.10.0 - 2026-07-27

### Added

- Added TradingView Hub with editable Symbol and Timeframe.
- Added external TradingView Chart links and link copying.
- Added 30-day, 90-day, and all-time Journal export ranges.
- Added UTF-8 CSV export for Trade, risk, result, and review data.
- Added a printable Journal report for browser Save as PDF.
- Added export summaries for Trade count, closed trades, R coverage, Net R, links, and Screenshots.
- Added TradingView Hub to desktop and mobile navigation.

### Changed

- Started Phase 10 while real-use validation continues for earlier phases.
- Updated the visible Trading OS phase to Phase 10.
- Clarified that Trading Companion does not directly access TradingView market data or place orders.
- Updated the PWA cache for the TradingView Integration release.

## v0.9.0 - 2026-07-24

### Added

- Added a local Decision Assistant across HTF, POI, Setup, Confirmation, and Entry.
- Added 23 ordered Rulebook questions with early WAIT and NO TRADE outcomes.
- Added live Grade, Score, progress, blocking conditions, and Next Action.
- Added local assistant-session saving, answer revision, and reset.
- Added one-step answer transfer into the New Trade Wizard.
- Added Decision Assistant to desktop and mobile navigation.

### Changed

- Started Phase 9 while real-use validation continues for earlier phases.
- Updated the visible Trading OS phase to Phase 9.
- Updated the PWA cache for the Decision Assistant release.

## v0.8.3 - 2026-07-24

### Added

- Added a Delete action for saved NO TRADE and SKIP assessments.
- Added permanent-deletion confirmation with Phase 1 validation impact.

### Changed

- Kept ENTERED Trade deletion in the Journal and non-entered assessment deletion on the Dashboard.
- Updated Recent assessments and summary metrics immediately after deletion.
- Updated the PWA cache for the assessment deletion release.

## v0.8.2 - 2026-07-24

### Added

- Added a Delete Trade action to every Open and Closed Journal record.
- Added a permanent-deletion confirmation explaining the impact on reviews, statistics, and the database.
- Added automatic Screenshot cleanup when its Trade is deleted.

### Changed

- Journal summaries now refresh immediately after deleting a Trade.
- Updated the PWA cache for the Journal deletion release.

## v0.8.1 - 2026-07-24

### Added

- Added automatic daily fiat reference rates from Frankfurter.
- Added the reference source and effective date to Currency Converter results.
- Added loading, timeout, invalid-response, and manual-fallback states.
- Added a Google search link for independent rate verification.

### Changed

- Kept manual Exchange Rate editing available for every currency pair.
- Kept USDT on manual rates because the reference-rate provider does not support it.
- Updated the PWA cache for the automatic-rate release.

## v0.8.0 - 2026-07-24

### Added

- Added a direction-aware RR Calculator for Bullish and Bearish plans.
- Added risk distance, reward distance, RR, and break-even win-rate outputs.
- Added Risk Amount and Position Size calculations.
- Added configurable value per 1.0 price move for broker contract differences.
- Added a manual-rate Currency Converter with currency swap.
- Added a fixed Bangkok Session Timer with current, next, and remaining-session time.
- Added input validation and broker contract-specification warnings.
- Added Advanced Tools to desktop and mobile navigation.

### Changed

- Started Phase 8 while real-use validation continues for earlier phases.
- Updated the PWA cache for the Advanced Tools release.
- Updated the visible Trading OS phase to Phase 8.
- Removed the 320px horizontal overflow and made the expanded mobile More menu scroll safely.

## v0.7.0 - 2026-07-24

### Added

- Added a manual context Watchlist for up to 30 symbols.
- Added Gold, Bitcoin, Ethereum, Solana, and Nasdaq as the initial Watchlist.
- Added HTF Bias, Setup Status, Current Zone, Waiting For, and Last Review Note.
- Added Ready, Waiting, No Trade, and Needs Update filters.
- Added a 24-hour context freshness warning.
- Added a Dashboard Watchlist summary that only promotes fresh READY context.
- Added Watchlist to desktop and mobile navigation.

### Changed

- Started Phase 7 while real-use validation continues for earlier phases.
- Updated the PWA cache for the Watchlist release.
- Clarified that Watchlist status is manual context, not live market data.

## v0.6.0 - 2026-07-24

### Added

- Added Daily Session Plans separated by Asia/Bangkok calendar date.
- Added Bullish, Bearish, and Neutral bias with HTF Narrative.
- Added Key POIs, Liquidity Targets, and separate London and New York plans.
- Added News Status, News Note, and No Trade Conditions.
- Added an explainable seven-item plan-readiness checklist.
- Added PLAN EMPTY, PLAN DRAFT, and PLAN READY states.
- Added a current-session plan preview and Dashboard reminder.
- Added Session Planner to desktop and mobile navigation.

### Changed

- Started Phase 6 while real-use validation continues for earlier phases.
- Updated the PWA cache for the Session Planner release.
- Expanded the tablet navigation breakpoint to keep the desktop header readable.
- Moved the Classic Checklist into a desktop More menu as the primary navigation grows.

## v0.5.0 - 2026-07-24

### Added

- Added Monday-to-Sunday Weekly Review navigation using Asia/Bangkok close dates.
- Added weekly Closed Trades, Win Rate, Net R, Expectancy, Average RR, and R Coverage.
- Added seven-day Winning, Losing, Break Even, and Needs R summaries.
- Added weekly mistake totals and evidence-based Strengths and Focus Areas.
- Added saved reflection fields for strengths, improvements, and next-week focus.
- Added a Dashboard reminder for open, due, and saved Weekly Reviews.
- Added a mobile More menu for Database, Weekly Review, and Classic Checklist.

### Changed

- Started Phase 5 while real-use validation continues for earlier phases.
- Updated primary desktop navigation and the PWA cache for Weekly Review.

## v0.4.0 - 2026-07-24

### Added

- Added the first searchable Trade Database for entered trades.
- Added token search across Pair, Setup, Session, Grade, Result, Mistake, and review text.
- Added structured filters for Pair, Setup, Session, Grade, Result, Mistake, and date range.
- Added newest, oldest, highest-R, and lowest-R sorting.
- Added direct links from Database results to matching Journal reviews.
- Added responsive desktop and mobile Database layouts.

### Changed

- Started Phase 4 while real-use validation continues for earlier phases.
- Added Database to primary desktop and mobile navigation.
- Updated Journal cards to support direct highlighted review links.
- Updated the PWA cache for the Database release.

## v0.3.1 - 2026-07-24

### Added

- Added the Monthly Performance Calendar with previous, next, and current-month controls.
- Added daily Winning, Losing, Break Even, and Needs R states.
- Added monthly Net R, Closed Trades, Active Days, and R Coverage.
- Added Asia/Bangkok date grouping for consistent close-date reporting.

### Changed

- Kept the calendar on a stable six-week layout across all months.
- Updated the PWA cache for the calendar release.

## v0.3.0 - 2026-07-24

### Added

- Added the first Statistics page with 30-day, 90-day, and all-time ranges.
- Added Closed Trades, Win Rate, Average RR, Expectancy, Average Hold, and R Coverage.
- Added an Equity Curve based on cumulative Realized R.
- Added Win, Loss, and Break Even distribution.
- Added Session and Setup performance breakdowns.
- Added Statistics navigation on desktop and mobile.

### Changed

- Started Phase 3 while Phase 1 and Phase 2 real-use validation continue.
- Updated the PWA cache to include Statistics assets for offline use.

## v0.2.2 - 2026-07-24

### Added

- Added Actual Exit and Close Note fields for Closed Trades.
- Added automatic Realized RR calculation for Bullish and Bearish positions.
- Added automatic Holding Time from lifecycle timestamps.
- Added positive, negative, and break-even RR states.

### Changed

- Extended Journal records with backward-compatible close-review metadata.
- Updated the PWA cache for the close-review release.

## v0.2.1 - 2026-07-24

### Added

- Added one local Screenshot attachment per entered Trade.
- Added Screenshot preview, full-size view, replacement, and removal controls.
- Added a dedicated IndexedDB media store with PNG, JPG, and WEBP validation.
- Added an 8 MB input limit and clear upload error states.

### Changed

- Extended Journal metadata without storing image data in localStorage.
- Updated the PWA cache to include the Screenshot storage module.

## v0.2.0 - 2026-07-24

### Added

- Added the first Trade Journal page for assessments marked `ENTERED`.
- Added All, Open, and Closed journal filters.
- Added Emotion, Mistakes, Lesson, and TradingView link review fields.
- Added journal summary counts for total, open, closed, and reviewed trades.
- Added Journal navigation on desktop and mobile.

### Changed

- Extended lifecycle records with backward-compatible journal metadata.
- Updated the PWA cache to include the Trade Journal.
- Started Phase 2 while Phase 1 validation continues collecting real-use outcomes.

## v0.1.3 - 2026-07-24

### Added

- Added Phase 1 validation progress with a 20-result evidence target.
- Added GOOD SKIP and MISSED MOVE verdicts for skipped assessments.
- Added closed-outcome, reviewed-skip, and pending-review counters.

### Changed

- Extended assessment records with optional validation metadata.
- Updated the PWA cache for the Phase 1.4 validation release.

## v0.1.2 - 2026-07-24

### Added

- Added an eight-category score breakdown to the final Wizard step.
- Added the `score-v1` profile to new assessment records for future calibration.
- Added category completion counts and earned points.

### Changed

- Grade remains pending until the setup reaches READY TO ENTER.
- Updated the PWA cache for the Phase 1.3 scoring release.

## v0.1.1 - 2026-07-24

### Added

- Added WAIT, SKIP, and ENTERED decisions to the final Wizard step.
- Added Entry, Stop Loss, Take Profit, and automatic Planned RR validation.
- Added Open Position tracking to the Dashboard.
- Added WIN, LOSS, and BREAK EVEN close outcomes.
- Added lifecycle data to assessment records for the future Trade Journal.

### Changed

- Updated Dashboard metrics to show entered trades and open positions.
- Extended local records without removing compatibility with v0.1.0 history.
- Updated the PWA cache for the Phase 1.2 lifecycle release.

## v0.1.0 - 2026-07-24

### Added

- Added the Trading Companion dashboard as the new app home.
- Added a guided five-step New Trade Wizard.
- Added the first Decision Engine for setup state, next action, score, grade, and blocking reasons.
- Added automatic draft saving and local assessment history.
- Added responsive desktop and mobile layouts.
- Added a Trading Companion app mark and reusable interface icons.

### Changed

- Updated the PWA name, theme, and offline asset cache for Phase 1.
- Moved the original Trade Entry Checklist to `checklist.html` and kept its existing local storage behavior.
- Updated the project status from Phase 0 complete to Phase 1 in progress.

## v0.0.2-alpha - 2026-07-24

### Changed

- Renamed the GitHub repository reference from `trade-entry-checklist` to `Trading-Companion`.
- Promoted the user-provided Trading OS product plan to the master roadmap.
- Reframed the roadmap around the web app as the main product track.
- Added phases for core trading app, journal, statistics, trade database, weekly review, session planner, watchlist, tools, AI assistant, and TradingView integration.
- Added Decision Engine and Playbook Library as core long-term roadmap items.
- Kept Pine Script as a parallel supporting track.

## v0.0.1-alpha - 2026-07-23

### Added

- Added Phase 0 documentation structure.
- Added `docs/Rulebook.md` as the first Trading OS rulebook.
- Added `docs/Indicator_Spec.md` to define future module behavior.
- Added `docs/Roadmap.md` to track planned development phases.
- Added `docs/Changelog.md` to track version history.
- Updated `README.md` to identify the project as Trading OS.

### Unchanged

- No changes to `index.html` checklist behavior.
- No changes to `manifest.json` PWA configuration.
- No changes to `sw.js` service worker caching behavior.
- No changes to local storage keys or checklist state logic.
