import { ParamsIProps } from "@/types";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'

export const GET = async (request: Request, { params }: ParamsIProps) => {
    try {
        const { username } = params;
        const loanList = await prisma.payment.findMany({
            where: { loanusername: username }, orderBy: {
                createAt: "asc"
            }
        });
        return NextResponse.json(loanList);
    } catch (error) {
        throw new Error("Server Error");
    };
};