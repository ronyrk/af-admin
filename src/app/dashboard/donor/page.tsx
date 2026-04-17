import React, { Suspense } from "react";
import {
	Table, TableBody, TableCell, TableFooter,
	TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ClipboardPenLine } from "lucide-react";
import SearchBox from "@/components/SearchBox";
import { getSearchDonor } from "@/lib/getSearchDonor";
import { verifyToken } from "@/lib/auth";
import DeleteButton from "@/components/DeleteButton";
import Pagination from "@/components/beneficial-pagination";
import { DonorIProps } from "@/types";
import { UserPayload } from "@/lib/SearchBorrowers";

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchParams = { search?: string; page?: string };

type DonorStats = {
	totalLending: number;
	totalRefund: number;
	totalDonate: number;
	outstanding: number;
};

type DonorWithStats = DonorIProps & DonorStats;

type FooterTotals = {
	totalAmount: number;
	totalRefund: number;
	totalDonate: number;
	totalOutstanding: number;
};

// ─── Data Fetching ────────────────────────────────────────────────────────────

/**
 * Single query for all donor payment stats for a given set of usernames.
 * Replaces N per-row DB calls (TotalLending, TotalRefound, Donate, Outstanding)
 * with one batched query + JS aggregation.
 */
async function getDonorStats(
	usernames: string[]
): Promise<Map<string, DonorStats>> {
	if (usernames.length === 0) return new Map();

	const payments = await prisma.donorPayment.findMany({
		where: { donorUsername: { in: usernames } },
		select: {
			donorUsername: true,
			type: true,
			status: true,
			amount: true,
			donate: true,
			loanPayment: true,
		},
	});

	// Accumulate per-donor
	const raw = new Map<
		string,
		{ lending: number; refund: number; donate: number }
	>();

	for (const p of payments) {
		const acc = raw.get(p.donorUsername) ?? { lending: 0, refund: 0, donate: 0 };

		if (p.type === "LENDING") {
			acc.lending += Number(p.amount ?? 0);
		}
		if (p.type === "REFOUND") {
			acc.refund += Number(p.loanPayment ?? 0);
		}
		if (p.type === "DONATE") {
			acc.donate += Number(p.donate ?? 0);
		}

		raw.set(p.donorUsername, acc);
	}

	// Derive per-donor stats matching original business logic
	const statsMap = new Map<string, DonorStats>();

	// FIX: Use Array.from() to avoid IterableIterator downlevelIteration error
	for (const [username, acc] of Array.from(raw.entries())) {
		statsMap.set(username, {
			totalLending: acc.lending,
			totalRefund: acc.refund,
			totalDonate: acc.donate,
			// outstanding = lending - refund - donate (mirrors Outstanding fn)
			outstanding: Math.max(0, acc.lending - acc.refund - acc.donate),
		});
	}

	return statsMap;
}

/**
 * Single pass over all donorPayments for footer totals.
 * Replaces 4 independent full-table scans.
 */
async function getFooterTotals(): Promise<FooterTotals> {
	const payments = await prisma.donorPayment.findMany({
		select: {
			type: true,
			status: true,
			amount: true,
			donate: true,
			loanPayment: true,
		},
	});

	let totalLending = 0;
	let totalRefund = 0;
	let totalDonate = 0;
	let donorOnlyDonate = 0; // used for outstanding calc

	for (const p of payments) {
		if (p.type === "LENDING") totalLending += Number(p.amount ?? 0);
		if (p.type === "REFOUND") totalRefund += Number(p.loanPayment ?? 0);
		if (p.type === "DONATE") {
			totalDonate += Number(p.donate ?? 0);
			if (p.status === "DONOR") donorOnlyDonate += Number(p.donate ?? 0);
		}
	}

	// TotalAmount = LENDING + DONOR-status donations (mirrors original TotalAmount)
	const totalAmount = totalLending + donorOnlyDonate;

	// Outstanding = LENDING - REFOUND payments - non-DONOR donations (mirrors TotalOutstanding)
	const totalOutstanding = Math.max(
		0,
		totalLending - totalRefund - (totalDonate - donorOnlyDonate)
	);

	return { totalAmount, totalRefund, totalDonate, totalOutstanding };
}

// ─── DonorList (async server component) ──────────────────────────────────────

