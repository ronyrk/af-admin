// app/borrowers/page.tsx
import React, { Suspense } from "react";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ClipboardPenLine } from "lucide-react";
import SearchBox from "@/components/SearchBox";
// BUG FIX: import LoanWithStats so enriched rows are correctly typed
import { getSearchBorrowers, type LoanWithStats } from "@/lib/SearchBorrowers";
import { verifyToken } from "@/lib/auth";
import DeleteButton from "@/components/DeleteButton";
import Pagination from "@/components/beneficial-pagination";

type SearchParams = { search?: string; page?: string };

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
			president: { name: string; phone: string; address: string; occupation: string };
			imam: { name: string; phone: string; address: string; occupation: string };
			secretary: { name: string; phone: string; address: string; occupation: string };
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
				lending: number;
				refund: number;
				donorDonate: number;
				leanderDonate: number;
				totalDonate: number;
				outstanding: number;
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

async function getFooterTotals() {
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

async function getBranchSummary(token: string): Promise<ApiResponse | null> {
	try {
		const response = await fetch(
			"https://af-admin.vercel.app/api/branch/all-in-one",
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
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

async function BorrowersList({
	searchParams,
	token,
	isAdmin,
	// BUG FIX: accept the already-verified payload from the page so we don't
	// call verifyToken a second time inside this component
	payload,
}: {
	searchParams?: SearchParams;
	token: string;
	isAdmin: boolean;
	payload: { username: string; role: string } | null;
}) {
	const query = searchParams?.search ?? "all";
	const page = searchParams?.page ?? "1";

	// Stats are pre-attached by getSearchBorrowers — no separate stats call needed
	const { data: borrowers, pagination } = await getSearchBorrowers(
		query,
		page,
		payload
	);

	const [totals, branchSummary] = await Promise.all([
		isAdmin ? getFooterTotals() : Promise.resolve(null),
		!isAdmin ? getBranchSummary(token) : Promise.resolve(null),
	]);

	const footerDisbursed = isAdmin
		? totals!.totalDisbursed.toLocaleString()
		: branchSummary?.data.summary.borrowers.totalDisbursed?.toLocaleString() ?? "—";

	const footerRecovered = isAdmin
		? totals!.totalRecovered.toLocaleString()
		: branchSummary?.data.summary.borrowers.totalRecovered?.toLocaleString() ?? "—";

	const footerDue = isAdmin
		? totals!.totalDue.toLocaleString()
		: branchSummary?.data.summary.borrowers.totalBalance?.toLocaleString() ?? "—";

	// BUG FIX: total data columns = 5 data + 1 details + (1 delete if admin)
	const colSpan = isAdmin ? 7 : 6;

	return (
		<>
			<TableBody>
				{borrowers.map((item: LoanWithStats) => (
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

				{borrowers.length === 0 && (
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
					{/* BUG FIX: colSpan 2 covers CODE + NAME columns correctly */}
					<TableCell className="font-semibold" colSpan={2}>
						Total
					</TableCell>
					<TableCell className="font-semibold">{footerDisbursed}</TableCell>
					<TableCell className="font-semibold">{footerRecovered}</TableCell>
					<TableCell className="font-semibold">{footerDue}</TableCell>
					{/* BUG FIX: always 1 for Details; add a second empty cell if admin for Delete */}
					<TableCell />
					{isAdmin && <TableCell />}
				</TableRow>
			</TableFooter>

			<TableCaption>
				<div className="flex justify-center py-2">
					<Pagination
						currentPage={pagination.currentPage}
						totalPages={pagination.totalPages}
						hasNext={pagination.hasNext}
						hasPrev={pagination.hasPrev}
					/>
				</div>
			</TableCaption>
		</>
	);
}

export default async function BorrowersPage({
	searchParams,
}: {
	searchParams?: SearchParams;
}) {
	const token = cookies().get("auth")?.value ?? "";
	// BUG FIX: verify once here, pass result down — BorrowersList no longer re-verifies
	const payload = (await verifyToken(token)) as {
		username: string;
		role: string;
	} | null;
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
						<TableHead>Code</TableHead>
						<TableHead className="w-[300px]">Borrowers name</TableHead>
						<TableHead>Disbursed</TableHead>
						<TableHead>Recovered</TableHead>
						<TableHead>Balance</TableHead>
						<TableHead>Details</TableHead>
						{isAdmin && <TableHead>Delete</TableHead>}
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
					<BorrowersList
						searchParams={searchParams}
						token={token}
						isAdmin={isAdmin}
						payload={payload}
					/>
				</Suspense>
			</Table>
		</div>
	);
}