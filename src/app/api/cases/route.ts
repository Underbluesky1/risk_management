import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";

function isAuthenticated(request: Request) {
  return request.headers.get("cookie")?.split(";").some((cookie) => cookie.trim() === "riskwatch_session=test-session");
}

export async function GET(request: Request) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { data, error } = await createAdminSupabaseClient().from("cases").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load cases." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    if (!body.case_reference?.trim() || !body.notes?.trim()) {
      return NextResponse.json({ error: "Case reference and notes are required." }, { status: 400 });
    }

    const { data, error } = await createAdminSupabaseClient().from("cases").insert({
      case_reference: body.case_reference.trim(),
      priority: body.priority,
      status: body.status,
      notes: body.notes.trim(),
      follow_up_date: body.follow_up_date || null,
    }).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save case." }, { status: 500 });
  }
}