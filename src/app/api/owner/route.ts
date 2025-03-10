import prisma from "@/lib/prisma";
import { OwnerIProps } from "@/types";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
    try {
        const body: OwnerIProps = await request.json();
        const { position, name, mobile, photos, facebook, linkedin, description, type } = body;
        const result = await prisma.owner.create({
            data: {
                position, name, mobile, photos, facebook, linkedin, description, type
            }
        });
        return NextResponse.json({ message: "Branch Created Successfully", data: result });

    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ message: `a new user cannot be created with this ${error?.meta?.target}` });
        }
        return NextResponse.json({ message: "Branch Created Failed" });
    }
}