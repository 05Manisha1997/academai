import { NextResponse } from "next/server";

/** Stub endpoint — engagement events for adaptive ML profiling */
export async function POST(request: Request) {
  const body = await request.json();
  // Production: persist to PostgreSQL / event queue
  if (process.env.NODE_ENV === "development") {
    console.log("[engagement]", JSON.stringify(body).slice(0, 200));
  }
  return NextResponse.json({ ok: true });
}