async function DonorList({ searchParams, payload, isAdmin }: { searchParams?: SearchParams; payload: UserPayload | null; isAdmin: boolean }) {
	const query = searchParams?.search || "all";
	const page = searchParams?.page || "1";



	// 1. Paginated donors (now role-aware)
	const { data: donors, pagination } = await getSearchDonor(query, page, payload);

	// 2. Parallel: per-page stats + footer totals
	const usernames = donors.map((d) => d.username);

	const [statsMap, totals] = await Promise.all([
		getDonorStats(usernames),
		getFooterTotals(),
	]);

	// 3. Enrich donors
	const enriched: DonorWithStats[] = donors.map((donor) => {
		const stats = statsMap.get(donor.username) ?? {
			totalLending: 0,
			totalRefund: 0,
			totalDonate: 0,
			outstanding: 0,
		};
		// Ensure amount is always a string for DonorIProps compatibility
		return { ...donor, amount: donor.amount ?? "", ...stats };
	});


	function getDisplayStatus(status: string) {
		return status === "LEADER" ? "LENDER" : status;
	}

	return (
		<>
			<TableBody>
				{enriched.map((item) => (
					<TableRow key={item.username}>
						<TableCell className="font-medium">{item.code}</TableCell>
						<TableCell className="font-medium uppercase">{item.name}</TableCell>
						<TableCell className="font-medium uppercase">
							{getDisplayStatus(item.status)}
						</TableCell>
						<TableCell className="font-medium">
							{item.totalLending.toLocaleString()}
						</TableCell>
						<TableCell className="font-medium">
							{item.totalRefund.toLocaleString()}
						</TableCell>
						<TableCell className="font-medium">
							{item.totalDonate.toLocaleString()}
						</TableCell>
						<TableCell className="font-medium">
							{item.outstanding.toLocaleString()}
						</TableCell>
						<TableCell>
							<Button
								className="bg-color-main"
								variant="outline"
								size="sm"
								asChild
							>
								<Link href={`donor/${item.username}`}>
									<ClipboardPenLine />
								</Link>
							</Button>
						</TableCell>
						{isAdmin && (
							<TableCell>
								<DeleteButton type="donor" username={item.username} />
							</TableCell>
						)}
					</TableRow>
				))}

				{enriched.length === 0 && (
					<TableRow>
						<TableCell
							colSpan={isAdmin ? 9 : 8}
							className="text-center py-8 text-muted-foreground"
						>
							No donors found.
						</TableCell>
					</TableRow>
				)}
			</TableBody>

			<TableFooter>
				<TableRow>
					<TableCell className="font-semibold" colSpan={3}>
						Total
					</TableCell>
					<TableCell className="font-semibold">
						{totals.totalAmount.toLocaleString()}
					</TableCell>
					<TableCell className="font-semibold">
						{totals.totalRefund.toLocaleString()}
					</TableCell>
					<TableCell className="font-semibold">
						{totals.totalDonate.toLocaleString()}
					</TableCell>
					<TableCell className="font-semibold">
						{totals.totalOutstanding.toLocaleString()}
					</TableCell>
					<TableCell colSpan={2} />
				</TableRow>
			</TableFooter>

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

export default async function DonorPage({ searchParams }: { searchParams?: SearchParams }) {
	// Read token once at page level (matches borrowers pattern)
	const token = cookies().get("auth")?.value ?? "";
	// Get payload from token
	const payload = (await verifyToken(token)) as { username: string; role: string } | null;

	const isAdmin = payload?.role === "admin";


	return (
		<div className="flex flex-col">
			<h2 className="text-xl text-center">Donor List</h2>

			<div className="flex justify-between p-2">
				<Button asChild>
					<Link className="bg-color-main hover:bg-color-sub" href="donor/create">
						Donor Create
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
						<TableHead className="w-[200px]">NAME</TableHead>
						<TableHead>TYPE</TableHead>
						<TableHead className="uppercase">AMOUNT</TableHead>
						<TableHead className="uppercase">REFUND</TableHead>
						<TableHead className="uppercase">DONATE</TableHead>
						<TableHead className="uppercase">OUTSTANDING</TableHead>
						<TableHead>DETAILS</TableHead>
						{isAdmin && <TableHead>DELETE</TableHead>}
					</TableRow>
				</TableHeader>

				<Suspense
					fallback={
						<TableBody>
							{Array.from({ length: 10 }).map((_, i) => (
								<TableRow key={i}>
									{Array.from({ length: 9 }).map((_, j) => (
										<TableCell key={j}>
											<div className="h-4 bg-muted animate-pulse rounded" />
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					}
				>
					<DonorList searchParams={searchParams} isAdmin={isAdmin} payload={payload} />
				</Suspense>
			</Table>
		</div>
	);
}