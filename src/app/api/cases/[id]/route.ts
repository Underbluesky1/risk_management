import { NextResponse } from "next/server";
import { cases as fallbackCases } from "@/lib/cases";
import { createAdminSupabaseClient } from "@/lib/supabase";

function isAuthenticated(request: Request) {
  return request.headers.get("cookie")?.split(";").some((cookie) => cookie.trim() === "riskwatch_session=test-session");
}

function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function getId(context: { params: Promise<{ id: string }> }) {
  return (await context.params).id;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = await getId(context);
    if (!isSupabaseConfigured()) {
      const caseRecord = fallbackCases.find((item) => item.id === id);
      if (!caseRecord) return NextResponse.json({ error: "Case not found." }, { status: 404 });
      return NextResponse.json(caseRecord);
    }

    const { data, error } = await createAdminSupabaseClient().from("cases").select("*").eq("id", id).single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load case." }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = await getId(context);
    const body = await request.json();

    if (!isSupabaseConfigured()) {
      const caseIndex = fallbackCases.findIndex((item) => item.id === id);
      if (caseIndex === -1) return NextResponse.json({ error: "Case not found." }, { status: 404 });

      const updatedCase = {
        ...fallbackCases[caseIndex],
        case_reference: typeof body.case_reference === "string" ? body.case_reference.trim() : fallbackCases[caseIndex].case_reference,
        priority: typeof body.priority === "string" ? body.priority : fallbackCases[caseIndex].priority,
        status: typeof body.status === "string" ? body.status : fallbackCases[caseIndex].status,
        notes: typeof body.notes === "string" ? body.notes.trim() : fallbackCases[caseIndex].notes,
        follow_up_date: "follow_up_date" in body ? (body.follow_up_date || null) : fallbackCases[caseIndex].follow_up_date,
        updated_at: new Date().toISOString(),
        closed_at: body.status === "Closed" ? (body.closed_at ?? new Date().toISOString()) : null,
      };

      fallbackCases[caseIndex] = updatedCase;
      return NextResponse.json(updatedCase);
    }

    const updates: Record<string, string | null> = { updated_at: new Date().toISOString() };
    if (typeof body.case_reference === "string") updates.case_reference = body.case_reference.trim();
    if (typeof body.priority === "string") updates.priority = body.priority;
    if (typeof body.status === "string") updates.status = body.status;
    if (typeof body.notes === "string") updates.notes = body.notes.trim();
    if ("follow_up_date" in body) updates.follow_up_date = body.follow_up_date || null;
    if (body.status === "Closed") updates.closed_at = body.closed_at ?? new Date().toISOString();
    if (body.status && body.status !== "Closed") updates.closed_at = null;

    const { data, error } = await createAdminSupabaseClient().from("cases").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update case." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = await getId(context);
    if (!isSupabaseConfigured()) {
      const caseIndex = fallbackCases.findIndex((item) => item.id === id);
      if (caseIndex === -1) return NextResponse.json({ error: "Case not found." }, { status: 404 });
      fallbackCases.splice(caseIndex, 1);
      return new NextResponse(null, { status: 204 });
    }

    const { error } = await createAdminSupabaseClient().from("cases").delete().eq("id", id);
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete case." }, { status: 500 });
  }
}