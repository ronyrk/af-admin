import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"

const secretKey = process.env.JWT_SECRET || "e94b50c81b572c6cf3133605764980b87dade9ecbf2600b98dd15dc74bab5dffe4756a334621fb524b579787c03f53d88d57391ac847bd9166ccde7e32a9848a"


export async function createToken(username: string) {
    const secret = new TextEncoder().encode(secretKey)
    const token = await new SignJWT({ username }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("24h").sign(secret)
    return token
}

export async function verifyToken(token: string) {
    try {
        const secret = new TextEncoder().encode(secretKey)
        const verified = await jwtVerify(token, secret)
        return verified.payload as { username: string }
    } catch (err) {
        return null
    }
}

export async function setAuthCookie(token: string) {
    const cookieStore = cookies()
    cookieStore.set("auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400,
        path: "/",
    })
}

export async function clearAuthCookie() {
    const cookieStore = cookies()
    cookieStore.delete("auth")
}

export async function getAuthToken() {
    const cookieStore = cookies()
    return cookieStore.get("auth")?.value
}
