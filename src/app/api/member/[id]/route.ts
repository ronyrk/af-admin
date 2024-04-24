import { ParamsIdIProps } from "@/types";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export const dynamic = 'force-dynamic'


export const DELETE = async (request: Request, { params }: ParamsIdIProps) => {
	try {
		const { id } = params;
		await prisma.member.delete({
			where: {
				id
			}
		});
		return NextResponse.json({ message: "Deleted Successfully" })
	} catch (error) {
		return NextResponse.json({ error });
	}
}