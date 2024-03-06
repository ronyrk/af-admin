import { NextResponse } from "next/server"
import prisma from "@/lib/prisma";


export const GET = async (request: Request, { params }: { params: { type: string } }) => {
	try {
		const { type } = params;
		if (type === "return") {
			const result = await prisma.donor.findMany({ where: { status: "LEADER" } });
			return NextResponse.json(result);
		} else {
			const result = await prisma.donor.findMany();
			return NextResponse.json(result);
		}

	} catch (error) {
		throw new Error("Data fetch failed");
	}
}