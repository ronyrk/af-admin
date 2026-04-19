import React from 'react';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import {
	BeneficialTransactionIProps,
	ChildDonateRequestProps,
	DonorPaymentIProps,
	DonorRequestIProps,
	PaymentApproveIProps,
	TotalsIProps,
} from '@/types';
import { GetBranchDetails } from '@/lib/getBranchList';
import Link from 'next/link';
import { verifyToken } from '@/lib/auth';
import { filterAndSortDonors } from '@/lib/fillterAndSortDonors';

// ─── Types ────────────────────────────────────────────────────────────────────

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
			teamLeader: { name: string; phone: string; address: string; occupation: string; photoUrl: string };
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

// ─── Module-level persistent cache (survives hot-reload in dev but never leaks
//     between requests in prod because each serverless invocation is isolated) ─
const donorNameCache = new Map<string, string>();

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://af-admin.vercel.app';

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const formatCurrency = (amount: number): string =>
	new Intl.NumberFormat('en-BD', {
		style: 'currency',
		currency: 'BDT',
		minimumFractionDigits: 2,
	}).format(amount);

const calculateTotals = (transactions: BeneficialTransactionIProps[]): TotalsIProps => {
	if (!transactions?.length) return { totalDonate: 0, totalSpend: 0, totalBalance: 0 };

	let totalDonate = 0;
	let totalSpend = 0;

	for (const item of transactions) {
		const amount = Number(item.amount) || 0;
		if (item.paymentType === 'donate') totalDonate += amount;
		else if (item.paymentType === 'spend') totalSpend += amount;
	}

	return { totalDonate, totalSpend, totalBalance: totalDonate - totalSpend };
};

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function fetchJSON<T>(url: string, label: string): Promise<T[]> {
	try {
		const res = await fetch(url, { next: { revalidate: 0 } });
		if (!res.ok) throw new Error(`${res.status}`);
		return (await res.json()) as T[];
	} catch (err) {
		// console.error(`[fetchJSON] ${label}:`, err);
		return [];
	}
}

/**
 * Batch-resolve donor names, deduplicated.
 * Only fires one network/cache lookup per unique username.
 */
async function batchGetDonorNames(usernames: string[]): Promise<Map<string, string>> {
	// Deduplicate
	const unique = Array.from(new Set(usernames));

	// Split into cached vs uncached
	const uncached = unique.filter((u) => !donorNameCache.has(u));

	// Fetch uncached in parallel
	if (uncached.length > 0) {
		const fetched = await Promise.all(
			uncached.map(async (username) => {
				try {
					const res = await fetch(`${BASE_URL}/api/donor/${username}`, {
						next: { revalidate: 0 },
					});
					if (!res.ok) return [username, 'Unknown Donor'] as const;
					const donor: DonorRequestIProps = await res.json();
					return [username, donor.name || 'Unknown Donor'] as const;
				} catch {
					return [username, 'Unknown Donor'] as const;
				}
			})
		);
		// Populate cache
		for (const [username, name] of fetched) {
			donorNameCache.set(username, name);
		}
	}

	// Build result map for caller
	const result = new Map<string, string>();
	for (const u of usernames) {
		result.set(u, donorNameCache.get(u) ?? 'Unknown Donor');
	}
	return result;
}

