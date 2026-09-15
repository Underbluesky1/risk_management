import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";

function isAuthenticated(request: Request) {
  return request.headers.get("cookie")?.split(";").some((cookie) => cookie.trim() === "riskwatch_session=test-session");
}

async function getId(context: { params: Promise<{ id: string }> }) {
  return (await context.params).id;
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = await getId(context);
    const body = await request.json();
    const { data, error } = await createAdminSupabaseClient().from("cases").update({
      case_reference: body.case_reference?.trim(),
      priority: body.priority,
      status: body.status,
      notes: body.notes?.trim(),
      follow_up_date: body.follow_up_date || null,
      updated_at: new Date().toISOString(),
      closed_at: body.status === "Closed" ? body.closed_at ?? new Date().toISOString() : null,
    }).eq("id", id).select().single();
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