import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const GET = async (request: Request) => {
    const url = new URL(request.url);
    const startString = url.searchParams.get("from");
    const start = new Date(startString as any);
    const endString = url.searchParams.get("to");
    const end = new Date(endString as any)
    const page = url.searchParams.get("page");
    const transaction = url.searchParams.get("transaction") as any;
    console.log(startString, endString, page, transaction);
    try {
        if (transaction === "") {
            const result = await prisma.income.findMany({
                // 	// skip,
                // 	// take,
                where: {
                    date: {
                        gte: start,
                        lte: end
                    }
                },
                orderBy: {
                    date: "desc"
                }
            });
            return NextResponse.json(result)
        } else {
            const result = await prisma.income.findMany({
                where: {
                    transaction: {
                        contains: transaction,
                        mode: "insensitive"
                    }
                }
            });
            return NextResponse.json(result);
        }
    } catch (error) {
        return NextResponse.json("server Error");
    }

}