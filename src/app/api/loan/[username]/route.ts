import { DonorIProps, ParamsIProps } from "@/types";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'

export const GET = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;
		const result = await prisma.loan.findUnique({
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
		const result = await prisma.loan.update({
			where: { username },
			data: {
				name, address, about, form1, form2, nidback, nidfont, occupation, phone, photosUrl
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
		await prisma.request.deleteMany({
			where: {
				loanusername: username
			}
		});
		await prisma.payment.deleteMany({
			where: {
				loanusername: username
			}
		});
		await prisma.loan.delete({ where: { username } });
		return NextResponse.json({ message: "deleted successfully" });
	} catch (error) {
		return NextResponse.json({ error });
	}
}