import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export interface UserNameIProps {
	username: string,
};
export interface ParamsIProps {
	params: UserNameIProps,
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

// ─── Helpers ────────────────────────────────────────────────────────────────

async function fetchPaymentSummary(
	borrowerUsername: string,
	initialBalance: number
): Promise<{ totalDisbursed: number; totalRecovered: number; balance: number }> {
	try {
		const res = await fetch(
			`https://af-admin.vercel.app/api/loan_list/${borrowerUsername}`,
			{ next: { revalidate: 60 } } // cache 60s instead of always refetching
		);
		if (!res.ok) throw new Error("fetch failed");

		const payments: { loanAmount: string; amount: string }[] = await res.json();

		const totalDisbursed = payments.reduce(
			(sum, p) => sum + Number(p.loanAmount),
			initialBalance
		);
		const totalRecovered = payments.reduce(
			(sum, p) => sum + Number(p.amount),
			0
		);
		const balance = totalDisbursed - totalRecovered;

		return { totalDisbursed, totalRecovered, balance };
	} catch {
		return {
			totalDisbursed: initialBalance,
			totalRecovered: 0,
			balance: initialBalance,
		};
	}
}

export const GET = async (
	request: NextRequest,
	{ params }: ParamsIProps
) => {
	try {
		const { username } = params;
		const { searchParams } = new URL(request.url);
		const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
		const skip = (page - 1) * PAGE_SIZE;

		// Single DB query — branch + paginated borrowers + total count
		const [branchData, totalBorrowers] = await Promise.all([
			prisma.branchList.findUnique({
				where: { username },
				include: {
					borrowers: {
						skip,
						take: PAGE_SIZE,
						orderBy: { name: "asc" },
					},
				},
			}),
			prisma.borrowers.count({ where: { branch: username } }),
		]);

		if (!branchData) {
			return NextResponse.json({ success: false, data: null }, { status: 404 });
		}

		// Fetch all payment summaries for this page in PARALLEL (not sequentially)
		const borrowersWithPayments = await Promise.all(
			branchData.borrowers.map(async (borrower: any) => {
				const summary = await fetchPaymentSummary(
					borrower.username,
					Number(borrower.balance ?? 0)
				);
				return { ...borrower, ...summary };
			})
		);

		return NextResponse.json({
			success: true,
			data: {
				...branchData,
				borrowers: borrowersWithPayments,
			},
			pagination: {
				page,
				pageSize: PAGE_SIZE,
				total: totalBorrowers,
				totalPages: Math.ceil(totalBorrowers / PAGE_SIZE),
			},
		});
	} catch (error) {
		console.error("[branch/GET]", error);
		return NextResponse.json(
			{ success: false, data: null },
			{ status: 500 }
		);
	}
};