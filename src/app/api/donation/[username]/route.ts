
import prisma from "@/lib/prisma";
import { ParamsIProps } from "@/types";
import { NextResponse } from "next/server";

export const GET = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;
		const result = await prisma.donation.findMany({
			where: {
				username,
			}
		});
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Server Error");
	}
}