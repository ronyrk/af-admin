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
			return NextResponse.json(
				{ message: "Email and password are required." },
				{ status: 400 }
			);
		}

		// ── Fire both queries simultaneously ─────────────────────────────────
		const [admin, branch] = await Promise.all([
			prisma.admin.findUnique({ where: { email } }),
			prisma.branchList.findUnique({ where: { email } }),
		]);

		const user = admin ?? branch;
		const role = admin ? "admin" : branch ? "branch" : null;

		// ── No account found ─────────────────────────────────────────────────
		if (!user || !role) {
			return NextResponse.json(
				{ message: "No account found with this email." },
				{ status: 404 }
			);
		}

		// ── Wrong password ────────────────────────────────────────────────────
		if (user.password !== password) {
			return NextResponse.json(
				{ message: "Your password is incorrect." },
				{ status: 401 }
			);
		}

		// ── Issue token ───────────────────────────────────────────────────────
		const token = await createToken(user.username, role);

		const response = NextResponse.json({ success: true, role, user });
		response.cookies.set("auth", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 7,
			path: "/",
		});

		return response;

	} catch (error) {
		// console.log({ error })
		return NextResponse.json(
			{ message: "An error occurred during login." },
			{ status: 500 }
		);
	}
};