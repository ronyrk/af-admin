
import { LoanIProps } from "@/types";
import { unstable_noStore } from "next/cache";

// Loan Details
export async function GetLoanDetails(username: string) {
	"use server";
	try {
		unstable_noStore();
		let res = await fetch(`https://arafatfoundation.vercel.app/api/loan/${username}`);
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