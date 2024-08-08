import prisma from "@/lib/prisma";
import { PaymentIProps } from "@/types";
import { NextResponse } from "next/server";


export const POST = async (request: Request) => {
    try {
        const body: PaymentIProps = await request.json();
        const { loanusername, amount, loanAmount, createAt } = body;
        const result = await prisma.payment.create({
            data: {
                loanusername, amount, loanAmount, createAt
            }
        })
        return NextResponse.json(result);
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ message: `a new user cannot be created with this ${error?.meta?.target}` });
        }
        return NextResponse.json({ message: "Borrowers loan Created Failed" });
    }
}