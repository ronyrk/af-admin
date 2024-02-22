import { ParamsIProps } from "@/types";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'
// Single branch
export const GET = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;

		const result = await prisma.branch.findUnique({ where: { username } })
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Server Error");
	}
};

// Single branch Updated

export const PATCH = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;
		const body = await request.json();
		const { password } = body;
		const result = await prisma.branch.update({
			where: {
				username
			},
			data: {
				password,
			}
		});
		return NextResponse.json({ message: "successfully updated", result })
	} catch (error) {
		return NextResponse.json({ error });
	}
};

// Deleted branch
export const DELETE = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;
		await prisma.branch.delete({ where: { username } });
		return NextResponse.json({ message: "deleted successfully" });
	} catch (error) {
		return NextResponse.json({ error });
	}
}
