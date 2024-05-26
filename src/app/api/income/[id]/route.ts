import prisma from "@/lib/prisma";
import { IncomeIProps, ParamsIdIProps } from "@/types";
import { NextResponse } from "next/server";

// Update Income 
export const PATCH = async (request: Request, { params }: ParamsIdIProps) => {
	try {
		const { id } = params;
		const body: IncomeIProps = await request.json();
		const { date, type, transaction, amount } = body;
		await prisma.income.update({
			where: { id },
			data: {
				date, type, transaction, amount
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
		await prisma.income.delete({ where: { id } });
		return NextResponse.json({ message: "deleted successfully" });
	} catch (error) {
		throw new Error("Data fetch failed");
	}
}