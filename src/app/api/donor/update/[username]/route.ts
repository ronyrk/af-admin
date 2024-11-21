import prisma from "@/lib/prisma";
import { ParamsIProps } from "@/types";
import { NextResponse } from "next/server";

// Deleted branch
export const DELETE = async (request: Request, { params }: ParamsIProps) => {
    try {
        const { username } = params;
        await prisma.donorPayment.update({
            where: {
                id: username
            }, data: {
                upComing: false
            }
        });
        return NextResponse.json({ message: "successfully updated" });
    } catch (error) {
        return NextResponse.json({ error });
    }
}