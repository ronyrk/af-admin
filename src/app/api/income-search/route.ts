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
    const pageNumber = Number(page) - 1;
    const take = 20;
    const skip = take * pageNumber;
    try {
        if (transaction === "" && startString === "u" && endString === "u") {

            const result = await prisma.income.findMany({
                skip,
                take,
                orderBy: {
                    date: "desc"
                }
            });
            return NextResponse.json(result);
        } else if (startString !== "u" && endString !== "u" && transaction === "") {

            const result = await prisma.income.findMany({
                where: {
                    date: {
                        gte: start,
                        lte: end
                    }
                },
                skip,
                take,
                orderBy: {
                    date: "desc"
                }
            });
            return NextResponse.json(result);
        } else {
            const result = await prisma.income.findMany({
                where: {
                    transaction: {
                        contains: transaction,
                        mode: "insensitive"
                    }
                },
                skip,
                take,
                orderBy: {
                    date: "desc"
                }
            });
            return NextResponse.json(result);
        };
    } catch (error) {
        return NextResponse.json("server Error");
    }

};