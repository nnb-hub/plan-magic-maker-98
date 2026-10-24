import { describe, expect, it } from "bun:test";
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
    expect(aiTimetableRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it("rejects more than 12 available study hours per day", () => {
    expect(aiTimetableRequestSchema.safeParse({ ...validRequest, dailyHours: 13 }).success).toBe(false);
  });

  it("rejects a planning deadline more than 14 days away", () => {
    expect(aiTimetableRequestSchema.safeParse({ ...validRequest, deadline: "2026-11-04" }).success).toBe(false);
  });

  it("rejects an availability window that ends before it starts", () => {
    expect(aiTimetableRequestSchema.safeParse({ ...validRequest, dayStart: "18:00", dayEnd: "08:00" }).success).toBe(false);
  });
});