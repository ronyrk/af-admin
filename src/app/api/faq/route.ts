import prisma from "@/lib/prisma"
import { ParamsIdIProps } from "@/types";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
	try {
		const result = await prisma.faq.findMany();
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Data fetch Fail");
	}
}

export const POST = async (request: Request) => {
	try {
		const { title, description } = await request.json();
		const result = await prisma.faq.create({
			data: {
				title, description
			}
		});
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Data fetch Fail");
	}
}