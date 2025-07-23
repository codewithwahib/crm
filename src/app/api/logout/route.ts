import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set("auth_token", "", { maxAge: 0 }) // remove cookie
  return res
}
