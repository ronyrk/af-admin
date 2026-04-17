// ─── app/borrowers/page.tsx ───────────────────────────────────────────────────
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

// ─── Data Fetching ────────────────────────────────────────────────────────────

/**
 * Single DB query replaces N+1 individual API calls.
 * Aggregates all payment stats per borrower in one round-trip.
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
 * Global footer totals — single aggregation query, no per-row fetches.
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

// ─── Components ───────────────────────────────────────────────────────────────

async function BorrowersList({ searchParams }: { searchParams?: SearchParams }) {
	const query = searchParams?.search || "all";
	const page = searchParams?.page || "1";

	const token = cookies().get("auth")?.value;
	const payload = (await verifyToken(token as string)) as {
		username: string;
		role: string;
	} | null;

	// 1. Fetch paginated borrowers (already paginated in DB — no slicing needed)
	const { data: borrowers, pagination } = await getSearchBorrowers(query, page, payload);

	// 2. Batch-fetch all payment stats in ONE query instead of N API calls
	const usernames = borrowers.map((b) => b.username);
	const statsMap = await getBorrowersWithStats(usernames);

	// 3. Enrich and sort borrowers
	const enriched: BorrowerWithStats[] = borrowers
		.map((borrower) => {
			const stats = statsMap.get(borrower.username) ?? {
				totalDisbursed: 0,
				totalRecovered: 0,
			};
			const totalDisbursed = stats.totalDisbursed + Number(borrower.balance);
			const totalRecovered = stats.totalRecovered;
			return {
				...borrower,
				totalDisbursed,
				totalRecovered,
				due: Math.max(0, totalDisbursed - totalRecovered),
			};
		})
		.sort((a, b) => b.due - a.due);

	// 4. Footer totals — single aggregation, not per-row
	const totals = await getFooterTotals();

	const isAdmin = payload?.role === "admin";

	return (
		<>
			<TableBody>
				{enriched.map((item) => (
					<TableRow key={item.username}>
						<TableCell className="font-medium">{item.code}</TableCell>
						<TableCell className="font-medium uppercase">{item.name}</TableCell>
						<TableCell className="font-medium">{item.totalDisbursed.toLocaleString()}</TableCell>
						<TableCell className="font-medium">{item.totalRecovered.toLocaleString()}</TableCell>
						<TableCell className="font-medium">{item.due.toLocaleString()}</TableCell>
						<TableCell>
							<Button className="bg-color-main" variant="outline" size="sm" asChild>
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
						<TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-muted-foreground">
							No borrowers found.
						</TableCell>
					</TableRow>
				)}
			</TableBody>

			<TableFooter>
				<TableRow>
					<TableCell className="font-semibold" colSpan={2}>Total</TableCell>
					<TableCell className="font-semibold">{totals.totalDisbursed.toLocaleString()}</TableCell>
					<TableCell className="font-semibold">{totals.totalRecovered.toLocaleString()}</TableCell>
					<TableCell className="font-semibold">{totals.totalDue.toLocaleString()}</TableCell>
					<TableCell colSpan={isAdmin ? 2 : 1} />
				</TableRow>
			</TableFooter>

			{/* Pagination rendered inside Suspense boundary alongside data */}
			<PaginationRow pagination={pagination} />
		</>
	);
}

function PaginationRow({ pagination }: { pagination: ReturnType<typeof buildPaginationProxy> }) {
	// PaginationPart expects data (totalCount) and item (page size)
	return (
		<tfoot>
			<tr>
				<td colSpan={7}>
					<div className="flex justify-center py-2">
						<Pagination
							currentPage={pagination.currentPage}
							totalPages={pagination.totalPages}
							hasNext={pagination.hasNext}
							hasPrev={pagination.hasPrev}
						/>
					</div>
				</td>
			</tr>
		</tfoot>
	);
}

// Dummy type helper — remove if PaginatedResult is imported
function buildPaginationProxy() {
	return { currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrev: false };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BorrowersPage({
	searchParams,
}: {
	searchParams?: SearchParams;
}) {
	return (
		<div className="flex flex-col">
			<div className="flex flex-row justify-between p-2">
				<Button asChild>
					<Link className="bg-color-main hover:bg-color-sub" href="borrowers/create">
						Borrowers Create
					</Link>
				</Button>
				<Suspense fallback={<div className="w-48 h-9 bg-muted animate-pulse rounded-md" />}>
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
						<TableHead>DELETE</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense
					fallback={
						<TableBody>
							{Array.from({ length: 10 }).map((_, i) => (
								<TableRow key={i}>
									{Array.from({ length: 7 }).map((_, j) => (
										<TableCell key={j}>
											<div className="h-4 bg-muted animate-pulse rounded" />
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					}
				>
					<BorrowersList searchParams={searchParams} />
				</Suspense>
			</Table>
		</div>
	);
}