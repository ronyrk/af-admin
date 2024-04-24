import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

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
		const { title, description, photoUrl, username, shortDes } = await request.json();
		const result = await prisma.news.create({
			data: {
				title,
				description,
				photoUrl, username,
				shortDes
			}
		})
		return NextResponse.json(result);
	} catch (error: any) {
		if (error?.code === 'P2002') {
			return NextResponse.json({ message: `a new user cannot be created with this ${error?.meta?.target}` });
		}
		return NextResponse.json({ message: "Branch Created Failed" });
	}
}