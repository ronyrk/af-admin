import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
	try {
		const result = await prisma.news.findMany();
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Data fetch Fail");
	}
}

export const POST = async (request: Request) => {
	try {
		const { title, description, photoUrl, username } = await request.json();
		const result = await prisma.news.create({
			data: {
				title,
				description,
				photoUrl, username
			}
		})
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Data fetch Failed");
	}
}