import { BeneficialDonorIProps, DonorIProps, ParamsIProps } from "@/types";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'


// Single branch Updated

export const PATCH = async (request: Request, { params }: ParamsIProps) => {
    try {
        const { username } = params;
        const body: BeneficialDonorIProps = await request.json();
        const { name, photoUrl, about, live, homeTown, phone } = body;
        const result = await prisma.beneficialDonor.update({
            where: { username },
            data: {
                name, photoUrl, about, live, homeTown, phone
            }
        });
        return NextResponse.json({ message: "successfully updated", result })
    } catch (error) {
        return NextResponse.json({ error });
    }
};

// Deleted branch
export const DELETE = async (request: Request, { params }: ParamsIProps) => {
    try {
        const { username } = params;
        await prisma.beneficialDonor.delete({ where: { username } });
        return NextResponse.json({ message: "deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error });
    }
}