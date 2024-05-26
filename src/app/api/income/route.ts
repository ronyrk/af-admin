import prisma from "@/lib/prisma"
import { IncomeIProps } from "@/types";
import { NextResponse } from "next/server";


export const dynamic = 'force-dynamic'

export const GET = async () => {
	try {
		const result = await prisma.income.findMany();
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Server Error");
	}
};

export const POST = async (request: Request) => {
	try {
		const body: IncomeIProps = await request.json();
		const { amount, transaction, type, date } = body;
		const result = await prisma.income.create({
			data: {
				amount, transaction, type, date
			}
		});
		return NextResponse.json({ message: "Successfully Branch Created", result }, { status: 201 });
	} catch (error: any) {
		if (error?.code === 'P2002') {
			return NextResponse.json({ message: `a new user cannot be created with this ${error?.meta?.target}` });
		}
		return NextResponse.json({ message: "Branch Created Failed" });
	}
}