async function calculateTotalOutstanding(): Promise<number> {
	try {
		const [paymentList, loanList] = await Promise.all([
			prisma.donorPayment.findMany(),
			prisma.payment.findMany(),
		]);

		// Loan totals
		let totalLoan = 0;
		let totalLoanPayment = 0;
		for (const item of loanList) {
			totalLoan += Number(item.amount || 0);
			totalLoanPayment += Number(item.loanAmount || 0);
		}
		const totalLoanRefund = totalLoanPayment - totalLoan;

		// Payment totals
		let donate = 0;
		let totalDonate = 0;
		let totalLending = 0;
		let totalRefund = 0;

		for (const item of paymentList) {
			const amount = Number(item.amount || 0);
			const donateAmt = Number(item.donate || 0);
			const loanPayment = Number(item.loanPayment || 0);

			if (item.type === 'DONATE') {
				donate += donateAmt;
				if (item.status !== 'DONOR') totalDonate += donateAmt;
			} else if (item.type === 'LENDING') {
				totalLending += amount;
			} else if (item.type === 'REFOUND') {
				totalRefund += loanPayment;
			}
		}

		const result = totalLending - (totalRefund + totalDonate);
		return result + donate - totalLoanRefund;
	} catch (err) {
		// console.error('[calculateTotalOutstanding]:', err);
		return 0;
	}
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
	try {
		const cookieStore = cookies(); // call once
		const token = cookieStore.get('auth')?.value ?? '';

		// All independent data in a single parallel batch
		const [
			donorPaymentList,
			payments,
			childRequest,
			request,
			paymentRequest,
			transactions,
			totalOutstanding,
			payload,
		] = await Promise.all([
			prisma.donorPayment.findMany(),
			fetchJSON<PaymentApproveIProps>(`${BASE_URL}/api/request`, 'payments'),
			fetchJSON<ChildDonateRequestProps>(`${BASE_URL}/api/donation-request`, 'child-requests'),
			prisma.donor_request.findMany(),
			prisma.donor_payment_request.findMany(),
			fetchJSON<BeneficialTransactionIProps>(`${BASE_URL}/api/beneficial/transaction`, 'transactions'),
			calculateTotalOutstanding(),
			verifyToken(token) as Promise<{ username: string; role: string } | null>,
		]);

		const isBranch: boolean = payload?.role === 'branch';

		// Derived values
		const SKIPS = 45;
		const upComing = filterAndSortDonors(donorPaymentList as any, SKIPS, true);
		const totals = calculateTotals(transactions);
		const currentBalance: number = totals.totalBalance + totalOutstanding;

		// Collect all usernames we need, then resolve in ONE batch (deduped)
		const upComingSlice = upComing.slice(0, 4);
		const upcomingUsernames = upComingSlice.map((i: any) => i.donorUsername);
		const payReqUsernames = paymentRequest.map((i: any) => i.username);
		const allUsernames = [...upcomingUsernames, ...payReqUsernames];

		// Pre-resolve GetBranchDetails (handles both sync and async returns)
		const paymentsSlice = payments.slice(0, 4);
		const branchDetails: string[] = await Promise.all(
			paymentsSlice.map((item) => Promise.resolve(GetBranchDetails(item.loanusername)))
		);

		// Fetch branch data + donor names concurrently
		const [donorNames, branchRes] = await Promise.all([
			batchGetDonorNames(allUsernames),
			isBranch
				? fetch('https://af-admin.vercel.app/api/branch/all-in-one', {
					method: 'GET',
					headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				})
				: Promise.resolve(null),
		]);

		const data: ApiResponse | null = branchRes ? await branchRes.json() : null;

		// ─── Render ──────────────────────────────────────────────────────────────

		return (
			<div>
				<div className="p-2 bg-white">
					{isBranch && data ? (
						// ── Branch view ──────────────────────────────────────────────────
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FundSummaryPanel
								rows={[
									{ label: 'DONOR & LENDER', value: data.data.summary.donors.outstanding },
									{ label: 'BORROWERS', value: data.data.summary.borrowers.totalBalance },
								]}
								total={data.data.summary.branch.total}
							/>
						</div>
					) : (
						// ── Admin view ───────────────────────────────────────────────────
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FundSummaryPanel
								rows={[
									{ label: 'কর্জে হাসনা', value: totalOutstanding },
									{ label: 'উপকারী', value: totals.totalBalance },
								]}
								total={currentBalance}
							/>

							{/* Upcoming Money Refund */}
							<TablePanel
								href="/dashboard/up-coming"
								title="Upcoming money refund"
								rows={upComingSlice.map((item: any, i: number) => ({
									key: `${item.donorUsername}-${i}`,
									name: donorNames.get(item.donorUsername) ?? 'Unknown Donor',
									amount: Number(item.amount) || 0,
								}))}
								emptyMessage="No upcoming refunds"
							/>

							{/* Borrowers Payment Request */}
							<TablePanel
								href="/dashboard/pending"
								title="Borrowers Payment Request List"
								rows={paymentsSlice.map((item, i) => ({
									key: `${item.loanusername}-${i}`,
									name: branchDetails[i] ?? 'Unknown',
									amount: Number(item.amount) || 0,
								}))}
								emptyMessage="No payment requests"
							/>

							{/* Child Donation Request */}
							<TablePanel
								href="/dashboard/child/pending"
								title="Child Donation Request List"
								rows={childRequest.slice(0, 4).map((item, i) => ({
									key: `${item.childName}-${i}`,
									name: item.childName,
									amount: Number(item.amount) || 0,
								}))}
								emptyMessage="No child donation requests"
							/>

							{/* New Donor Request */}
							<TablePanel
								href="/dashboard/donor/request"
								title="New Donor Request List"
								spanFull
								rows={request.map((item, i) => ({
									key: `${item.name}-${i}`,
									name: item.name,
									amount: Number(item.amount) || 0,
								}))}
								emptyMessage="No new donor requests"
							/>

							{/* Old Donor Payment Request */}
							<TablePanel
								href="/dashboard/donor/payment-request"
								title="Old Donor Payment Request List"
								spanFull
								rows={paymentRequest.map((item, i) => ({
									key: `${item.username}-${i}`,
									name: donorNames.get(item.username) ?? 'Unknown Donor',
									amount: Number(item.amount) || 0,
								}))}
								emptyMessage="No payment requests"
							/>
						</div>
					)}
				</div>
			</div>
		);
	} catch (err) {
		// console.error('[DashboardPage]:', err);
		return (
			<div className="p-4 bg-red-50 border border-red-200 rounded">
				<h2 className="text-red-800 font-semibold">Error Loading Dashboard</h2>
				<p className="text-red-600">Please try refreshing the page.</p>
			</div>
		);
	}
}

