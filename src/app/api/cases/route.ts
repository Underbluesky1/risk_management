import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";

function isAuthenticated(request: Request) {
  return request.headers.get("cookie")?.split(";").some((cookie) => cookie.trim() === "riskwatch_session=test-session");
}

export async function GET(request: Request) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { data, error } = await createAdminSupabaseClient().from("cases").select("*").order("created_at", { ascending: false }).limit(10);
    if (error) throw error;
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
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

    const adminClient = createAdminSupabaseClient();
    const { count, error: countError } = await adminClient.from("cases").select("id", { count: "exact", head: true });
    if (countError) throw countError;
    if ((count ?? 0) >= 10) {
      return NextResponse.json({ error: "The case limit is 10 records. Delete an old case before creating a new one." }, { status: 409 });
    }

    const { data, error } = await adminClient.from("cases").insert({
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