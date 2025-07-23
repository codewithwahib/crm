import { NextResponse } from "next/server"

// ✅ Replace with your DB or ENV credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456"

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // ✅ Create a session token (here, just a simple string)
    const token = "secure-session-token"

    const res = NextResponse.json({ success: true })
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    })
    return res
  }

  return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
}
