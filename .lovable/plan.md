# AI timetable builder

## User experience
- Add a compact “Build with AI” option within the existing Timetable Planner; keep the current planner layout and workflows intact.
- Let the student enter goals, deadline, available study hours, preferred daily start/end times, and planning range.
- Use existing upcoming revision items and current timetable sessions as context. Show a reviewable proposed schedule, with revisions explicitly prioritized, before applying it.
- Applying adds only non-conflicting entries to the existing timetable; do not replace or duplicate existing sessions. Keep the normal manual add/edit flow unchanged.
- Explain AI errors safely, preserve entered values, and provide clear loading, preview, empty, and retry states.

## Implementation
- Add a server-side AI generation endpoint using the Lovable AI Gateway and the default model, with a strict validated request/response shape.
- Authenticate requests using the app’s existing Firebase sign-in token; keep AI credentials and prompts server-side.
- Pass only the required planner context, validate/cap all inputs and generated sessions, and keep schedules in the current app state and persistence system.
- Add focused validation tests; verify the endpoint response and the preview/apply flow where an authenticated preview session is available.
