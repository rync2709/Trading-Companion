# Trading Companion

Trading Companion is the web application for the Trading OS decision framework. It is built from the original ICT/SMC Trade Entry Checklist.

Trading Companion now combines the guided decision workflow, Trade Journal, performance statistics, searchable Trade Database, Weekly Review, daily Session Planner, manual context Watchlist, practical risk tools, a Rulebook-based Decision Assistant, a supported TradingView evidence workflow, a personal Playbook Library, and a dedicated Validation Center. The current sprint focuses on turning real-use records into reliable calibration evidence.

## Current Status

- Product name: Trading Companion
- Decision framework: Trading OS
- Repository name: Trading-Companion
- Phase: Validation Sprint after Phase 11
- Validation target: 20 real-use outcomes with at least 80% R and review coverage
- Version: v0.13.0
- Pine indicator: v0.17.3-alpha - private, higher-contrast HTF Order Block
  labels plus separate CISD and Session Sweep alerts; the existing v0.14.1
  production alert remains active
- Live app: https://rync2709.github.io/Trading-Companion/

## Phase 1 Milestone

The first Phase 1 milestone includes:

- Dashboard with active setup, current grade, session, and recent assessments
- Guided five-step New Trade Wizard
- Smart status: WAITING, DEVELOPING, READY, and NO TRADE
- First score and grade model based on the Phase 0 rulebook
- Explainable score breakdown with a versioned scoring profile
- Blocking reasons for invalid setup conditions
- Automatic local draft saving
- WAIT, SKIP, and ENTERED lifecycle decisions
- Entry, Stop Loss, Take Profit, and automatic Planned RR
- Open Position tracking with WIN, LOSS, and BREAK EVEN outcomes
- Initial lifecycle records for the future Trade Journal
- Phase 1 validation progress with closed outcomes and reviewed skips
- Permanent deletion for saved NO TRADE and SKIP assessments
- Classic Checklist preserved at `checklist.html`

## Phase 2 Milestone

The first Phase 2 milestone includes:

- Trade Journal for every assessment marked `ENTERED`
- All, Open, and Closed trade filters
- Emotion, mistake, lesson, and TradingView link fields
- Local Screenshot attachment with preview, full-size view, replacement, and removal
- Closed Trade review with Actual Exit, automatic Realized RR, Close Note, and Holding Time
- Permanent Trade deletion with confirmation and Screenshot cleanup
- Backward-compatible journal data for existing lifecycle records
- Local review progress summary

Phase 2 review fields will continue to be validated through real use.

## Phase 3 Milestone

The first Phase 3 milestone includes:

- Statistics page with 30-day, 90-day, and all-time ranges
- Closed Trades, Win Rate, Average RR, Expectancy, Average Hold, and R Coverage
- Equity Curve based on cumulative Realized R
- Monthly Performance Calendar using Asia/Bangkok close dates
- Daily Winning, Losing, Break Even, and Needs R states
- Win, Loss, and Break Even distribution
- Session and Setup performance breakdowns
- Clear separation between closed outcomes and trades with a recorded Actual Exit

## Phase 4 Milestone

The first Phase 4 milestone includes:

- Searchable database for every assessment marked `ENTERED`
- Token search across Pair, Setup, Session, Grade, Result, Mistake, and review text
- Structured filters for Pair, Setup, Session, Grade, Result, Mistake, and date range
- Newest, oldest, highest-R, and lowest-R sorting
- Database summaries for total, matching, closed, and reviewed trades
- Direct links from search results to the matching Journal review
- Responsive table and mobile result layout

## Phase 5 Milestone

The first Phase 5 milestone includes:

- Monday-to-Sunday Weekly Review using Asia/Bangkok close dates
- Closed Trades, Win Rate, Net R, Expectancy, Average RR, and R Coverage
- Seven-day result strip with Winning, Losing, Break Even, and Needs R states
- Mistake totals based on Trade Journal reviews
- Evidence-based Strengths and Focus Areas without assuming missing data
- Saved reflection fields for strengths, improvements, and next-week focus
- Dashboard reminder showing whether the current review is open, due, or saved
- Mobile More menu for Database, Weekly Review, and Classic Checklist

