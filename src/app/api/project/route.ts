import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

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
		const { title, description, author, shortDes, photoUrl, username, paymentInfo } = await request.json();
		const result = await prisma.project.create({
			data: {
				title,
				description,
				author,
				shortDes, photoUrl, username, paymentInfo
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