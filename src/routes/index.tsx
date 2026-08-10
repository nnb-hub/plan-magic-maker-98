import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project Prime: Invictus Ignis — NEET Study Dashboard" },
      {
        name: "description",
        content:
          "Plan sessions, track chapters and log study hours with the Project Prime timetable planner.",
      },
      { property: "og:title", content: "Project Prime: Invictus Ignis" },
      {
        property: "og:description",
        content: "Rise unconquered. Burn relentlessly. Heal compassionately.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/prime/index.html");
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Project Prime: Invictus Ignis
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Opening your dashboard…</p>
        <a
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          href="/prime/index.html"
        >
          Open dashboard
        </a>
      </div>
    </main>
  );
}