## Phase 6 Milestone

The first Phase 6 milestone includes:

- Daily Session Plans separated by Asia/Bangkok calendar date
- Bullish, Bearish, and Neutral daily bias
- HTF Narrative, Key POIs, and Liquidity Targets
- Separate London and New York execution plans
- News status, News Note, and No Trade Conditions
- Explainable seven-item plan-readiness checklist
- PLAN EMPTY, PLAN DRAFT, and PLAN READY states
- Current-session plan preview using Bangkok time
- Dashboard reminder linked to the current Daily Plan

## Phase 7 Milestone

The first Phase 7 milestone includes:

- Default Watchlist for Gold, Bitcoin, Ethereum, Solana, and Nasdaq
- Add, edit, and remove support for up to 30 symbols
- HTF Bias, Setup Status, Current Zone, Waiting For, and Last Review Note
- Ready, Waiting, No Trade, and Needs Update filters
- 24-hour context freshness warning
- Dashboard summary that only promotes fresh READY context
- Local manual context tracking without implying live market data

## Phase 8 Milestone

The first Phase 8 milestone includes:

- Direction-aware RR Calculator for Bullish and Bearish plans
- Risk distance, reward distance, and break-even win-rate outputs
- Risk Amount and Position Size Calculator
- Configurable value per 1.0 price move for different contract specifications
- Currency Converter with automatic daily fiat reference rates and manual fallback
- Frankfurter source date, currency swap, and Google verification link
- Fixed Bangkok Session Timer matching the existing Session Planner schedule
- Input validation and explicit broker contract-specification warning

## Phase 9 Milestone

The first Phase 9 milestone includes:

- Local Rulebook conversation across HTF, POI, Setup, Confirmation, and Entry
- 23 ordered questions mapped directly to the shared Decision Engine
- Early stop when context is unclear or a required condition fails
- Explainable WAIT, NO TRADE, and READY verdicts
- Live Grade, Score, progress, blocking conditions, and Next Action
- Automatic local session saving with answer revision and reset
- One-step transfer from Decision Assistant to the New Trade Wizard
- No external AI API and no trade-data transmission

## Phase 10 Milestone

The first Phase 10 milestone includes:

- TradingView Chart Launcher with editable symbol and timeframe
- External chart links without claiming direct TradingView data access
- Existing Journal Screenshot and TradingView-link evidence workflow
- Local Journal summary before export
- UTF-8 CSV export with Trade, result, risk, and review fields
- Printable Journal report for browser Save as PDF
- 30-day, 90-day, and all-time export ranges
- Versioned `trading-companion.alert.v1` JSON import
- Local Indicator Alert Inbox with duplicate protection
- WAIT, SKIP, and Review Entry triage
- Safe transfer of compatible Alert evidence into a New Trade Draft
- Production-deployed authenticated Cloudflare Worker and D1 Inbox
- Separate TradingView Webhook and browser Sync tokens
- Optional manual and 60-second cross-device Inbox synchronization
- 30-day remote retention with deletion tombstones
- Production smoke test covering Webhook receipt, Sync, WAIT, and delete
- Live TradingView-to-Worker Webhook delivery verified
- Clear boundary: no live prices, indicators, or order placement

The Worker is deployed and Trading Companion is connected to its production
Inbox. Pine v0.17.3 is saved privately with higher-contrast HTF Order Block
labels while preserving the v0.17.2 alert conditions and Manual mode. The existing
v0.14.1 `Any alert() function call` alert remains active in TradingView with
app and protected Webhook notifications, so the visual upgrade does not
interrupt production delivery. A live TradingView price alert successfully
reached the production Worker on 2026-07-30; the temporary Alert and remote
test record were removed after verification. Manual JSON import remains
available without a backend.

