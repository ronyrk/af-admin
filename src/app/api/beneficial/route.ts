import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BeneficialCreateIProps, BeneficialDonorIProps } from "@/types";

export const dynamic = 'force-dynamic'



// Create Beneficial
export const POST = async (request: Request) => {
    try {
        const body: BeneficialCreateIProps = await request.json();
        const { name, username, village, postoffice, district, policeStation, occupation, photoUrl, about, beneficialDonorId, phone, nidFront, nidBack } = body;
        console.log({ body })

        const result = await prisma.beneficial.create({
            data: { name, username, village, postoffice, district, policeStation, occupation, photoUrl, about, beneficialDonorId, phone, nidFront, nidBack }
        });

        return NextResponse.json({ message: "successfully Donor Created", result }, { status: 200 });
    } catch (error: any) {
        console.log({ error });
        if (error?.code === 'P2002') {
            return NextResponse.json({ message: `a new user cannot be created with this ${error?.meta?.target}` });
        }
        // console.log({ error })
        return NextResponse.json({ message: "Branch Created Failed" });
    }
}