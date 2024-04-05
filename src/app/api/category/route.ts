import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
	try {
		const result = await prisma.category.findMany();
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Data fetch Fail");
	}
}

export const POST = async (request: Request) => {
	try {
		const { path, name } = await request.json();
		const result = await prisma.category.create({
			data: {
				name, path
			}
		});
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Data fetch Failed");
	}
}