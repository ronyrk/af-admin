import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'



// Create Donor
export const POST = async (request: Request) => {
    try {
        const body = await request.json();
        const { name, districtId } = body;
        const result = await prisma.policeStation.create({
            data: { name, districtId }
        });
        return NextResponse.json({ message: "successfully Police Station Created", result }, { status: 200 });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ message: `a new police station cannot be created with this ${error?.meta?.target}` });
        }
        // console.log({ error })
        return NextResponse.json({ message: "Police Station Created Failed" });
    }
}