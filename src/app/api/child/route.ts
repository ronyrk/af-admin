import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export const POST = async (request: Request) => {
	try {
		const { username, name, dream, description, photoUrl, address, phone, academy, paymentInfo, outsidePaymentInfo, link } = await request.json();
		const result = await prisma.child.create({
			data: {
				username, name, dream, description, photoUrl, phone, address, academy, paymentInfo, outsidePaymentInfo, link
			}
		});
		return NextResponse.json({ message: "Successfully Child Created", result }, { status: 201 });
	} catch (error: any) {
		if (error?.code === 'P2002') {
			return NextResponse.json({ message: `a new user cannot be created with this ${error?.meta?.target}` });
		}
		return NextResponse.json({ message: "Child Created Failed" });
	}
};

export const GET = async (request: Request) => {
	try {
		const result = await prisma.child.findMany();
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Server Error");
	}
}