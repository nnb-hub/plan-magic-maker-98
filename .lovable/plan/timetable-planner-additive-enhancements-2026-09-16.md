# Timetable Planner — Additive Enhancements

All changes build on the existing planner UI, mission system, and data. No redesign, no new trackers, no duplicated systems.

## Proposed additions (pick any subset)

1. **Recurring / repeat missions**
   - Add a "Repeat" option (Daily / Weekdays / Custom days) when adding a session, so routine blocks don't need daily re-entry. Reuses the existing copy-to-tomorrow clone logic.

2. **Week view**
   - Add a "Week" tab next to Day / Next 7 days showing a simple Mon–Sun grid of the existing plans, for at-a-glance planning. Read-only summary + click a day to jump to it.

3. **Drag-free reorder**
   - Small up/down arrows on each session card to reorder within the day without re-typing times (auto-sorts by time afterwards).

4. **Session templates / quick presets**
   - Save a session as a preset (subject + duration + notes) and re-add it in one tap from the Add form. Extends the existing quick-add preset idea.

5. **Capacity warning**
   - If planned mission minutes for a day exceed the CEO productive-hours target, show a gentle amber hint in the planner (links to existing HQ target, no blocking).

6. **Clash auto-fix suggestion**
   - When the overlap warning appears, offer a one-tap "Suggest fix" that nudges the later session to the first free slot after the earlier one ends (user confirms; no silent rescheduling).

7. **Mission notes preview**
   - Show the first line of session notes on the card so context is visible without opening anything.

## Technical notes

- All logic added to `public/prime/app.js` planner section; styles appended to `public/prime/styles.css`; cache version bumped in `index.html` / `sw.js`.
- Recurrence stored as fields on the existing plan objects — no new storage, no DB.
- Verified in browser after implementation: add/edit/copy flows, week view, no console errors.
