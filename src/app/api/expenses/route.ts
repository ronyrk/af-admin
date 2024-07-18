import prisma from "@/lib/prisma"
import { ExpensesIProps } from "@/types";
import { NextResponse } from "next/server";


export const dynamic = 'force-dynamic'

export const GET = async () => {
	try {
		const result = await prisma.expenses.findMany();
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Server Error");
	}
};

export const POST = async (request: Request) => {
	try {
		const body: ExpensesIProps = await request.json();
		const { amount, description, date } = body;
		const result = await prisma.expenses.create({
			data: {
				amount, description, date
			}
		});
		return NextResponse.json({ message: "Successfully expenses Created", result }, { status: 201 });
	} catch (error: any) {
		if (error?.code === 'P2002') {
			return NextResponse.json({ message: `a new user cannot be created with this ${error?.meta?.target}` });
		}
		return NextResponse.json({ message: "Expenses Created Failed" });
	}
}