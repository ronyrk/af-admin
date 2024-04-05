import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export const GET = async (request: Request) => {
	try {
		const result = await prisma.gallery.findMany();
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Data fetch Fail");
	}
}

export const POST = async (request: Request) => {
	try {
		const { category, content } = await request.json();
		const result = await prisma.gallery.create({
			data: {
				category, content
			}
		});
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Data fetch Fail");
	}
}