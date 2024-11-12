import { ParamsIdIProps, ParamsIProps } from "@/types";
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

export const PATCH = async (request: Request, { params }: ParamsIProps) => {
    try {
        const { username } = params;
        const { loanPayment } = await request.json();
        console.log({ params })
        const result = await prisma.donorPayment.update({
            where: { id: username },
            data: {
                loanPayment
            }
        });
        return NextResponse.json({ message: "successfully updated", result })
    } catch (error) {
        console.log({ error })
        return NextResponse.json({ error });
    }
};