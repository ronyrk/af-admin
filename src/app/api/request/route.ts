
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export const dynamic = 'force-dynamic'

export const GET = async () => {
	try {
		const result = await prisma.request.findMany();
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Server Error");
	}
};

export const POST = async (request: Request) => {
	try {
		const body = await request.json();
		const { loanusername, photoUrl, amount, method, createAt } = body;
		const payment = await prisma.request.create({
			data: {
				loanusername, photoUrl, amount, method, createAt
			}
		});
		return NextResponse.json({ message: "payment Successfully Added", payment });
	} catch (error) {
		return NextResponse.json({ message: error });
	}
};