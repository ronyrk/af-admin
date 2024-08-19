import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Deleted branch
export const DELETE = async (request: Request, { params }: {
    params: {
        id: string
    }
}) => {
    try {
        const { id } = params;
        await prisma.donate.delete({
            where: {
                id
            }
        });
        return NextResponse.json({ message: "deleted successfully" });
    } catch (error) {
        return NextResponse.json(error);
    }
}