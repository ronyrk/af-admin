
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export const GET = async () => {
	try {
		const result = await prisma.projectDonateRequest.findMany();
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Server Error");
	}
} 