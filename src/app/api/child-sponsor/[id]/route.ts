import { ParamsIdIProps } from "@/types";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export const dynamic = 'force-dynamic'


export const DELETE = async (request: Request, { params }: ParamsIdIProps) => {
	try {
		const { id } = params;
		await prisma.childsDonateRequest.delete({
			where: {
				id
			}
		});
		return NextResponse.json({ message: "Payment Request Deleted" })
	} catch (error) {
		return NextResponse.json({ error });
	}
}