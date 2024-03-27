import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
	try {
		const result = await prisma.project.findMany();
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Data fetch Fail");
	}
}

export const POST = async (request: Request) => {
	try {
		const { title, description, author, shortDes, photoUrl } = await request.json();
		const result = await prisma.project.create({
			data: {
				title,
				description,
				author,
				shortDes, photoUrl
			}
		})
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Data fetch Fail");
	}
}