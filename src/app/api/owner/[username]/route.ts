import prisma from "@/lib/prisma";
import { ParamsIProps } from "@/types";
import { NextResponse } from "next/server";


export const PATCH = async (request: Request, { params }: ParamsIProps) => {
    try {
        const { username } = params;
        const { name, photos, facebook, linkedin, mobile, description, type } = await request.json();
        const result = await prisma.owner.update({
            where: { id: username },
            data: {
                name, photos, facebook, linkedin, mobile, description, type
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
        await prisma.owner.delete({ where: { id: username } });
        return NextResponse.json({ message: "deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error });
    }
}