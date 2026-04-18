import { DonorIProps, ParamsIProps } from "@/types";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'

export const GET = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;
		const result = await prisma.borrowers.findUnique({
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
		const { name, code, branch, address, about, disbursed, recovered, balance, form1, form2, nidback, nidfont, occupation, phone, photosUrl } = await request.json();
		const result = await prisma.borrowers.update({
			where: { username },
			data: {
				name, code, branch, address, about, form1, form2, nidback, nidfont, occupation, phone, photosUrl
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

		// Check borrower exists first
		const borrower = await prisma.borrowers.findUnique({
			where: { username },
			select: { username: true },
		});

		if (!borrower) {
			return NextResponse.json({ error: "Borrower not found" }, { status: 404 });
		}

		// Delete all related data, then the borrower — in a transaction
		await prisma.$transaction([
			prisma.request.deleteMany({
				where: { loanusername: username },
			}),
			prisma.payment.deleteMany({
				where: { loanusername: username },
			}),
			prisma.borrowers.delete({
				where: { username },
			}),
		]);

		return NextResponse.json({ message: "Borrower deleted successfully" });
	} catch (error) {
		return NextResponse.json({ error: "Failed to delete borrower" }, { status: 500 });
	}
};