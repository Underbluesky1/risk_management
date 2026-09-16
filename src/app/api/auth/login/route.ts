import { NextResponse } from "next/server";
import { getLoginCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const { email: expectedEmail, password: expectedPassword } = getLoginCredentials();

  if (email !== expectedEmail || password !== expectedPassword) {
    return NextResponse.json({ error: "Invalid email or password. Use the configured credentials from .env.local." }, { status: 401 });
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