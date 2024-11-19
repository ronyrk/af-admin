import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DonorIProps } from "@/types";

export const dynamic = 'force-dynamic'

// Donor List
export const GET = async () => {
	try {
		const result = await prisma.donor.findMany();
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Server Error");
	}
};


// Create Donor
export const POST = async (request: Request) => {
	try {
		const body: DonorIProps = await request.json();
		const { username, email, code, password, name, photoUrl, about, amount, lives, hometown, status, socailMedia1, socailMedia2, mobile } = body;
		const result = await prisma.donor.create({
			data: { username, email, code, password, name, photoUrl, about, amount, lives, hometown, status, socailMedia1, socailMedia2, mobile }
		});
		return NextResponse.json({ message: "successfully Donor Created", result }, { status: 200 });
	} catch (error: any) {
		if (error?.code === 'P2002') {
			return NextResponse.json({ message: `a new user cannot be created with this ${error?.meta?.target}` });
		}
		return NextResponse.json({ message: "Branch Created Failed" });
	}
}