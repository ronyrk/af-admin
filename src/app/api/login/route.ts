import { LoginIProps } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createToken } from "@/lib/auth";


export const dynamic = 'force-dynamic'

export const POST = async (request: NextRequest) => {
	try {
		const body: LoginIProps = await request.json();
		const { email, password } = body;
		if (!email || !password) {
			return NextResponse.json({ message: "Invalid request. Email and password are required." });
		};

		// Alternative
		const user = await prisma.admin.findUnique({
			where: {
				email
			}
		})
		if (!user) {
			return NextResponse.json({ message: "User Not register" });
		} else {
			if (user.password === password) {
				const token = await createToken(user.username)
				// Create response and set auth cookie
				const response = NextResponse.json({
					success: true,
					user
				})
				response.cookies.set("auth", token, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "lax",
					maxAge: 60 * 60 * 24 * 7, // 7 days
					path: "/",
				})

				return response
			} else {
				return NextResponse.json({ message: "your password  is incorrect" });
			}
		};
	} catch (error) {
		// console.log(error, "error logs")
		return NextResponse.json({ message: "An error occurred during login." }, { status: 500 });
	}
}