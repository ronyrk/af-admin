import prisma from "@/lib/prisma";
import { ParamsIProps, ParamsIdIProps } from "@/types";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export const GET = async (request: Request, { params }: {
	params: {
		username: string
	}
}) => {
	try {
		const { username } = params;
		const result = await prisma.news.findUnique({
			where: {
				username: params.username,
			}
		})
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Data fetch failed");
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
		await prisma.news.delete({
			where: {
				username
			}
		})
		return NextResponse.json({ message: "deleted successfully" });
	} catch (error) {
		throw new Error("Data fetch failed");
	}
}

export const PATCH = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;
		const { title, description, photoUrl, shortDes } = await request.json();
		const result = await prisma.news.update({
			where: { username },
			data: {
				title, description, photoUrl, shortDes
			}
		})
		return NextResponse.json({ message: "News updated" })

	} catch (error) {
		throw new Error("Data fetch failed");
	}
}