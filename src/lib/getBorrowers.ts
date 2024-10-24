"use server";
import { unstable_noStore } from "next/cache";
import prisma from "./prisma";

export async function getBorrowers(query: string) {
	unstable_noStore();
	if (query === "all") {
		const result = await prisma.loan.findMany({
			orderBy: {
				code: "asc"
			}
		});
		return result;
	}
	const result = await prisma.loan.findMany({
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
				{
					address: {
						contains: query,
						mode: "insensitive"
					}
				}
			]
		},
		orderBy: {
			code: "asc"
		}
	})
	return result;
};

export async function getBorrowersByBranch(branch: string) {
	unstable_noStore();
	const result = await prisma.loan.findMany({
		where: {
			branch
		}
	});
	return result;
};