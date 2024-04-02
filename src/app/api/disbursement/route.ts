
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
	try {
		const { date, description, username } = await request.json();
		const result = await prisma.disbursement.create({
			data: {
				date, description, username
			}
		});
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Server Error");
	}
};


export const GET = async () => {
	try {
		const result = await prisma.disbursement.findMany();
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Server Error");
	}
};