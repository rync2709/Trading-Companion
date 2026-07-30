# Trading OS Master Roadmap

Version: v0.13.0 / Pine v0.14.1-alpha
Status: Master product roadmap

## Product Direction

Trading OS will evolve from the current Trade Entry Checklist into a full trading companion app.

The main product track is the web app. Pine Script and TradingView integration are supporting tracks that should connect to the same rulebook and decision logic over time.

## Phase 0 - Foundation

Goal: prepare the project for long-term development.

Tasks:

- [x] Create GitHub repository
- [x] Set up GitHub Pages
- [x] Create installable PWA baseline
- [x] Create initial project structure
- [x] Add documentation structure
- [x] Add versioning and changelog
- [x] Define Trading OS as the product direction

Result:

- Existing checklist is online.
- Repository is ready for structured development.
- Phase 0 documents exist under `docs/`.

Current repository:

```text
Trading-Companion/
```

Future product name:

```text
Trading OS
```

## Phase 1 - Core Trading App

Goal: replace the manual checklist with a guided trading workflow.

Priority: highest.

Status: In progress.

First milestone:

- [x] Create the core dashboard.
- [x] Create the five-step New Trade Wizard.
- [x] Add automatic local draft saving.
- [x] Add initial smart states: WAITING, DEVELOPING, READY, and NO TRADE.
- [x] Add initial score, grade, and blocking-reason logic.
- [x] Preserve the original checklist as the Classic Checklist.
- [x] Update the PWA shell and offline cache for Phase 1 pages.
- [x] Add WAIT, SKIP, and ENTERED lifecycle decisions.
- [x] Add Entry, Stop Loss, Take Profit, and Planned RR.
- [x] Add open-position tracking and close outcomes.
- [x] Add the initial lifecycle record for the Phase 2 journal handoff.
- [x] Add an explainable category breakdown and score profile to saved records.
- [x] Add Phase 1 validation progress and post-SKIP verdicts.
- [x] Add permanent deletion for saved NO TRADE and SKIP assessments.
- [ ] Calibrate scoring weights against real trade examples.
- [ ] Validate the workflow through repeated real-use sessions.

### Dashboard

Expected widgets:

- Today's trades
- Win rate
- Current session
- Open position
- A+ setup status

### New Trade Wizard

The app should guide a trader step by step:

```text
Step 1: HTF Narrative
-> Step 2: POI
-> Step 3: Reversal / Continuation
-> Step 4: Confirmation
-> Step 5: Entry
-> Execute
```

### Smart Status

The app should know which stage the setup is currently in and show the next required action.

Example flow:

```text
WAIT FOR HTF POI
-> WAIT FOR BOS
-> WAIT FOR CISD
-> WAIT FOR DISPLACEMENT
-> WAIT FOR FVG
-> WAIT FOR RETRACE
-> READY TO ENTER
```

### Grade

Supported setup grades:

- A+
- A
- B
- NO TRADE

### Journal

After entry, the trade should be stored in the journal.

Phase 1 target:

- The app can be used instead of the current static checklist.

## Phase 2 - Trade Journal

Goal: record trade context, trade quality, and mistakes.

Status: In progress.

First milestone:

- [x] Create a Journal page for assessments marked `ENTERED`.
- [x] Show Open and Closed trades in one history.
- [x] Add All, Open, and Closed filters.
- [x] Add Emotion, Mistakes, Lesson, and TradingView link fields.
- [x] Preserve compatibility with existing Phase 1 lifecycle records.
- [x] Keep journal data local to the current browser.
- [x] Add local Screenshot upload, preview, full-size view, replacement, and removal.
- [x] Add Actual Exit, automatic Realized RR, Close Note, and Holding Time.
- [x] Add permanent Trade deletion with confirmation and Screenshot cleanup.
- [ ] Validate post-trade review fields through repeated real use.

Journal fields:

- Screenshot
- TradingView link
- Emotion
- Mistake
- Lesson
- Actual Exit
- Realized RR
- Close Note
- Holding Time
- Pair
- Session
- Setup type

Emotion examples:

- Calm
- Neutral
- Angry
- Fearful
- Overconfident

Mistake examples:

- FOMO
- Late entry
- No HTF context
- Ignored CISD
- Ignored displacement

Pair examples:

- BTC
- ETH
- XAU
- NASDAQ

Session examples:

- Asia
- London
- New York

