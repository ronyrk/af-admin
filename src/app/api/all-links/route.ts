import { AllLinkIProps } from "@/types";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const POST = async (request: Request) => {
    try {
        const body: AllLinkIProps = await request.json();
        const { name, type, path } = body;
        const result = await prisma.all_links.create({
            data: {
                path, name, type
            }
        });
        return NextResponse.json(result);
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ message: `a new user cannot be created with this ${error?.meta?.target}` });
        }
        return NextResponse.json({ message: "Created Failed" });
    }
};

export const GET = async () => {
    try {
        const result = await prisma.all_links.findMany();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: "error" });
    }
}