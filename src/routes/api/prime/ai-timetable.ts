import { createFileRoute } from "@tanstack/react-router";
import { generatePrimeTimetable } from "@/lib/prime-ai-timetable.server";

export const Route = createFileRoute("/api/prime/ai-timetable")({
  server: {
    handlers: {
      POST: ({ request }) => generatePrimeTimetable(request),
    },
  },
});