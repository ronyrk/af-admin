import prisma from "./prisma";
import { LoanIProps } from "@/types";
import { cookies } from 'next/headers';

// Loan to Branch Details
export async function GetBranchDetails(username: string) {
	"use server";
	try {
		cookies();
		let res = await fetch(`https://arafatfoundation.vercel.app/api/loan/${username}`);
		if (!res.ok) {
			throw new Error("Failed to fetch data");
		};
		const loan: LoanIProps = await res.json();
		const BranchUserName = loan.branch;
		const branch = await prisma.branch.findUnique({ where: { username: BranchUserName } });
		return `${branch?.branchName}`;
	} catch (error) {
		throw new Error("Server Error  Branch");
	}
}