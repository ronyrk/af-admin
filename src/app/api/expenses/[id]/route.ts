import prisma from "@/lib/prisma";
import { ExpensesIProps, IncomeIProps, ParamsIdIProps } from "@/types";
import { NextResponse } from "next/server";

// Update Income 
export const PATCH = async (request: Request, { params }: ParamsIdIProps) => {
	try {
		const { id } = params;
		const body: ExpensesIProps = await request.json();
		const { date, description, amount } = body;
		await prisma.expenses.update({
			where: { id },
			data: {
				date, description, amount
			}
		});
		return NextResponse.json({ message: "Updated successfully" });
	} catch (error) {
		throw new Error("Data Updated failed");
	}
}
// Deleted income
export const DELETE = async (request: Request, { params }: ParamsIdIProps) => {
	try {
		const { id } = params;
		await prisma.expenses.delete({ where: { id } });
		return NextResponse.json({ message: "deleted successfully" });
	} catch (error) {
		throw new Error("Data fetch failed");
	}
}