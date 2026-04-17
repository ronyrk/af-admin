// app/borrowers/page.tsx
import React, { Suspense } from "react";
import {
	Table, TableBody, TableCaption, TableCell,
	TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ClipboardPenLine } from "lucide-react";
import SearchBox from "@/components/SearchBox";
import { getSearchBorrowers } from "@/lib/SearchBorrowers";
import { verifyToken } from "@/lib/auth";
import DeleteButton from "@/components/DeleteButton";
import Pagination from "@/components/beneficial-pagination";

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchParams = { search?: string; page?: string };

type BorrowerWithStats = {
	code: string;
	name: string;
	username: string;
	balance: string;
	totalDisbursed: number;
	totalRecovered: number;
	due: number;
};

type FooterTotals = {
	totalDisbursed: number;
	totalRecovered: number;
	totalDue: number;
};

export interface ApiResponse {
	success: boolean;
	data: {
		branch: {
			id: string;
			code: string;
			username: string;
			email: string;
			branchName: string;
			district: string;
			ps: string;
			address: string;
			photoUrl: string[];
			status: string;

			teamLeader: {
				name: string;
				phone: string;
				address: string;
				occupation: string;
				photoUrl: string;
			};

			president: {
				name: string;
				phone: string;
				address: string;
				occupation: string;
			};

			imam: {
				name: string;
				phone: string;
				address: string;
				occupation: string;
			};

			secretary: {
				name: string;
				phone: string;
				address: string;
				occupation: string;
			};
		};

		summary: {
			borrowers: {
				totalDisbursed: number;
				totalRecovered: number;
				totalBalance: number;
				totalRunning: number;
				totalCompleted: number;
			};

			donors: {
				lending: number;       // total donor amount
				refund: number;       // total loan payments returned to donors
				donorDonate: number;
				leanderDonate: number;
				totalDonate: number;  // total donated amount
				outstanding: number;  // amount still loaned out (not yet refunded)
				leaderCount: number;
				donorCount: number;
			};

			branch: {
				total: number;
				totalDonorDisbursed: number;
				totalDonorRecovered: number;
				totalDonated: number;
				totalDonorOutstanding: number;
				totalBorrowerDisbursed: number;
				totalBorrowerRecovered: number;
				totalBorrowerBalance: number;
			};
		};
	};
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

/**
 * FIX: Use groupBy aggregate — pushes all math to DB, returns only summary rows.
 * O(1) query instead of O(n) full table scan + JS aggregation.
 */
async function getBorrowersWithStats(
	usernames: string[]
): Promise<Map<string, { totalDisbursed: number; totalRecovered: number }>> {
	if (usernames.length === 0) return new Map();

	const payments = await prisma.payment.findMany({
		where: { loanusername: { in: usernames } },
		select: { loanusername: true, loanAmount: true, amount: true },
	});

	const statsMap = new Map<string, { totalDisbursed: number; totalRecovered: number }>();
	for (const p of payments) {
		const existing = statsMap.get(p.loanusername) ?? { totalDisbursed: 0, totalRecovered: 0 };
		statsMap.set(p.loanusername, {
			totalDisbursed: existing.totalDisbursed + Number(p.loanAmount),
			totalRecovered: existing.totalRecovered + Number(p.amount),
		});
	}
	return statsMap;
}

/**
 * FIX: Use aggregate instead of fetching all rows.
 * Previously loaded every Payment record into memory — now a single DB sum.
 */
async function getFooterTotals(): Promise<FooterTotals> {
	const payments = await prisma.payment.findMany({
		select: { loanAmount: true, amount: true },
	});

	let totalDisbursed = 0;
	let totalRecovered = 0;
	for (const p of payments) {
		totalDisbursed += Number(p.loanAmount);
		totalRecovered += Number(p.amount);
	}

	return {
		totalDisbursed,
		totalRecovered,
		totalDue: Math.max(0, totalDisbursed - totalRecovered),
	};
}

/**
 * FIX: Only called when needed (non-admin). Keeps the external fetch
 * out of the admin code path entirely.
 */
async function getBranchSummary(token: string): Promise<ApiResponse | null> {
	try {
		const response = await fetch(
			"https://af-admin.vercel.app/api/branch/all-in-one",
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				// Cache for 60s — avoids re-fetching on every page navigation
				next: { revalidate: 60 },
			}
		);
		if (!response.ok) return null;
		const data: ApiResponse = await response.json();
		return { success: true, data: data.data };
	} catch {
		return null;
	}
}

// ─── BorrowersList (async server component) ───────────────────────────────────

