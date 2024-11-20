
import { LoanIProps } from "@/types";
import { cookies } from 'next/headers';

// Loan Details
export async function GetLoanDetails(username: string) {
	"use server";
	try {
		cookies();
		let res = await fetch(`https://af-admin.vercel.app/api/loan/${username}`);
		if (!res.ok) {
			throw new Error("Failed to fetch data");
		};
		const loan: LoanIProps = await res.json();
		const name = loan.name;
		return name;
	} catch (error) {
		throw new Error("Server Error get Loan Details");
	}
}