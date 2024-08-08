import { LoginIProps } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";


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
				return NextResponse.json({ message: "Login Successfully", user })
			} else {
				return NextResponse.json({ message: "your password  is incorrect" });
			}
		};
	} catch (error) {
		throw new Error("server Error");
	}
}