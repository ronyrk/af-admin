"use server";
import { unstable_noStore } from "next/cache";
import prisma from "./prisma";

export async function getSearchMember(query: string, page: string) {
    const pageNumber = Number(page) - 1;
    const take = 10;
    const skip = take * pageNumber;
    unstable_noStore();
    if (query === "all") {
        const result = await prisma.owner.findMany({
            take,
            skip,
        });
        return result;
    }
    const result = await prisma.owner.findMany({
        take,
        skip,
        where: {
            OR: [
                {
                    type: {
                        contains: query,
                        mode: "insensitive"
                    }
                },
                {
                    name: {
                        contains: query,
                        mode: "insensitive"
                    }
                },
            ]
        },
    })
    return result;
};