## Phase 11 Milestone

The first Phase 11 milestone includes:

- Five starter Playbooks: A+ Reversal, A Continuation, NY Open Sweep, London Reversal, and Asian Liquidity Raid
- Setup sequence, rules, invalidations, and execution checklist for every Playbook
- Automatic matching against local Journal trades
- Matching Trade count, Closed count, Win Rate, and Average R
- Personal Win/Loss examples with Journal links
- Local Screenshot previews when a matching Trade has an attachment
- Personal Rules, What Worked, and Avoid Next Time notes
- Local-only Playbook data with no cloud upload

## Validation Sprint

The v0.11.1 validation milestone includes:

- Dedicated Validation Center linked from the Dashboard and app navigation
- Four explicit v1.0 readiness checks
- Evidence target, Realized R coverage, post-trade review coverage, and pending-action tracking
- Grade calibration across A+, A, B, and NO TRADE
- Win/Loss comparison for every versioned score category
- Review Queue for Open Trades, pending SKIP reviews, missing Actual Exit, and incomplete Journal reviews
- Read-only analysis of local records with no cloud upload

## Pine Indicator Track

The first Pine milestone includes:

- Pine Script v6 indicator baseline
- Confirmed 4H and 1H swing-structure states
- Bullish, Bearish, and Neutral HTF Bias
- Conservative timeframe conflict handling
- High, Medium, and Low structural confidence
- Fixed chart table and optional Bias background
- Previous completed HTF state requests to avoid using a still-forming HTF bar
- No Buy/Sell signal, Entry grade, or alert

The second Pine milestone adds:

- Completed-candle three-bar FVG detection on 4H and 1H
- Fresh, Partial, and Filled candidate status
- Bias-aligned candidate selection with 4H priority
- Latest selected FVG state and live chart-price location
- Explicit separation between an HTF POI candidate and a confirmed Entry FVG
- Successful TradingView compilation and rendering checks on 5M, 15M, 1H, and 4H
- Compact seven-row dashboard with grouped context fields and adjustable text size
- Neutral gray POI and Status rows until price touches or enters the selected zone

The third Pine milestone adds:

- Confirmed Previous Day High and Previous Day Low levels
- First confirmed PDH and PDL sweep state for each exchange day
- Sweep rules that require price to cross a level and close back inside
- Compact Liquidity status in the existing seven-row dashboard
- Data Window outputs without Buy/Sell signals or alerts
- Dashboard and Data Window outputs without an FVG box or PDH/PDL lines on the price chart

The fourth Pine milestone adds:

- Confirmed execution-chart swing highs and lows
- Close-confirmed BOS in the current structure direction
- Close-confirmed CHOCH against the prior structure direction
- MSS classification when a CHOCH follows the matching PDH/PDL sweep within the configured context window
- Active Structure state in the Dashboard and exact numeric outputs in the Data Window
- No structure lines, labels, Buy/Sell signals, or alerts on the price chart

The fifth Pine milestone adds:

- Strict CISD detection from consecutive bullish or bearish delivery candles
- Body-close confirmation through the opening price of the first retained delivery candle
- Configurable delivery length, ATR size filter, confirmation window, and active context window
- Weak, Medium, and Strong CISD quality based on HTF, POI, Sweep, and Structure context
- CISD state in the Dashboard and exact candidate/event values in the Data Window
- The initial v0.5.0 baseline kept CISD in the Dashboard and Data Window without lines, labels, Buy/Sell signals, or alerts

The CISD presentation update adds:

- A selectable CISD timeframe with 5M as the default
- Dashed armed Bullish and Bearish CISD candidate levels
- A solid latest confirmed CISD level
- Strict visibility gating so CISD levels appear only when the chart timeframe matches the selected CISD timeframe
- A clear `5M ONLY`-style Dashboard state on non-matching timeframes
- No cross-timeframe CISD projection

