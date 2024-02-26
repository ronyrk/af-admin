import prisma from "@/lib/prisma";
import { ParamsIdIProps } from "@/types";
import { NextResponse } from "next/server";

// Deleted branch
export const DELETE = async (request: Request, { params }: ParamsIdIProps) => {
	try {
		const { id } = params;
		await prisma.faq.delete({ where: { id } });
		return NextResponse.json({ message: "deleted successfully" });
	} catch (error) {
		throw new Error("Data fetch fail");
	}
}

export const PATCH = async (request: Request, { params }: ParamsIdIProps) => {
	try {
		const { id } = params;
		const { title, description } = await request.json();
		const result = await prisma.faq.update({
			where: { id },
			data: {
				title, description
			}
		});
		return NextResponse.json({ message: "FAQ updated" })

	} catch (error) {
		throw new Error("Data fetch fail");
	}
}