import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BeneficialDonorIProps } from "@/types";

export const dynamic = 'force-dynamic'

export const GET = async (request: Request) => {
    try {
        const result = await prisma.beneficialDonor.findMany();
        return NextResponse.json(result);
    } catch (error) {
        throw new Error("Server Error");
    }
}


// Create Donor
export const POST = async (request: Request) => {
    try {
        const body: BeneficialDonorIProps = await request.json();
        const { username, name, photoUrl, about, live, homeTown, phone } = body;
        const result = await prisma.beneficialDonor.create({
            data: { username, name, photoUrl, about, live, homeTown, phone }
        });
        return NextResponse.json({ message: "successfully Donor Created", result }, { status: 200 });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ message: `a new user cannot be created with this ${error?.meta?.target}` });
        }
        // console.log({ error })
        return NextResponse.json({ message: "Branch Created Failed" });
    }
}