The follow-up simplifies timeframe behavior:

- Removed the separate CISD timeframe setting
- CISD automatically uses the current chart timeframe
- Switching chart timeframe recalculates CISD and its levels from that timeframe's candles
- No CISD level persists or projects from the previous chart timeframe

The v0.5.3 presentation returned to Dashboard-only:

- Removed all CISD candidate and confirmed lines
- Kept Structure and CISD detection unchanged
- Kept exact values in the Data Window
- Trading OS does not draw FVG, PDH/PDL, Structure, CISD, or Displacement objects over the price chart

The sixth Pine milestone adds:

- Current-chart candle body and range expansion relative to completed average body and ATR baselines
- Wick filtering through a configurable minimum body share
- Directional alignment with HTF Bias, active Structure, and valid CISD
- A Watch candidate followed by confirmed close-based follow-through
- Medium and Strong Displacement quality in a ten-row Dashboard
- Exact Displacement evidence in the Data Window without Buy/Sell signals or alerts

The v0.6.1 chart-presentation milestone adds:

- A selected HTF FVG box anchored to its actual origin time and price
- Historical PDH/PDL levels and confirmed sweep markers
- Current swing-high and swing-low levels
- Historical BOS, CHOCH, and MSS break segments and labels
- Armed and confirmed CISD levels on the current chart timeframe
- Displacement Watch and confirmed range boxes
- Independent Display toggles for each drawing group, enabled by default
- The existing ten-row Dashboard with `Small` as the unchanged default size

The seventh Pine milestone adds:

- Current-chart Entry FVG detection tied to a confirmed Displacement candle
- A three-candle imbalance rule that requires the Displacement candle to be the middle candle
- Fresh, Partial, and Filled lifecycle tracking
- Entry FVG creation, retracement, and filled event labels
- A latest Entry FVG box anchored to its actual formation time and price
- Exact Entry FVG direction, status, boundaries, events, and interaction state in the Data Window
- Entry FVG status in the existing Status row without increasing the ten-row Dashboard

The eighth Pine milestone adds:

- Provisional score-v1 mapping across HTF, POI, Liquidity, Structure, CISD,
  Displacement, and Entry FVG evidence
- Automated NO TRADE, WAITING, DEVELOPING, and RISK REVIEW states
- Entry/Risk held at 0 of 5 and final Grade held pending until risk rules are implemented
- Compact ten-row Dashboard retained by reusing the existing Status row as Setup

The ninth Pine milestone adds:

- A locked plan when a new Entry FVG is created
- Entry at the Entry FVG midpoint
- Stop Loss at the latest confirmed execution swing used as invalidation
- Target at confirmed Previous Day High or Previous Day Low liquidity
- Configurable minimum planned RR with `2.0R` as the default
- Price-anchored Entry, SL, and Target lines with an RR label
- READY state and final A+ to D Grade only after the automated chain and RR pass
- Final Score, planned RR, Entry readiness, and Grade outputs in the Data Window
- No Buy/Sell order or automatic trade execution

The tenth Pine milestone adds:

- One master Alert switch and individual switches for POI, Liquidity,
  Structure, CISD, Displacement, Entry FVG, Risk Review, READY, and NO TRADE
- Confirmed-bar alerts for meaningful event pulses and state transitions
- One aggregated dynamic message when multiple enabled events occur on the same
  confirmed chart candle
- Symbol, chart timeframe, setup state, score, Grade, planned RR, and close
  price in each alert message
- One `alert()` call so the script remains within TradingView's plot limit
- No Buy/Sell order, automatic execution, or automatically created running
  alert

The eleventh Pine milestone adds:

- Latest Bullish and Bearish HTF Order Block detection on completed 4H and 1H
  candles
- A qualified departure candle that must show Displacement and close beyond
  prior HTF range
