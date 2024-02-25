import prisma from "@/lib/prisma";
import { ParamsIProps } from "@/types";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'
// Single branch
export const GET = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;
		// Alternative
		const user = await prisma.admin.findUnique({
			where: { username }, select: {
				username: true, email: true, photourl: true,
			}
		});
		return NextResponse.json(user);
	} catch (error) {
		throw new Error("Server Error");
	}
};