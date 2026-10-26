import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aiTimetableRequestSchema } from "./prime-ai-timetable.validation";

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