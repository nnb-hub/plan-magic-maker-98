import { createRemoteJWKSet, jwtVerify } from "jose";
import { Output, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
  aiTimetableOutputSchema,
  aiTimetableRequestSchema,
  filterSafeAiSessions,
  type AiTimetableRequest,
} from "./prime-ai-timetable.validation";
import { createLovableAiGatewayRunIdFetch } from "./prime-ai-run-id.ts";

const FIREBASE_PROJECT_ID = "medmission-alpha";
const firebaseJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);
const generationWindows = new Map<string, number[]>();

function responseError(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

async function verifyFirebaseUser(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, firebaseJwks, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    return typeof payload.sub === "string" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}

function takeGenerationSlot(userId: string) {
  const now = Date.now();
  const recent = (generationWindows.get(userId) || []).filter((timestamp) => now - timestamp < 10 * 60_000);
  if (recent.length >= 5) {
    generationWindows.set(userId, recent);
    return false;
  }
  recent.push(now);
  generationWindows.set(userId, recent);
  if (generationWindows.size > 500) {
    for (const [key, timestamps] of generationWindows) {
      if (!timestamps.some((timestamp) => now - timestamp < 10 * 60_000)) generationWindows.delete(key);
    }
  }
  return true;
}

function safeGatewayError(error: unknown) {
  const candidate = error as { statusCode?: unknown; status?: unknown; message?: unknown; responseBody?: unknown; response?: { status?: unknown } };
  const statusValue = Number(candidate?.statusCode ?? candidate?.status ?? candidate?.response?.status);
  const status = Number.isInteger(statusValue) && statusValue >= 400 && statusValue <= 599 ? statusValue : 502;
  let message = typeof candidate?.message === "string" ? candidate.message : "The timetable could not be generated.";
  let providerDenied = status === 403;
  if (typeof candidate?.responseBody === "string") {
    try {
      const parsed = JSON.parse(candidate.responseBody) as { message?: unknown; type?: unknown; error?: { type?: unknown; message?: unknown } };
      if (typeof parsed.message === "string") message = parsed.message;
      else if (typeof parsed.error?.message === "string") message = parsed.error.message;
      const errorType = String(parsed.type || parsed.error?.type || "");
      if (errorType.startsWith("provider_") || errorType === "permission_error" || errorType.startsWith("model_")) providerDenied = true;
    } catch {
      // Keep the SDK's safe message when the body is not JSON.
    }
  }
  if (status === 401) message = "AI generation is not configured correctly. Please contact the app owner.";
  if (status === 402) message = message.slice(0, 500) || "AI credits are needed to generate a timetable.";
  if (status === 403) message = message.slice(0, 500) || "AI timetable generation is not currently permitted.";
  if (status === 429) message = "AI generation is busy right now. Please wait a little before trying again.";
  if (status >= 500) message = "The timetable service is temporarily unavailable. Please try again later.";
  return { status, message: message.slice(0, 500), providerDenied };
}

function buildInstructions() {
  return `You create practical, balanced study timetables for PROJECT PRIME students. Use only the supplied goals, deadlines, availability, existing sessions, and revision queue. Schedule revisions that are due soon before ordinary goal sessions whenever feasible; never duplicate an already scheduled session. Spread work across the requested days, alternate demanding subjects when possible, and use only 30, 45, 60, 90, or 120 minute blocks. Respect every day's available window and hours, leave reasonable recovery gaps, and never invent a revision or a subject/topic not supported by the supplied goals or revision queue. For revision sessions, use the exact supplied revisionId and title. Return a concise summary and a session list; return an empty list if no safe sessions fit. Do not claim that a plan was saved.`;
}

export async function generatePrimeTimetable(request: Request) {
  if (request.method !== "POST") return responseError("Use POST to generate a timetable.", 405);
  if (!(request.headers.get("content-type") || "").toLowerCase().includes("application/json")) {
    return responseError("Send the timetable details as JSON.", 415);
  }

  const userId = await verifyFirebaseUser(request);
  if (!userId) return responseError("Sign in to generate an AI timetable.", 401);
  if (!takeGenerationSlot(userId)) return responseError("You have reached the short-term generation limit. Please wait before trying again.", 429);

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: gatewayStatus, error: statusReadError } = await supabaseAdmin
    .from("prime_ai_gateway_status")
    .select("provider_blocked, safe_message")
    .eq("id", 1)
    .maybeSingle();
  if (statusReadError) {
    console.error("Unable to check persistent AI access status", statusReadError.message);
    return responseError("AI timetable generation is temporarily unavailable.", 503);
  }
  if (gatewayStatus?.provider_blocked) {
    return responseError(gatewayStatus.safe_message || "AI access is blocked until the workspace provider issue is resolved.", 403);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 24_000) return responseError("The timetable request is too large.", 413);
  let rawBody: unknown;
  try {
    const bodyText = await request.text();
    if (bodyText.length > 24_000) return responseError("The timetable request is too large.", 413);
    rawBody = JSON.parse(bodyText);
  } catch {
    return responseError("The timetable details could not be read.", 400);
  }

  const parsed = aiTimetableRequestSchema.safeParse(rawBody);
  if (!parsed.success) return responseError(parsed.error.issues[0]?.message || "Check the timetable details and try again.", 400);
  const details: AiTimetableRequest = parsed.data;
  if (!Array.isArray((rawBody as { goals?: unknown }).goals) && details.goals.split("\n").filter(Boolean).length > 24) {
    return responseError("Enter no more than 24 study goals.", 400);
  }

  const lovableApiKey = process.env["LOVABLE_API_KEY"];
  if (!lovableApiKey) return responseError("AI timetable generation is not configured yet.", 503);

  const existingRevisionIds = new Set(details.existingSessions.map((session) => session.revisionId).filter(Boolean));
  const revisionContext = details.revisions.map((revision) => ({
    ...revision,
    alreadyScheduled: revision.alreadyScheduled || existingRevisionIds.has(revision.id),
  }));
  const prompt = JSON.stringify({
    studentGoals: details.goals.split("\n").map((goal) => goal.trim()).filter(Boolean),
    dateRange: { start: details.startDate, deadline: details.deadline },
    dailyAvailability: {
      studyHours: details.dailyHours,
      start: details.dayStart,
      end: details.dayEnd,
      currentTime: details.nowTime,
    },
    upcomingRevisions: revisionContext,
    existingTimetable: details.existingSessions,
  });

  const gateway = createLovableAiGatewayRunIdFetch(request.headers.get("X-Lovable-AIG-Run-ID") || undefined);
  const openai = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: lovableApiKey,
    headers: { "Lovable-API-Key": lovableApiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: gateway.fetch,
  });

  try {
    const result = streamText({
      model: openai.responses("openai/gpt-6-astra"),
      instructions: buildInstructions(),
      prompt,
      output: Output.object({ schema: aiTimetableOutputSchema }),
      abortSignal: request.signal,
      maxRetries: 0,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const output = await result.output;
    if (!output) return responseError("The AI service did not return a usable timetable. Please start a fresh request.", 502);
    const safe = filterSafeAiSessions(output, details);
    return Response.json({
      summary: output.summary.slice(0, 500),
      sessions: safe.sessions,
      excludedCount: safe.excludedCount,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (request.signal.aborted || (error instanceof Error && error.name === "AbortError")) {
      return responseError("The timetable request was stopped.", 499);
    }
    const failure = safeGatewayError(error);
    console.error("AI timetable generation failed", { status: failure.status, message: failure.message });
    if (failure.status === 403 && failure.providerDenied) {
      const { error: persistError } = await supabaseAdmin.from("prime_ai_gateway_status").upsert({
        id: 1,
        provider_blocked: true,
        safe_message: failure.message,
        blocked_at: new Date().toISOString(),
      });
      if (persistError) console.error("Unable to persist AI provider denial", persistError.message);
    }
    return responseError(failure.message, failure.status);
  }
}