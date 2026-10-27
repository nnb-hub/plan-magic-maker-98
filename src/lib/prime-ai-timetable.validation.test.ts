import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aiTimetableRequestSchema, filterSafeAiSessions } from "./prime-ai-timetable.validation";

const validRequest = {
  goals: "Finish rotational motion and revise chemical bonding",
  startDate: "2026-10-21",
  deadline: "2026-10-27",
  nowTime: "09:00",
  dailyHours: 6,
  dayStart: "06:00",
  dayEnd: "22:00",
  revisions: [],
  existingSessions: [],
};

describe("AI timetable request rules", () => {
  it("accepts a valid one-week plan with six available study hours", () => {
    assert.equal(aiTimetableRequestSchema.safeParse(validRequest).success, true);
  });

  it("rejects more than 12 available study hours per day", () => {
    assert.equal(aiTimetableRequestSchema.safeParse({ ...validRequest, dailyHours: 13 }).success, false);
  });

  it("rejects a planning deadline more than 14 days away", () => {
    assert.equal(aiTimetableRequestSchema.safeParse({ ...validRequest, deadline: "2026-11-04" }).success, false);
  });

  it("rejects an availability window that ends before it starts", () => {
    assert.equal(aiTimetableRequestSchema.safeParse({ ...validRequest, dayStart: "18:00", dayEnd: "08:00" }).success, false);
  });
});

describe("AI timetable proposal safety", () => {
  it("keeps a valid revision session and links it to the existing revision", () => {
    const request = aiTimetableRequestSchema.parse({
      ...validRequest,
      revisions: [{ id: "rev-1", text: "Chemical bonding", date: "2026-10-22", stage: "D2", alreadyScheduled: false }],
    });
    const result = filterSafeAiSessions({
      summary: "Revision first",
      sessions: [{ date: "2026-10-22", time: "07:00", subject: "Revision", topic: "ignored", activityType: "Study", plannedMinutes: 45, revisionId: "rev-1" }],
    }, request);
    assert.equal(result.sessions.length, 1);
    assert.equal(result.sessions[0]?.topic, "D2: Chemical bonding");
  });

  it("excludes generated sessions that overlap an existing timetable entry", () => {
    const request = aiTimetableRequestSchema.parse({
      ...validRequest,
      existingSessions: [{ date: "2026-10-22", time: "07:00", subject: "Physics", topic: "Mechanics", plannedMinutes: 60, revisionId: null }],
    });
    const result = filterSafeAiSessions({
      summary: "Study plan",
      sessions: [{ date: "2026-10-22", time: "07:30", subject: "Chemistry", topic: "Chemical bonding", activityType: "Study", plannedMinutes: 45, revisionId: null }],
    }, request);
    assert.equal(result.sessions.length, 0);
    assert.equal(result.excludedCount, 1);
  });
});