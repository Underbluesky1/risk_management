import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";

function isAuthenticated(request: Request) {
  return request.headers.get("cookie")?.split(";").some((cookie) => cookie.trim() === "riskwatch_session=test-session");
}

async function getId(context: { params: Promise<{ id: string }> }) {
  return (await context.params).id;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = await getId(context);
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
    const { error } = await createAdminSupabaseClient().from("cases").delete().eq("id", id);
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete case." }, { status: 500 });
  }
}