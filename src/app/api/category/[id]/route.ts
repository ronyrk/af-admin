import prisma from "@/lib/prisma";
import { ParamsIdIProps } from "@/types";
import { NextResponse } from "next/server";

// Deleted branch
export const DELETE = async (request: Request, { params }: ParamsIdIProps) => {
	try {
		const { id } = params;
		const category = await prisma.category.findUnique({
			where: {
				id
			}
		});
		await prisma.gallery.deleteMany({
			where: {
				category: category?.path
			}
		});
		await prisma.category.delete({ where: { id } });
		return NextResponse.json({ message: "deleted successfully" });
	} catch (error) {
		throw new Error("Data fetch fail");
	}
}