Setup examples:

- Reversal
- Continuation

## Phase 3 - Statistics

Goal: turn journal data into useful performance feedback.

Status: In progress.

First milestone:

- [x] Add 30-day, 90-day, and all-time statistics ranges.
- [x] Add Closed Trades, Win Rate, Average RR, Expectancy, Average Hold, and R Coverage.
- [x] Add an Equity Curve based on cumulative Realized R.
- [x] Add Win, Loss, and Break Even distribution.
- [x] Add Session and Setup performance breakdowns.
- [x] Keep incomplete Actual Exit data visible without treating it as zero R.
- [x] Add the monthly performance calendar.
- [ ] Validate statistics against a larger real-trade sample.

Dashboard metrics:

- Total trades
- Win rate
- Average RR
- Expectancy
- Average hold time

Charts:

- Equity curve
- Calendar view
- Win/loss distribution
- Session performance
- Setup performance

Calendar states:

- Winning day
- Losing day
- Break-even or no-trade day

## Phase 4 - Trade Database

Goal: make every past trade searchable and reusable as study material.

Status: In progress.

First milestone:

- [x] Add a database for every assessment marked `ENTERED`.
- [x] Add token search across trade context and review text.
- [x] Add Pair, Setup, Session, Grade, Result, Mistake, and date-range filters.
- [x] Add newest, oldest, highest-R, and lowest-R sorting.
- [x] Add database result summaries and clear empty states.
- [x] Link each result to the matching Journal review.
- [ ] Validate search terms and filters against a larger real-trade sample.

Search filters:

- Pair
- Setup type
- Session
- Grade
- Date range
- Mistake
- Result

Example searches:

- BTC reversal London A+
- XAU continuation New York
- Trades with FOMO mistakes

Expected result:

- The trader can quickly review all similar trades and study patterns.

## Phase 5 - Weekly Review

Goal: help the trader review performance every week.

Status: In progress.

First milestone:

- [x] Add Monday-to-Sunday review navigation using Asia/Bangkok close dates.
- [x] Add Closed Trades, Win Rate, Net R, Expectancy, Average RR, and R Coverage.
- [x] Add a seven-day result strip with explicit incomplete-R states.
- [x] Aggregate recorded Journal mistakes for the selected week.
- [x] Generate evidence-based Strengths and Focus Areas.
- [x] Save strengths, improvements, and next-week focus per week.
- [x] Add a current-week review reminder to the Dashboard.
- [x] Add a scalable mobile More menu for secondary product areas.
- [ ] Validate weekly insights against a larger real-trade sample.

Weekly review summary:

- Trades
- Wins
- Losses
- Win rate
- Average RR
- Expectancy

Mistake summary examples:

- Ignored HTF
- Late entry
- FOMO
- Ignored CISD
- Ignored displacement

Strength summary examples:

- Excellent patience
- Excellent risk management
- Strong setup filtering
- Good session discipline

Expected behavior:

- The app asks the trader to review the week.
- The review turns journal data into lessons and action points.

## Phase 6 - Session Planner

Goal: plan the trading day before the market opens.

Status: In progress.

First milestone:

- [x] Save a separate Session Plan for each Asia/Bangkok calendar date.
- [x] Add Bullish, Bearish, and Neutral daily bias.
- [x] Add HTF Narrative, Key POIs, and Liquidity Targets.
- [x] Add separate London and New York execution plans.
- [x] Add News Status, News Note, and No Trade Conditions.
- [x] Add an explainable seven-item readiness checklist.
- [x] Add PLAN EMPTY, PLAN DRAFT, and PLAN READY states.
- [x] Preview the relevant Session Plan using Bangkok time.
- [x] Add current-day plan status to the Dashboard.
- [ ] Validate the Session Planner through repeated pre-market use.

Planned fields:

- Today's bias
- London plan
- New York plan
- Key POIs
- Liquidity targets
- News or no-trade warnings

Example:

```text
Today's Bias: Bullish
London Plan: Wait for pullback into HTF POI
New York Plan: Only trade after liquidity sweep and CISD
```

## Phase 7 - Watchlist

Goal: track multiple instruments and setup states.

Status: In progress.

First milestone:

