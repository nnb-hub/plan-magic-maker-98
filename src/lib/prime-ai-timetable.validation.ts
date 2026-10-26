import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

function dayNumber(value: string) {
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) ? Math.floor(timestamp / 86_400_000) : Number.NaN;
}

export const aiTimetableRequestSchema = z.object({
  goals: z.string().trim().min(3).max(1200),
  startDate: dateSchema,
  deadline: dateSchema,
  nowTime: timeSchema,
  dailyHours: z.number().min(1).max(12),
  dayStart: timeSchema,
  dayEnd: timeSchema,
  revisions: z.array(z.object({
    id: z.string().max(80),
    text: z.string().max(120),
    date: dateSchema,
    stage: z.string().max(40),
    alreadyScheduled: z.boolean(),
  })).max(40),
  existingSessions: z.array(z.object({
    date: dateSchema,
    time: timeSchema,
    subject: z.string().max(24),
    topic: z.string().max(160),
    plannedMinutes: z.number().min(1).max(240),
    revisionId: z.string().max(80).nullable(),
  })).max(120),
}).superRefine((value, context) => {
  const start = dayNumber(value.startDate);
  const deadline = dayNumber(value.deadline);
  if (!Number.isFinite(start) || !Number.isFinite(deadline) || deadline < start || deadline - start > 13) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["deadline"], message: "Choose a deadline within the next 14 days." });
  }
  if (value.dayEnd <= value.dayStart) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["dayEnd"], message: "The available end time must be after the start time." });
  }
});

export type AiTimetableRequest = z.infer<typeof aiTimetableRequestSchema>;

export const aiTimetableOutputSchema = z.object({
  summary: z.string().max(500),
  sessions: z.array(z.object({
    date: z.string(),
    time: z.string(),
    subject: z.enum(["Physics", "Chemistry", "Botany", "Zoology", "Revision"]),
    topic: z.string().max(160),
    activityType: z.enum(["Study", "Question Practice", "Mock Test"]),
    plannedMinutes: z.number().min(1).max(240),
    revisionId: z.string().max(80).nullable(),
  }).strict()).max(80),
}).strict();

export type AiTimetableOutput = z.infer<typeof aiTimetableOutputSchema>;

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function filterSafeAiSessions(output: AiTimetableOutput, request: AiTimetableRequest) {
  const revisions = new Map(request.revisions.map((revision) => [revision.id, revision]));
  const occupied = request.existingSessions.map((session) => ({
    date: session.date,
    start: timeToMinutes(session.time),
    end: timeToMinutes(session.time) + session.plannedMinutes,
    revisionId: session.revisionId,
    topic: session.topic.trim().toLowerCase(),
  }));
  const dailyMinutes = new Map<string, number>();
  for (const session of request.existingSessions) {
    dailyMinutes.set(session.date, (dailyMinutes.get(session.date) || 0) + session.plannedMinutes);
  }

  const accepted: AiTimetableOutput["sessions"] = [];
  let excludedCount = 0;
  const allowedDurations = new Set([30, 45, 60, 90, 120]);
  const dateIsValid = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  };
  const timeIsValid = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  const ordered = [...output.sessions].sort((a, b) => {
    const revisionA = a.revisionId ? revisions.get(a.revisionId) : undefined;
    const revisionB = b.revisionId ? revisions.get(b.revisionId) : undefined;
    if (revisionA && revisionB) return revisionA.date.localeCompare(revisionB.date);
    if (revisionA) return -1;
    if (revisionB) return 1;
    return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
  });

  for (const session of ordered) {
    const revision = session.revisionId ? revisions.get(session.revisionId) : undefined;
    const minutes = session.plannedMinutes;
    const start = timeToMinutes(session.time);
    const end = start + minutes;
    const validDate = dateIsValid(session.date) && session.date >= request.startDate && session.date <= request.deadline;
    const validTime = timeIsValid(session.time);
    const insideWindow = start >= timeToMinutes(request.dayStart) && end <= timeToMinutes(request.dayEnd);
    const afterNow = session.date !== request.startDate || start >= timeToMinutes(request.nowTime);
    const validRevision = session.revisionId === null || Boolean(revision && session.subject === "Revision");
    const topic = revision ? `${revision.stage ? `${revision.stage}: ` : ""}${revision.text}` : session.topic.trim();
    const duplicate = occupied.some((slot) =>
      slot.date === session.date && (
        (revision && slot.revisionId === revision.id) ||
        (slot.topic === topic.toLowerCase() && session.subject !== "Revision")
      ),
    );
    const conflict = occupied.some((slot) => slot.date === session.date && start < slot.end && end > slot.start);
    const nextDailyTotal = (dailyMinutes.get(session.date) || 0) + minutes;

    if (
      !validDate || !validTime || !insideWindow || !afterNow || !validRevision || !topic ||
      !allowedDurations.has(minutes) || duplicate || conflict ||
      nextDailyTotal > request.dailyHours * 60
    ) {
      excludedCount += 1;
      continue;
    }

    const cleanSession = {
      ...session,
      topic,
    };
    accepted.push(cleanSession);
    occupied.push({ date: cleanSession.date, start, end, revisionId: cleanSession.revisionId, topic: topic.toLowerCase() });
    dailyMinutes.set(cleanSession.date, nextDailyTotal);
  }

  return { sessions: accepted, excludedCount };
}