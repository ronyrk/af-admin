import { clearAuthCookie } from "@/lib/auth"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
    await clearAuthCookie();
    return NextResponse.json({ success: true })
}