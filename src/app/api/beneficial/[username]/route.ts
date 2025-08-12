import { BeneficialUpdatedIProps, ParamsIProps } from "@/types";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'


// Single branch Updated

export const PATCH = async (request: Request, { params }: ParamsIProps) => {
    try {
        const { username } = params;
        const body: BeneficialUpdatedIProps = await request.json();
        const { name, photoUrl, about, village, postoffice, district, policeStation, occupation, phone, beneficialDonorId, nidFront, nidBack } = body;
        const result = await prisma.beneficial.update({
            where: { username },
            data: {
                name, photoUrl, about, village, postoffice, district, policeStation, occupation, phone, beneficialDonorId, nidFront, nidBack
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
        await prisma.beneficial.delete({ where: { username } });
        return NextResponse.json({ message: "deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error });
    }
}