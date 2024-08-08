import { ParamsIdIProps } from "@/types";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export const DELETE = async (request: Request, { params }: ParamsIdIProps) => {
    try {
        const { id } = params;
        await prisma.all_links.delete({
            where: {
                id
            }
        });
        return NextResponse.json({ message: "deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error });
    }
}