- [x] Start with Gold, Bitcoin, Ethereum, Solana, and Nasdaq.
- [x] Add, edit, and remove Watchlist symbols.
- [x] Track HTF Bias, Setup Status, Current Zone, Waiting For, and Last Review Note.
- [x] Filter Ready, Waiting, No Trade, and Needs Update states.
- [x] Warn when Context is missing or older than 24 hours.
- [x] Add fresh Watchlist status to the Dashboard.
- [x] Keep Watchlist data manual until a supported market-data integration is designed.
- [ ] Validate the Watchlist through repeated session preparation.

Planned assets:

- BTC
- ETH
- SOL
- Gold
- NASDAQ

For each asset, show:

- HTF bias
- Current zone
- Waiting state
- Ready state
- Last review note

## Phase 8 - Advanced Tools

Goal: add practical trading calculators and utilities.

Status: In progress.

First milestone:

- [x] Add a direction-aware RR Calculator.
- [x] Show risk distance, reward distance, and break-even win rate.
- [x] Add Risk Amount and Position Size calculations.
- [x] Support configurable value per 1.0 price move.
- [x] Add a Currency Converter with automatic daily fiat reference rates.
- [x] Show the reference source and date with a manual-rate fallback.
- [x] Add currency swap and a Google verification link.
- [x] Add a fixed Asia/Bangkok Session Timer and next-session countdown.
- [x] Validate incomplete, invalid, and directionally incorrect inputs.
- [x] Keep all calculations local and warn about broker contract specifications.
- [ ] Validate calculator outputs against the instruments and broker contracts used in practice.

Planned tools:

- RR calculator
- Risk calculator
- Position size calculator
- Currency converter
- Session timer

## Phase 9 - AI Decision Assistant

Goal: create a guided assistant that challenges weak trade ideas.

Status: In progress.

First milestone:

- [x] Add a local Rulebook conversation across HTF, POI, Setup, Confirmation, and Entry.
- [x] Ask 23 ordered questions mapped to the shared Decision Engine.
- [x] Stop early when context is unclear or a required condition fails.
- [x] Show explainable WAIT, NO TRADE, and READY verdicts.
- [x] Show live Grade, Score, progress, blocking conditions, and Next Action.
- [x] Save the current assistant session locally and support answer revision.
- [x] Transfer assistant answers into the New Trade Wizard.
- [x] Keep the first milestone independent from external AI APIs.
- [ ] Validate the question order and wording through repeated real-use sessions.
- [ ] Decide whether a future AI explanation layer adds value without replacing deterministic rules.

Example interaction:

```text
Trader: Should I trade?
App: What is the HTF context?
App: Is price inside POI?
App: Is there CISD?
App: Is there displacement?
App: Is there a valid FVG?
```

Possible outputs:

- NO TRADE
- WAIT
- A
- A+
- READY

Important rule:

- AI should ask for missing context instead of giving random trade calls.

## Phase 10 - TradingView Integration

Goal: connect Trading OS with TradingView in ways that are realistic for a web app.

Status: Production Worker connected; TradingView alert active, Webhook pending
2FA.

First milestone:

- [x] Add a TradingView Chart Launcher with editable symbol and timeframe.
- [x] Open TradingView as an external chart without claiming direct data access.
- [x] Preserve Screenshot import and TradingView links in the Journal.
- [x] Add 30-day, 90-day, and all-time Journal export ranges.
- [x] Add UTF-8 CSV export with Trade, risk, result, and review fields.
- [x] Add a printable Journal report for browser Save as PDF.
- [x] Generate export files locally without uploading Journal data.
- [x] Document the limits around market data and order placement.
- [x] Define the versioned `trading-companion.alert.v1` JSON contract.
- [x] Add a local Indicator Alert Inbox with duplicate protection.
- [x] Add WAIT, SKIP, Review Entry, and delete actions.
- [x] Map compatible Indicator evidence into a New Trade Draft.
- [x] Recalculate the detailed web score before allowing ENTRY.
- [x] Add a deployment-ready authenticated Webhook receiver and D1 Inbox source.
- [x] Keep TradingView Webhook and browser Sync authentication separate.
- [x] Add browser connection settings, manual Sync, and optional 60-second Sync.
- [x] Define 30-day retention and deletion tombstones for cross-device consistency.
- [x] Deploy the Worker and configure production D1, Secrets, retention, and
  allowed origin.
- [x] Connect Trading Companion to the production Worker.
- [x] Validate production Webhook receipt, browser Sync, remote WAIT, and
  deletion tombstones with a synthetic contract-valid Alert.
