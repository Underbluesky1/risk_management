import { NextResponse } from "next/server";

const DEFAULT_USER_EMAIL = process.env.DEFAULT_USER_EMAIL?.trim().toLowerCase();
const DEFAULT_USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!DEFAULT_USER_EMAIL || !DEFAULT_USER_PASSWORD) {
    return NextResponse.json({ error: "Default user authentication is not configured." }, { status: 500 });
  }

  if (email !== DEFAULT_USER_EMAIL || password !== DEFAULT_USER_PASSWORD) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set("riskwatch_session", "test-session", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return response;
}