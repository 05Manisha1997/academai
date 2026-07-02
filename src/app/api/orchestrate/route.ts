import { NextResponse } from "next/server";
import { orchestrate } from "@/lib/orchestrator/pipeline";
import type { OrchestratorBackend } from "@/lib/orchestrator/types";
import type { AudienceProfile } from "@/types/profiles";

const PROFILES: AudienceProfile[] = ["under-14", "students-lecturers", "elderly"];
const BACKENDS: OrchestratorBackend[] = ["simulated", "ollama", "langgraph", "autogen"];

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  const profile = PROFILES.includes(body.profile) ? body.profile : undefined;
  const backend = BACKENDS.includes(body.backend) ? body.backend : undefined;

  const result = await orchestrate({ prompt, profile, backend });

  return NextResponse.json(result, {
    status: result.status === "blocked" ? 422 : 200,
  });
}
