import { DonorIProps, ParamsIProps } from "@/types";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'

export const GET = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;

		const result = await prisma.donorList.findUnique({
			where: {
				username
			},
		});
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Server Error");
	}
};

// Single branch Updated

export const PATCH = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;
		const { password, name, photoUrl, about, lives, hometown, status, socailMedia2, socailMedia1, mobile } = await request.json();
		const result = await prisma.donorList.update({
			where: { username },
			data: {
				password, name, photoUrl, about, lives, hometown, status, socailMedia2, socailMedia1, mobile
			}
		});
		return NextResponse.json({ message: "successfully updated", result })
	} catch (error) {
		return NextResponse.json({ error });
	}
};

export const DELETE = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;

		// Check donor exists first
		const donor = await prisma.donorList.findUnique({
			where: { username },
			select: { username: true },
		});

		if (!donor) {
			return NextResponse.json({ error: "Donor not found" }, { status: 404 });
		}

		// Delete all related DonorPayments, then the donor — in a transaction
		await prisma.$transaction([
			prisma.donorPayment.deleteMany({
				where: { donorUsername: username },
			}),
			prisma.donorList.delete({
				where: { username },
			}),
		]);

		return NextResponse.json({ message: "Donor deleted successfully" });
	} catch (error) {
		return NextResponse.json({ error: "Failed to delete donor" }, { status: 500 });
	}
};