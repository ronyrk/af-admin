import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'

// District List
export const GET = async () => {
    try {
        const result = await prisma.district.findMany(
            {
                orderBy: {
                    createdAt: "desc"
                },
                include: {
                    policeStations: true
                }
            }
        );
        return NextResponse.json(result);
    } catch (error) {
        throw new Error("Server Error");
    }
};


// Create Donor
export const POST = async (request: Request) => {
    try {
        const body = await request.json();
        const { name } = body;
        const result = await prisma.district.create({
            data: { name }
        });
        return NextResponse.json({ message: "successfully District Created", result }, { status: 200 });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ message: `a new district cannot be created with this ${error?.meta?.target}` });
        }
        // console.log({ error })
        return NextResponse.json({ message: "District Created Failed" });
    }
}