# Trading OS Roadmap

## Current Status

- Version: v0.0.1-alpha
- Current phase: Phase 0 - Design and Specification
- Current product: Trade Entry Checklist PWA
- Goal: Turn the checklist into a structured Trading OS with rulebook, indicator specification, Pine Script modules, alerts, and later statistics.

## Phase 0 - Design and Specification

Goal: define the system clearly before changing app behavior.

Status:

- [x] Inspect current repository structure
- [x] Keep current PWA/checklist behavior unchanged
- [x] Create documentation structure
- [x] Create Trading Rulebook
- [x] Create Indicator Specification
- [x] Create Roadmap
- [x] Create Changelog
- [ ] Finalize scoring weights
- [ ] Finalize exact CISD definitions
- [ ] Finalize invalidation rules
- [ ] Finalize alert event names

Deliverables:

- `docs/Rulebook.md`
- `docs/Indicator_Spec.md`
- `docs/Roadmap.md`
- `docs/Changelog.md`
- Updated `README.md`

## Phase 1 - Pine Script Core Indicator

Goal: build the first TradingView indicator modules from the specification.

Planned modules:

- [ ] HTF Bias
- [ ] HTF POI
- [ ] Liquidity
- [ ] Structure: MSS, CHOCH, BOS
- [ ] CISD
- [ ] Displacement
- [ ] FVG / Entry Zone
- [ ] Score Engine
- [ ] Setup state output

Expected output:

- Bias
- POI status
- Checklist state
- Score
- Grade
- Entry readiness

## Phase 2 - Alert System

Goal: alert only meaningful setup state changes.

Planned alerts:

- [ ] HTF POI touched
- [ ] Liquidity swept
- [ ] Structure confirmed
- [ ] CISD confirmed
- [ ] Displacement confirmed
- [ ] FVG formed
- [ ] Entry ready
- [ ] Setup invalidated

## Phase 3 - Web Checklist Upgrade

Goal: refactor the current checklist into a workflow-driven Trading OS interface.

Planned changes:

- [ ] Separate checklist data from HTML
- [ ] Add setup state workflow
- [ ] Add scoring display
- [ ] Add setup grade
- [ ] Add exportable trade notes
- [ ] Preserve PWA support

## Phase 4 - Dashboard and Journal

Goal: turn Trading OS into a full review and tracking tool.

Planned features:

- [ ] Trade journal
- [ ] Setup database
- [ ] Win/loss statistics
- [ ] RR tracking
- [ ] Session tracking
- [ ] Screenshot links or attachments
- [ ] Setup quality review

## Version Targets

| Version | Target |
| --- | --- |
| v0.0.1-alpha | Phase 0 documentation baseline |
| v0.1.0 | First Pine Script HTF module |
| v0.2.0 | Liquidity and structure modules |
| v0.3.0 | CISD, displacement, and FVG modules |
| v0.4.0 | Score engine and setup state |
| v0.5.0 | Web checklist workflow refactor |
| v1.0.0 | Trading OS MVP |