- [x] Expose `Any alert() function call`, compile Pine v0.14.1, save it
  privately, and create a running TradingView alert.
- [ ] Enable TradingView 2FA, attach the protected Worker URL to the running
  alert, and validate realtime delivery.
- [ ] Validate live cross-device synchronization and retention in production.
- [ ] Validate exported CSV and PDF reports against a larger real-trade sample.

Supported scope:

- Import screenshots
- Import validated Trading OS Alert JSON
- Triage Indicator Alerts locally
- Receive and synchronize Alerts through an optional private Worker
- Open chart links
- Attach trade ideas
- Export journal as PDF
- Export journal as CSV

Constraints:

- Direct TradingView data access has platform limitations. Integration should be designed around supported workflows.
- GitHub Pages remains a static frontend and cannot receive the Webhook itself.
- The production Worker is active. Automatic TradingView delivery remains
  inactive until the running TradingView alert is created and verified.

## Decision Engine

Goal: move beyond static checkboxes.

The app should understand the setup sequence:

```text
HTF
-> POI
-> Reversal / Continuation
-> MSS / BOS
-> CISD
-> Displacement
-> FVG
-> Retrace
```

Expected output:

- Current step
- Next step
- Blocking reason
- Setup grade
- Final trade state

Example:

```text
Next Step: WAIT FOR DISPLACEMENT
```

## Phase 11 - Playbook Library

Goal: turn repeated trading experience into a personal knowledge base.

Status: In progress.

First milestone:

- [x] Add A+ Reversal, A Continuation, NY Open Sweep, London Reversal, and Asian Liquidity Raid.
- [x] Add a Setup sequence, rules, invalidations, and execution checklist to every Playbook.
- [x] Match each Playbook against local Journal trades.
- [x] Show Matching Trades, Closed Trades, Win Rate, and Average R.
- [x] Add Personal Win/Loss examples with direct Journal links.
- [x] Load local Screenshot previews when available.
- [x] Save Personal Rules, What Worked, and Avoid Next Time notes locally.
- [ ] Validate Playbook matching rules against a larger real-trade sample.
- [ ] Refine rules and invalidations from repeated weekly reviews.

Planned playbooks:

- A+ Reversal
- A Continuation
- New York Open Sweep
- London Reversal
- Asian Liquidity Raid

Each playbook should include:

- Example image
- Rules
- Invalidation rules
- Checklist
- Winning examples
- Losing examples
- Lessons from personal trades

Expected long-term value:

- Trading OS becomes a knowledge base built from the trader's own experience, not just a checklist.

## Validation Sprint - v1.0 Readiness

Goal: make the remaining real-use validation work measurable before calibrating the Score and Rulebook.

Status: In progress.

First milestone:

- [x] Add a dedicated Validation Center.
- [x] Keep the existing target of 20 validated outcomes.
- [x] Track Realized R and post-trade review coverage.
- [x] Define 80% minimum coverage targets for Calibration readiness.
- [x] Add Grade Calibration for A+, A, B, and NO TRADE.
- [x] Compare every versioned score category across Win and Loss records.
- [x] Add a Review Queue for incomplete evidence.
- [ ] Collect at least 20 real-use outcomes.
- [ ] Reach at least 80% Realized R coverage.
- [ ] Reach at least 80% post-trade review coverage.
- [ ] Resolve all pending SKIP reviews.
- [ ] Review score-category differences before changing any weight.

Important rule:

- Validation Center reports evidence quality but does not automatically change scoring weights.
- Score changes require a documented review after the minimum sample and coverage targets are met.

## Future Project Structure

Target structure for the larger app:

