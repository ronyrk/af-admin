import prisma from "@/lib/prisma";
import { ParamsIdIProps } from "@/types";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export const GET = async (request: Request, { params }: {
	params: {
		username: string
	}
}) => {
	try {
		const { username } = params;
		const result = await prisma.project.findUnique({
			where: {
				username
			}
		})
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Data fetch fail");
	}
}
// Deleted branch
export const DELETE = async (request: Request, { params }: {
	params: {
		username: string
	}
}) => {
	try {
		const { username } = params;
		await prisma.project.delete({
			where: {
				id: username
			}
		})
		return NextResponse.json({ message: "deleted successfully" });
	} catch (error) {
		throw new Error("Data fetch fail");
	}
}

export const PATCH = async (request: Request, { params }: ParamsIdIProps) => {
	try {
		const { id } = params;
		const { title, description, shortDes, photoUrl } = await request.json();
		const result = await prisma.project.update({
			where: { id },
			data: {
				title, shortDes, description, photoUrl
			}
		})
		return NextResponse.json({ message: "FAQ updated" })

	} catch (error) {
		throw new Error("Data fetch fail");
	}
}