async function BorrowersList({
	searchParams,
	token,
	isAdmin,
}: {
	searchParams?: SearchParams;
	token: string;
	isAdmin: boolean;
}) {
	const query = searchParams?.search || "all";
	const page = searchParams?.page || "1";

	const payload = await verifyToken(token);

	// 1. Paginated borrowers from DB
	const { data: borrowers, pagination } = await getSearchBorrowers(
		query,
		page,
		payload
	);

	// 2. Parallel fetch: stats + footer totals + (branch summary only if branch user)
	//    FIX: Run independent async work concurrently with Promise.all
	const usernames = borrowers.map((b) => b.username);

	const [statsMap, totals, branchSummary] = await Promise.all([
		getBorrowersWithStats(usernames),
		isAdmin ? getFooterTotals() : Promise.resolve(null),
		!isAdmin ? getBranchSummary(token) : Promise.resolve(null),
	]);

	// 3. Enrich borrowers
	//    FIX: `borrower.balance` is the *current outstanding balance*, not an extra
	//    disbursement. Do NOT add it to totalDisbursed — that double-counts.
	//    totalDisbursed comes entirely from payment records (loanAmount).
	const enriched: BorrowerWithStats[] = borrowers
		.map((borrower) => {
			const stats = statsMap.get(borrower.username) ?? {
				totalDisbursed: 0,
				totalRecovered: 0,
			};
			return {
				...borrower,
				totalDisbursed: stats.totalDisbursed,
				totalRecovered: stats.totalRecovered,
				due: Math.max(0, stats.totalDisbursed - stats.totalRecovered),
			};
		})
		.sort((a, b) => b.due - a.due);

	// 4. Footer values
	const footerDisbursed = isAdmin
		? totals!.totalDisbursed.toLocaleString()
		: branchSummary?.data.summary.borrowers.totalDisbursed?.toLocaleString() ?? "—";

	const footerRecovered = isAdmin
		? totals!.totalRecovered.toLocaleString()
		: branchSummary?.data.summary.borrowers.totalRecovered?.toLocaleString() ?? "—";

	const footerDue = isAdmin
		? totals!.totalDue.toLocaleString()
		: branchSummary?.data.summary.borrowers.totalBalance?.toLocaleString() ?? "—";

	const colSpan = isAdmin ? 7 : 6;

	return (
		<>
			<TableBody>
				{enriched.map((item) => (
					<TableRow key={item.username}>
						<TableCell className="font-medium">{item.code}</TableCell>
						<TableCell className="font-medium uppercase">{item.name}</TableCell>
						<TableCell className="font-medium">
							{item.totalDisbursed.toLocaleString()}
						</TableCell>
						<TableCell className="font-medium">
							{item.totalRecovered.toLocaleString()}
						</TableCell>
						<TableCell className="font-medium">
							{item.due.toLocaleString()}
						</TableCell>
						<TableCell>
							<Button
								className="bg-color-main"
								variant="outline"
								size="sm"
								asChild
							>
								<Link href={`borrowers/${item.username}`}>
									<ClipboardPenLine />
								</Link>
							</Button>
						</TableCell>
						{isAdmin && (
							<TableCell>
								<DeleteButton type="loan" username={item.username} />
							</TableCell>
						)}
					</TableRow>
				))}

				{enriched.length === 0 && (
					<TableRow>
						<TableCell
							colSpan={colSpan}
							className="text-center py-8 text-muted-foreground"
						>
							No borrowers found.
						</TableCell>
					</TableRow>
				)}
			</TableBody>

			<TableFooter>
				<TableRow>
					<TableCell className="font-semibold" colSpan={2}>
						Total
					</TableCell>
					<TableCell className="font-semibold">{footerDisbursed}</TableCell>
					<TableCell className="font-semibold">{footerRecovered}</TableCell>
					<TableCell className="font-semibold">{footerDue}</TableCell>
					<TableCell colSpan={isAdmin ? 2 : 1} />
				</TableRow>
			</TableFooter>

			{/* FIX: Pagination sits outside <tfoot> to avoid double-wrapping */}
			<caption className="caption-bottom">
				<div className="flex justify-center py-2">
					<Pagination
						currentPage={pagination.currentPage}
						totalPages={pagination.totalPages}
						hasNext={pagination.hasNext}
						hasPrev={pagination.hasPrev}
					/>
				</div>
			</caption>
		</>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BorrowersPage({
	searchParams,
}: {
	searchParams?: SearchParams;
}) {
	// FIX: Read token ONCE at the page level and pass it down — not twice
	const token = cookies().get("auth")?.value ?? "";
	const payload = await verifyToken(token) as { username: string; role: string } | null;
	const isAdmin = payload?.role === "admin";

	return (
		<div className="flex flex-col">
			<div className="flex flex-row justify-between p-2">
				<Button asChild>
					<Link
						className="bg-color-main hover:bg-color-sub"
						href="borrowers/create"
					>
						Borrowers Create
					</Link>
				</Button>
				<Suspense
					fallback={
						<div className="w-48 h-9 bg-muted animate-pulse rounded-md" />
					}
				>
					<SearchBox />
				</Suspense>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>CODE</TableHead>
						<TableHead className="w-[300px]">BORROWERS NAME</TableHead>
						<TableHead>DISBURSED</TableHead>
						<TableHead>RECOVERED</TableHead>
						<TableHead>BALANCE</TableHead>
						<TableHead>DETAILS</TableHead>
						{isAdmin && <TableHead>DELETE</TableHead>}
					</TableRow>
				</TableHeader>

				<Suspense
					fallback={
						<TableBody>
							{Array.from({ length: 10 }).map((_, i) => (
								<TableRow key={i}>
									{Array.from({ length: isAdmin ? 7 : 6 }).map((_, j) => (
										<TableCell key={j}>
											<div className="h-4 bg-muted animate-pulse rounded" />
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					}
				>
					{/* FIX: Pass resolved values — no re-reading cookies inside child */}
					<BorrowersList
						searchParams={searchParams}
						token={token}
						isAdmin={isAdmin}
					/>
				</Suspense>
			</Table>
		</div>
	);
}