// ─── Shared UI components (no state → zero re-render risk) ────────────────────

interface SummaryRow { label: string; value: number }

function FundSummaryPanel({ rows, total }: { rows: SummaryRow[]; total: number }) {
	return (
		<Link href="/dashboard" className="cursor-pointer">
			<div className="border border-gray-300 rounded shadow-sm">
				<PanelHeader>Our Fund Summary</PanelHeader>
				<table className="w-full">
					<thead>
						<tr className="border-b">
							<th className="text-left  py-2 px-4">Categories</th>
							<th className="text-right py-2 px-4">Amount</th>
						</tr>
					</thead>
					<tbody>
						{rows.map(({ label, value }, i) => (
							<tr key={label} className={i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'}>
								<td className="py-2 px-4">{label}</td>
								<td className="text-right py-2 px-4">{formatCurrency(value)}</td>
							</tr>
						))}
						<tr className="bg-gray-200 font-semibold">
							<td className="py-2 px-4">Available balance</td>
							<td className="text-right py-2 px-4">{formatCurrency(total)}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</Link>
	);
}

interface TableRow { key: string; name: string; amount: number }

function TablePanel({
	href, title, rows, emptyMessage, spanFull,
}: {
	href: string;
	title: string;
	rows: TableRow[];
	emptyMessage: string;
	spanFull?: boolean;
}) {
	return (
		<Link href={href} className={`cursor-pointer${spanFull ? ' md:col-span-2' : ''}`}>
			<div className="border border-gray-300 rounded shadow-sm">
				<PanelHeader>{title}</PanelHeader>
				{spanFull && <div className="border-b border-orange-300 mx-4 my-1 h-[2px]" />}
				<table className="w-full">
					<thead>
						<tr className="border-b">
							<th className="text-left  py-2 px-4">NAME</th>
							<th className="text-right py-2 px-4">AMOUNT</th>
						</tr>
					</thead>
					<tbody>
						{rows.length > 0 ? (
							rows.map(({ key, name, amount }, i) => (
								<tr key={key} className={i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'}>
									<td className="py-2 px-4">{name}</td>
									<td className="text-right py-2 px-4">{formatCurrency(amount)}</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={2} className="py-4 px-4 text-center text-gray-500">
									{emptyMessage}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</Link>
	);
}

function PanelHeader({ children }: { children: React.ReactNode }) {
	return (
		<div className="bg-[#2d2150] text-white font-semibold py-2 px-4 text-center">
			{children}
		</div>
	);
}