import { ParamsIProps } from "@/types";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export const GET = async (request: Request, { params }: ParamsIProps) => {
    try {
        const { username } = params;
        const result = await prisma.donorPayment.findMany({
            where: { donorUsername: username }, orderBy: {
                createAt: "asc"
            }
        });
        return NextResponse.json(result);
    } catch (error) {
        throw new Error("Server Error")
    }
};