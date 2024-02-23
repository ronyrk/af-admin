import { LoanIProps } from "@/types";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

// Loan Created
export const POST = async (request: Request) => {
	try {
		const body: LoanIProps = await request.json();
		const { username, name, code, branch, address, about, disbursed, recovered, balance, form1, form2, nidback, nidfont, occupation, phone, photosUrl } = body;
		const loan = await prisma.loan.create({
			data: {
				username, name, code, branch, address, about, disbursed, recovered, balance, form1, form2, nidback, nidfont, occupation, phone, photosUrl
			}
		});
		return NextResponse.json({ message: "loan created Successfully", loan });
	} catch (error) {
		return NextResponse.json({ error });
	}
};

// All Loan
export const GET = async (request: Request) => {
	try {
		const loan = await prisma.loan.findMany();
		return NextResponse.json(loan);
	} catch (error) {
		throw new Error("Server Error");
	}
}