```text
Trading-Companion/
|-- index.html
|-- trade.html
|-- journal.html
|-- stats.html
|-- review.html
|-- settings.html
|-- css/
|   |-- style.css
|   |-- dashboard.css
|   `-- wizard.css
|-- js/
|   |-- app.js
|   |-- trade.js
|   |-- dashboard.js
|   |-- journal.js
|   |-- stats.js
|   |-- storage.js
|   |-- grade.js
|   `-- logic.js
|-- assets/
|-- icons/
|-- data/
|-- manifest.json
|-- sw.js
`-- README.md
```

This structure is a future target. It should not be forced into the current repository until Phase 1 begins.

## Parallel Track - Pine Script Indicator

The Pine Script indicator is still important, but it should support the web app instead of replacing it.

Status: In progress.

First milestone:

- [x] Create the Pine project structure.
- [x] Add a Pine Script v6 indicator baseline.
- [x] Add confirmed Primary 4H and Secondary 1H swing-structure states.
- [x] Add conservative alignment, conflict, combined Bias, and confidence logic.
- [x] Add a fixed HTF Bias table and optional background.
- [x] Request the previous completed HTF state.
- [x] Add completed-candle 4H/1H FVG candidates.
- [x] Add Fresh, Partial, and Filled candidate status.
- [x] Select only a Bias-aligned candidate with Primary HTF priority.
- [x] Add a latest-candidate box and price-location status.
- [x] Compile the first file in TradingView Pine Editor.
- [x] Smoke-test indicator rendering on XAUUSD at 5M, 15M, 1H, and 4H.
- [x] Reduce the HTF Context dashboard to a compact seven-row layout.
- [x] Add Tiny, Small, and Normal dashboard text-size settings with Small as default.
- [x] Keep inactive POI and Status rows neutral until price touches the selected zone.
- [x] Add confirmed Previous Day High and Previous Day Low levels.
- [x] Add first confirmed PDH/PDL sweep tracking per exchange day.
- [x] Add compact Liquidity state without creating an Entry Signal.
- [x] Smoke-test PDH/PDL rendering on XAUUSD at 5M, 15M, 1H, and 4H.
- [x] Add an optional viewport-pinned display for the current FVG and PDH/PDL.
- [x] Compile and scroll/zoom test the viewport-pinned display in TradingView.
- [x] Remove the FVG box and PDH/PDL chart lines after mobile usability review.
- [x] Compile and visually confirm the dashboard-only presentation in TradingView.
- [x] Add a confirmed execution-chart BOS/CHOCH/MSS baseline.
- [x] Add Structure state to the Dashboard and Data Window without chart drawings.
- [x] Compile and smoke-test Structure on XAUUSD at 5M, 15M, 1H, and 4H.
- [x] Add a strict execution-chart CISD baseline.
- [x] Add CISD quality and context state to the Dashboard and Data Window.
- [x] Compile and smoke-test CISD on XAUUSD at 5M, 15M, 1H, and 4H.
- [x] Add a selectable CISD timeframe with 5M as default.
- [x] Draw armed and confirmed CISD levels only on the selected timeframe.
- [x] Confirm CISD levels display on 5M and remain hidden on 4H.
- [x] Remove the separate CISD timeframe setting.
- [x] Make CISD automatically follow and recalculate on the current chart timeframe.
- [x] Confirm 5M and 4H each use their own CISD state without cross-timeframe projection.
- [x] Remove CISD lines and return Trading OS to Dashboard-only presentation.
- [x] Confirm Structure and CISD remain available in Dashboard and Data Window.
- [x] Add a confirmed current-chart Displacement baseline.
- [x] Add Displacement Watch, Medium, and Strong state to the Dashboard and Data Window without chart drawings.
- [x] Restore the selected HTF FVG box with actual time and price anchoring.
- [x] Restore PDH/PDL levels and confirmed sweep markers.
- [x] Draw current swings and historical BOS/CHOCH/MSS events.
- [x] Draw armed and confirmed current-chart CISD levels.
- [x] Draw Displacement Watch and confirmed range boxes.
- [x] Keep the ten-row Dashboard and `Small` default size unchanged.
- [x] Compile, load, and save Pine v0.6.1 privately in TradingView.
- [x] Add a Displacement-linked current-chart Entry FVG baseline.
- [x] Track Entry FVG Fresh, Partial, Filled, and price-interaction state.
- [x] Draw the latest Entry FVG and creation/retracement/fill labels.
- [x] Reuse the existing Status row and keep the ten-row Dashboard unchanged.
- [x] Compile, load, and save Pine v0.7.0 privately in TradingView.
- [x] Add a provisional automated Setup State and score-v1 category mapping.
- [x] Keep Entry/Risk at 0 of 5 and the final Grade pending until risk rules exist.
- [x] Reuse the existing Status row and keep the ten-row Dashboard unchanged.
- [x] Compile, load, and save Pine v0.8.0 privately in TradingView.
- [x] Lock Entry at the Entry FVG midpoint when a new zone is created.
- [x] Lock Stop Loss to the latest confirmed execution swing invalidation.
- [x] Lock Target to confirmed PDH/PDL liquidity.
- [x] Add configurable minimum planned RR with `2.0R` as the default.
- [x] Draw optional price-anchored Entry, Stop, and Target levels.
- [x] Add READY state, final 0-100 score, and A+ to D Grade.
- [x] Keep the ten-row Dashboard and `Small` default size unchanged.
- [x] Compile, load, smoke-test, and save Pine v0.9.0 privately in TradingView.
- [x] Add a master Alert switch and nine configurable event groups.
- [x] Aggregate enabled same-candle events into one dynamic message.
- [x] Restrict Alert evaluation to confirmed chart candles and state
  transitions.
- [x] Compile, load, smoke-test, and save Pine v0.10.0 privately in TradingView.
- [x] Create a running TradingView alert using
  `Any alert() function call` with app notification enabled.
- [ ] Enable TradingView 2FA, add the Webhook URL, and validate delivery from
  a realtime confirmed candle. The production receiver and Companion Sync
  path are already validated.
- [x] Detect the latest 4H and 1H Order Block from a qualified HTF departure.
- [x] Track Fresh, Mitigated, and Invalid Order Block states.
- [x] Draw aligned 4H and 1H Order Blocks at actual source time and price.
- [x] Keep Order Block context separate from scoring and Alerts.
- [x] Compile, load, smoke-test, and save Pine v0.11.0 privately in TradingView.
- [x] Move BOS/CHOCH/MSS labels to the midpoint of each Structure line.
- [x] Compile and save Pine v0.11.1 privately in TradingView.
- [x] Keep the latest active 4H and 1H Order Block visible regardless of Bias.
- [x] Show unaligned Order Blocks in gray with an `UNALIGNED` label.
- [x] Compile, smoke-test, and save Pine v0.11.2 privately in TradingView.
- [x] Convert completed-close HTF Order Block invalidations into opposite
  Breakers.
- [x] Track Fresh, Mitigated, and Invalid 4H/1H Breaker states.
- [x] Draw dotted Bias-aligned or gray `UNALIGNED` Breaker chart context.
- [x] Keep Breaker context separate from the Dashboard, scoring, and Alerts.
- [x] Compile, smoke-test, and save Pine v0.12.0 privately in TradingView.
- [x] Add Manual Assessment as the default Dashboard mode.
- [x] Add manual Bullish, Bearish, and Neutral Narrative selection.
- [x] Add eight weighted checklist confirmations and a NO TRADE override.
- [x] Calculate manual Setup Status, 0-100 Score, and A+ to D Grade.
- [x] Keep Automatic mode available without changing chart drawings, Data
  Window outputs, or confirmed-bar Alerts.
- [x] Keep the compact ten-row Dashboard and `Small` default size unchanged.
- [x] Compile, smoke-test, and save Pine v0.13.0 privately in TradingView.
- [x] Change confirmed-bar Alert messages to
  `trading-companion.alert.v1` JSON.
- [x] Include Manual or Automatic Narrative, State, Score, Grade, Checklist,
  Risk Plan, Symbol, Timeframe, and event time.
- [x] Compile, smoke-test, and save Pine v0.14.0 privately in TradingView.
- [x] Add the named `Trading Companion Sync` fallback condition and compact
  Dashboard snapshot payload.
- [x] Compile and save Pine v0.14.1 privately without publishing.
- [x] Confirm `Any alert() function call` appears and create the running alert.
- [ ] Compare Order Block source, mitigation, and invalidation against manual
  4H/1H markup.
- [ ] Compare Breaker activation, mitigation, and invalidation against manual
  4H/1H markup.
- [ ] Compare the output against manually marked 4H/1H structure.
- [ ] Compare FVG candidates and status transitions against manual markup.
- [ ] Compare execution BOS/CHOCH/MSS events against manual markup.
- [ ] Compare Bullish and Bearish CISD events against manual markup.
- [ ] Compare Displacement candidates and confirmed follow-through against manual markup.
- [ ] Compare Entry FVG formation and lifecycle transitions against manual markup.
- [ ] Compare Entry, Stop, Target, and planned RR against manual plans.
- [ ] Record disagreement examples before calibrating the heuristic.

Planned modules:

- [x] HTF Bias baseline
- [x] HTF POI - FVG candidate baseline
- [x] HTF POI - Order Block chart-context baseline
- [x] HTF POI - Breaker chart-context baseline
- [ ] HTF POI - Liquidity and Premium/Discount
- [x] Liquidity - Previous Day High/Low baseline
- [ ] Liquidity - Asia, Equal High/Low, and Internal/External expansion
- [x] Structure: MSS, CHOCH, BOS baseline
- [x] CISD baseline
- [x] Displacement baseline
- [x] FVG / Entry Zone baseline
- [x] Risk / Entry planning baseline
- [x] Score Engine baseline
- [x] Alert System baseline

Expected outputs:

- Bias
- POI status
- Setup state
- Score
- Grade
- Entry readiness
- Alert events

## Version Targets

| Version | Target |
| --- | --- |
| v0.0.1-alpha | Phase 0 documentation baseline |
| v0.0.2-alpha | Master product roadmap |
| v0.1.0 | Core dashboard and new trade wizard draft |
| v0.1.1 | Trade lifecycle and open-position tracking |
| v0.2.0 | Trade journal |
| v0.3.0 | Statistics dashboard |
| v0.4.0 | Trade database and filters |
| v0.5.0 | Weekly review |
| v0.6.0 | Session planner |
| v0.7.0 | Watchlist |
| v0.8.0 | Advanced tools |
| v0.8.1 | Automatic fiat reference rates |
| v0.8.2 | Journal trade deletion |
| v0.8.3 | NO TRADE and SKIP assessment deletion |
| v0.9.0 | Local Decision Assistant prototype |
| v0.10.0 | TradingView evidence workflow and Journal export |
| v0.11.0 | Personal Playbook Library |
| v0.11.1 | Real-use Validation Center and v1.0 readiness |
| v0.12.0 | Local Indicator Alert Inbox and TradingView JSON bridge |
| v0.13.0 | Authenticated webhook Worker and cross-device Inbox sync source |
| Pine v0.1.0-alpha | Confirmed 4H/1H HTF Bias baseline |
| Pine v0.2.0-alpha | Bias-aligned 4H/1H FVG candidate baseline |
| Pine v0.2.1-alpha | TradingView compile compatibility and multi-timeframe render smoke test |
| Pine v0.2.2-alpha | Compact HTF Context dashboard |
| Pine v0.2.3-alpha | Adjustable compact dashboard text size |
| Pine v0.2.4-alpha | Neutral inactive POI and Status dashboard colors |
| Pine v0.3.0-alpha | Previous Day High/Low liquidity and sweep baseline |
| Pine v0.3.1-alpha | Viewport-pinned current FVG and PDH/PDL display |
| Pine v0.3.2-alpha | Dashboard-only FVG and liquidity context without chart drawings |
| Pine v0.4.0-alpha | Confirmed execution-chart BOS/CHOCH/MSS baseline |
| Pine v0.5.0-alpha | Strict execution-chart CISD and context-quality baseline |
| Pine v0.5.1-alpha | Timeframe-scoped armed and confirmed CISD levels |
| Pine v0.5.2-alpha | Automatic current-chart CISD timeframe behavior |
| Pine v0.5.3-alpha | Dashboard-only Structure and CISD presentation |
| Pine v0.6.0-alpha | Current-chart Displacement and follow-through baseline |
| Pine v0.6.1-alpha | Full price/time-anchored chart context with unchanged compact Dashboard |
| Pine v0.7.0-alpha | Displacement-linked Entry FVG and retracement baseline |
| Pine v0.8.0-alpha | Provisional automated Setup State and Score Engine |
| Pine v0.9.0-alpha | Locked Entry/Risk plan, planned RR, READY state, and final Grade |
| Pine v0.10.0-alpha | Configurable confirmed-bar Alert System |
| Pine v0.11.0-alpha | Aligned 4H/1H Order Block chart context |
| Pine v0.11.1-alpha | Centered BOS/CHOCH/MSS Structure labels |
| Pine v0.11.2-alpha | Latest active HTF Order Block visibility with gray unaligned context |
| Pine v0.12.0-alpha | Completed-close 4H/1H Breaker chart context |
| Pine v0.13.0-alpha | Manual Narrative, weighted checklist Score, Grade, and Setup Status |
| Pine v0.14.0-alpha | Versioned Trading Companion Alert JSON payload |
| Pine v0.14.1-alpha | Compact fallback trigger and running private TradingView alert |
| v1.0.0 | Trading OS MVP |
