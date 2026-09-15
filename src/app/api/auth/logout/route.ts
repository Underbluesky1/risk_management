import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set("riskwatch_session", "", { maxAge: 0, path: "/" });
  return response;
}