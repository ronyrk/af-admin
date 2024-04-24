import { ParamsIProps } from "@/types";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export const GET = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;
		const result = await prisma.child.findUnique({
			where: {
				username
			}
		});
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Server Error");
	}
}
export const PATCH = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;
		const { name, dream, description, photoUrl, address, phone, academy } = await request.json();
		const result = await prisma.child.update({
			where: {
				username
			}, data: {
				name, dream, description, photoUrl, address, phone, academy
			}
		});
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Server Error");
	}
}

// Deleted branch
export const DELETE = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;
		await prisma.donationChild.deleteMany({ where: { username } });
		await prisma.donation.deleteMany({ where: { username } });
		await prisma.disbursement.deleteMany({ where: { username } });
		await prisma.child.delete({ where: { username } });
		return NextResponse.json({ message: "deleted successfully" });
	} catch (error) {
		return NextResponse.json({ error });
	}
}