- The nearest opposing candle before departure as the full-candle OB zone
- `FRESH`, `MITIGATED`, and `INVALID` lifecycle states
- Bias-aligned 4H and 1H boxes anchored to actual source time and price
- A stronger dashed border for 4H and a lighter dashed border for 1H
- No change to the compact Dashboard, setup score, Grade, alerts, or automatic
  execution

The v0.11.1 presentation update moves BOS, CHOCH, and MSS labels from the break
candle to the midpoint of each historical Structure line. Detection, line
coordinates, Dashboard size, scoring, and Alerts remain unchanged.

The v0.11.2 OB visibility update keeps the latest active 4H and 1H Order Block
visible even when it does not align with the combined HTF Bias. Aligned zones
keep their directional color; unaligned zones are gray and labeled
`UNALIGNED`. This display change does not affect POI selection, scoring, Grade,
or Alerts.

The v0.12.0 Breaker baseline converts a completed-close OB invalidation into
an opposite-direction 4H or 1H Breaker. The latest active Breaker on each HTF
is anchored to the original OB source time and price, uses a dotted border,
and tracks `FRESH`, `MITIGATED`, and `INVALID` states. It remains chart context
only and does not affect the compact Dashboard, POI selection, scoring, Grade,
or Alerts.

The v0.13.0 Manual Assessment update makes trader confirmation the default
Dashboard source. Narrative is selected manually and eight weighted checklist
items produce the 0-100 Score, A+ to D Grade, and Setup Status. Automatic mode
remains available for comparison, while chart drawings and confirmed-bar
Alerts continue to use the existing detection logic.

The Pine source and TradingView test notes are stored under `pine/`.

## Repository Structure

```text
.
|-- index.html
|-- trade.html
|-- journal.html
|-- stats.html
|-- database.html
|-- weekly.html
|-- planner.html
|-- watchlist.html
|-- assistant.html
|-- tools.html
|-- integration.html
|-- report.html
|-- playbooks.html
|-- validation.html
|-- checklist.html
|-- pine/
|   |-- TradingOS.pine
|   `-- README.md
|-- shared/
|   `-- alert-contract.mjs
|-- worker/
|   |-- migrations/
|   |-- src/
|   |-- test/
|   `-- README.md
|-- manifest.json
|-- sw.js
|-- README.md
|-- assets/
|-- css/
|-- js/
`-- docs/
    |-- Rulebook.md
    |-- Indicator_Spec.md
    |-- TradingView_Alert_Contract.md
    |-- Roadmap.md
    `-- Changelog.md
```

## Documents

- [Rulebook](docs/Rulebook.md): Trading rules and setup validation framework
- [Indicator Specification](docs/Indicator_Spec.md): Modules, inputs, process, and outputs for automation
- [TradingView Alert Contract](docs/TradingView_Alert_Contract.md): Versioned Pine-to-web JSON payload, webhook, and Inbox synchronization rules
- [Roadmap](docs/Roadmap.md): Development phases from Phase 0 to Trading OS v1
- [Changelog](docs/Changelog.md): Version history and project changes

## Data Note

Drafts, Decision Assistant sessions, Playbook Notes, assessment history, Weekly Reviews, Daily Session Plans, Watchlist Context, and Screenshots remain stored only in the browser on the current device. Screenshots use IndexedDB so image files do not consume the smaller checklist storage area. Indicator Alerts also remain local unless the trader explicitly connects the private Worker; when connected, validated Alert payloads, Inbox decisions, and deletion tombstones synchronize through the deployed production Worker. Journal, plans, screenshots, Playbooks, and other Trading Companion data are never sent to that Worker. Watchlist status is entered manually and is not live market data. Advanced Tool inputs are calculated locally and are not saved. The Currency Converter requests only the selected fiat currency pair from Frankfurter; it does not send the entered amount. The Decision Assistant uses the local Rulebook engine without an external AI API. CSV and PDF-ready reports are generated locally from Journal data. Trading Companion does not place orders.
