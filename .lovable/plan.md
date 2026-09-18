# PROJECT PRIME — Suggested Additions (Pick Any Subset)

All items are additive: they reuse existing data, panels, and systems. No redesign, no new trackers, no duplicated systems, no DB changes.

## Timetable Planner
1. **Today glance strip** — a slim bar above the planner showing next mission, current live mission, and minutes left today (uses existing plan + session data).
2. **One-tap "Start next mission"** — a single button that logs in to the next planned session, so the CEO doesn't hunt for the right card.

## Dashboard
3. **Daily score card** — one compact tile summarizing today: missions done/pending, punctuality verdict, active study minutes (all from existing analytics).
4. **At-a-glance week** — mini Mon–Sun dots showing which days had completed missions (from existing session history).

## CEO HQ
5. **Morning briefing recap in evening review** — show the morning's target, primary objective, and attendance side-by-side with the actual outcome when closing HQ (data already stored in `state.hq.days`).
6. **Tomorrow preview** — in the Close HQ step, show tomorrow's existing timetable plans before setting the first priority.

## Chapter Tracker / Revision
7. **Revision due radar** — a small "Due for revision" list on the dashboard, derived from existing revision planner dates (no new scheduling system).

## General
8. **Global search (Ctrl+K)** — jump to any mission, chapter, goal, or circular from one search box over existing data.
9. **Keyboard shortcuts** — `N` new session, `L` log in to next mission, `?` shortcut help overlay.

## Technical notes
- All logic in `public/prime/app.js`; styles appended to `public/prime/styles.css`; cache version bumped in `index.html` / `sw.js`.
- Everything reads existing state — nothing new is tracked that isn't already recorded.
- Browser-verified after implementation: no console errors, all existing flows still work.

Tell me which numbers to build (e.g. "1, 3, 8") or approve the plan and I'll build a sensible default set (1, 3, 5, 7).
