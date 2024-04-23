import prisma from "@/lib/prisma";
import { ParamsIdIProps } from "@/types";
import { NextResponse } from "next/server";

// Deleted branch
export const GET = async (request: Request, { params }: ParamsIdIProps) => {
	try {
		const { id } = params;
		const data = await prisma.faq.findUnique({ where: { id } });
		console.log(id, "/", data)
		return NextResponse.json(data);
	} catch (error) {
		throw new Error("Data fetch fail");
	}
}

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
		return NextResponse.json({ message: "FAQ updated" }, { status: 200 });

	} catch (error) {
		throw new Error("Data fetch fail");
	}
}