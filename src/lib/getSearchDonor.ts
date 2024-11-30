"use server";
import { unstable_noStore } from "next/cache";
import prisma from "./prisma";

export async function getSearchDonor(query: string, page: string) {
    const pageNumber = Number(page) - 1;
    const take = 10;
    const skip = take * pageNumber;
    unstable_noStore();
    if (query === "all") {
        const result = await prisma.donor.findMany({
            take,
            skip,
            orderBy: {
                code: "asc"
            }
        });
        return result;
    }
    const result = await prisma.donor.findMany({
        take,
        skip,
        where: {
            OR: [
                {
                    code: {
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
        orderBy: {
            code: "asc"
        }
    })
    return result;
};