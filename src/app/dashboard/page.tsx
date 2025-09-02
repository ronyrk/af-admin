import React from 'react'
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { filterAndSortDonors } from '@/lib/fillterAndSortDonors';
import {
	BeneficialTransactionIProps,
	ChildDonateRequestProps,
	DonorPaymentIProps,
	DonorRequestIProps,
	PaymentApproveIProps,
	TotalsIProps
} from '@/types';
import { GetBranchDetails } from '@/lib/getBranchList';
import Link from 'next/link';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://af-admin.vercel.app';

const calculateTotals = (transactions: BeneficialTransactionIProps[]): TotalsIProps => {
	if (!transactions?.length) {
		return { totalDonate: 0, totalSpend: 0, totalBalance: 0 };
	}

	// Single pass calculation for better performance
	const totals = transactions.reduce(
		(acc, item) => {
			const amount = Number(item.amount) || 0;
			if (item?.paymentType === 'donate') {
				acc.totalDonate += amount;
			} else if (item?.paymentType === 'spend') {
				acc.totalSpend += amount;
			}
			return acc;
		},
		{ totalDonate: 0, totalSpend: 0, totalBalance: 0 }
	);

	totals.totalBalance = totals.totalDonate - totals.totalSpend;
	return totals;
};

const formatCurrency = (amount: number): string => {
	return new Intl.NumberFormat('en-BD', {
		style: 'currency',
		currency: 'BDT',
		minimumFractionDigits: 2
	}).format(amount);
};

// Memoized donor name cache to reduce API calls
const donorNameCache = new Map<string, string>();

async function getDonorName(donorUsername: string): Promise<string> {
	// Check cache first
	if (donorNameCache.has(donorUsername)) {
		return donorNameCache.get(donorUsername)!;
	}

	try {
		const res = await fetch(`${BASE_URL}/api/donor/${donorUsername}`, {
			next: { revalidate: 0 } // Cache for 5 minutes
		});

		if (!res.ok) {
			console.error(`Failed to fetch donor ${donorUsername}: ${res.status}`);
			return 'Unknown Donor';
		}

		const donor: DonorRequestIProps = await res.json();
		const name = donor.name || 'Unknown Donor';

		// Cache the result
		donorNameCache.set(donorUsername, name);
		return name;
	} catch (error) {
		console.error(`Error fetching donor name for ${donorUsername}:`, error);
		return 'Unknown Donor';
	}
}

const calculateTotalOutstanding = async (): Promise<number> => {
	try {
		// Fetch all required data in parallel for better performance
		const [paymentList, loanList] = await Promise.all([
			prisma.donorPayment.findMany(),
			prisma.payment.findMany()
		]);

		// Calculate loan totals
		const totalLoan = loanList.reduce((sum, item) => sum + Number(item.amount || 0), 0);
		const totalLoanPayment = loanList.reduce((sum, item) => sum + Number(item.loanAmount || 0), 0);
		const totalLoanRefund = totalLoanPayment - totalLoan;

		// Calculate payment totals using more efficient filtering
		const totals = paymentList.reduce((acc, item) => {
			const amount = Number(item.amount || 0);
			const donate = Number(item.donate || 0);
			const loanPayment = Number(item.loanPayment || 0);

			switch (item.type) {
				case "DONATE":
					acc.donate += donate;
					if (item.status !== "DONOR") {
						acc.totalDonate += donate;
					}
					break;
				case "LENDING":
					acc.totalLending += amount;
					break;
				case "REFOUND":
					acc.totalRefund += loanPayment;
					break;
			}
			return acc;
		}, {
			donate: 0,
			totalDonate: 0,
			totalLending: 0,
			totalRefund: 0
		});

		// Calculate final result
		const result = totals.totalLending - (totals.totalRefund + totals.totalDonate);
		const totalAmount = (result + totals.donate) - totalLoanRefund;

		return totalAmount;
	} catch (error) {
		console.error('Error calculating total outstanding:', error);
		return 0;
	}
};

// Fetch function with proper error handling
async function fetchWithErrorHandling<T>(url: string, errorMessage: string): Promise<T[]> {
	try {
		const res = await fetch(url, {
			next: { revalidate: 0 } // Cache for 1 minute
		});

		if (!res.ok) {
			throw new Error(`${errorMessage}: ${res.status}`);
		}

		return await res.json();
	} catch (error) {
		console.error(errorMessage, error);
		return [];
	}
}

export default async function DashboardPage() {
	try {
		// Ensure cookies are processed
		cookies();

		const skips = 45;

		// Fetch all data in parallel for better performance
		const [
			donorPaymentList,
			payments,
			childRequest,
			request,
			paymentRequest,
			transactions,
			totalOutstanding
		] = await Promise.all([
			prisma.donorPayment.findMany(),
			fetchWithErrorHandling<PaymentApproveIProps>(`${BASE_URL}/api/request`, 'Failed to fetch payments'),
			fetchWithErrorHandling<ChildDonateRequestProps>(`${BASE_URL}/api/donation-request`, 'Failed to fetch child requests'),
			prisma.donor_request.findMany(),
			prisma.donor_payment_request.findMany(),
			fetchWithErrorHandling<BeneficialTransactionIProps>(`${BASE_URL}/api/beneficial/transaction`, 'Failed to fetch transactions'),
			calculateTotalOutstanding()
		]);

		const upComing = filterAndSortDonors(donorPaymentList as any, skips, true);
		const totals = calculateTotals(transactions);
		const currentBalance = totals.totalBalance + totalOutstanding;

		// Pre-fetch donor names for better UX
		const upcomingDonorNames = await Promise.all(
			upComing.slice(0, 4).map(item => getDonorName(item.donorUsername))
		);

		const paymentRequestDonorNames = await Promise.all(
			paymentRequest.map(item => getDonorName(item.username))
		);

		return (
			<div className=''>
				<div className="p-2 bg-white">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Fund Summary Panel */}
						<Link href="/dashboard" className="cursor-pointer">
							<div className="border border-gray-300 rounded shadow-sm">
								<div className="bg-[#2d2150] text-white font-semibold py-2 px-4 text-center">
									Our Fund Summary
								</div>
								<div className="p-0">
									<table className="w-full">
										<thead>
											<tr className="border-b">
												<th className="text-left py-2 px-4">Categories</th>
												<th className="text-right py-2 px-4">Available balance</th>
											</tr>
										</thead>
										<tbody>
											<tr className="bg-gray-200">
												<td className="py-2 px-4">কর্জে হাসনা</td>
												<td className="text-right py-2 px-4">{formatCurrency(totalOutstanding)}</td>
											</tr>
											<tr className="bg-gray-100">
												<td className="py-2 px-4">উপকারী</td>
												<td className="text-right py-2 px-4">{formatCurrency(totals.totalBalance)}</td>
											</tr>
											<tr className="bg-gray-200 font-semibold">
												<td className="py-2 px-4">Total</td>
												<td className="text-right py-2 px-4">{formatCurrency(currentBalance)}</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</Link>

						{/* Upcoming Money Refund Panel */}
						<Link href="/dashboard/up-coming" className="cursor-pointer">
							<div className="border border-gray-300 rounded shadow-sm">
								<div className="bg-[#2d2150] text-white font-semibold py-2 px-4 text-center">
									Upcoming money refund
								</div>
								<div className="p-0">
									<table className="w-full">
										<thead>
											<tr className="border-b">
												<th className="text-left py-2 px-4">NAME</th>
												<th className="text-right py-2 px-4">AMOUNT</th>
											</tr>
										</thead>
										<tbody>
											{upComing.slice(0, 4).map((item, index: number) => (
												<tr key={`upcoming-${item.donorUsername}-${index}`} className={`${index % 2 === 0 ? "bg-gray-200" : "bg-gray-100"}`}>
													<td className="py-2 px-4">{upcomingDonorNames[index]}</td>
													<td className="text-right py-2 px-4">{formatCurrency(Number(item.amount) || 0)}</td>
												</tr>
											))}
											{upComing.length === 0 && (
												<tr>
													<td colSpan={2} className="py-4 px-4 text-center text-gray-500">
														No upcoming refunds
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</div>
						</Link>

						{/* Borrowers Payment Request List Panel */}
						<Link href="/dashboard/pending" className="cursor-pointer">
							<div className="border border-gray-300 rounded shadow-sm">
								<div className="bg-[#2d2150] text-white font-semibold py-2 px-4 text-center">
									Borrowers Payment Request List
								</div>
								<div className="p-0">
									<table className="w-full">
										<thead>
											<tr className="border-b">
												<th className="text-left py-2 px-4">NAME</th>
												<th className="text-right py-2 px-4">AMOUNT</th>
											</tr>
										</thead>
										<tbody>
											{payments.slice(0, 4).map((item, index: number) => (
												<tr key={`payment-${item.loanusername}-${index}`} className={`${index % 2 === 0 ? "bg-gray-200" : "bg-gray-100"}`}>
													<td className="py-2 px-4">{GetBranchDetails(item.loanusername)}</td>
													<td className="text-right py-2 px-4">{formatCurrency(Number(item.amount) || 0)}</td>
												</tr>
											))}
											{payments.length === 0 && (
												<tr>
													<td colSpan={2} className="py-4 px-4 text-center text-gray-500">
														No payment requests
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</div>
						</Link>

						{/* Child Donation Request List Panel */}
						<Link href="/dashboard/child/pending" className="cursor-pointer">
							<div className="border border-gray-300 rounded shadow-sm">
								<div className="bg-[#2d2150] text-white font-semibold py-2 px-4 text-center">
									Child Donation Request List
								</div>
								<div className="p-0">
									<table className="w-full">
										<thead>
											<tr className="border-b">
												<th className="text-left py-2 px-4">NAME</th>
												<th className="text-right py-2 px-4">AMOUNT</th>
											</tr>
										</thead>
										<tbody>
											{childRequest.slice(0, 4).map((item, index: number) => (
												<tr key={`child-${item.childName}-${index}`} className={`${index % 2 === 0 ? "bg-gray-200" : "bg-gray-100"}`}>
													<td className="py-2 px-4">{item.childName}</td>
													<td className="text-right py-2 px-4">{formatCurrency(Number(item.amount) || 0)}</td>
												</tr>
											))}
											{childRequest.length === 0 && (
												<tr>
													<td colSpan={2} className="py-4 px-4 text-center text-gray-500">
														No child donation requests
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</div>
						</Link>

						{/* New Donor Request List Panel */}
						<Link href="/dashboard/donor/request" className="cursor-pointer">
							<div className="border border-gray-300 rounded shadow-sm md:col-span-2">
								<div className="bg-[#2d2150] text-white font-semibold py-2 px-4 text-center">
									New Donor Request List
								</div>
								<div className="p-0">
									<div className="border-b border-orange-300 mx-4 my-1 h-[2px]"></div>
									<table className="w-full">
										<thead>
											<tr className="border-b">
												<th className="text-left py-2 px-4">NAME</th>
												<th className="text-right py-2 px-4">AMOUNT</th>
											</tr>
										</thead>
										<tbody>
											{request.map((item, index: number) => (
												<tr key={`donor-request-${item.name}-${index}`} className={`${index % 2 === 0 ? "bg-gray-200" : "bg-gray-100"}`}>
													<td className="py-2 px-4">{item.name}</td>
													<td className="text-right py-2 px-4">{formatCurrency(Number(item.amount) || 0)}</td>
												</tr>
											))}
											{request.length === 0 && (
												<tr>
													<td colSpan={2} className="py-4 px-4 text-center text-gray-500">
														No new donor requests
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</div>
						</Link>

						{/* Old Donor Payment Request List Panel */}
						<Link href="/dashboard/donor/payment-request" className="cursor-pointer">
							<div className="border border-gray-300 rounded shadow-sm md:col-span-2">
								<div className="bg-[#2d2150] text-white font-semibold py-2 px-4 text-center">
									Old Donor Payment Request List
								</div>
								<div className="p-0">
									<div className="border-b border-orange-300 mx-4 my-1 h-[2px]"></div>
									<table className="w-full">
										<thead>
											<tr className="border-b">
												<th className="text-left py-2 px-4">NAME</th>
												<th className="text-right py-2 px-4">AMOUNT</th>
											</tr>
										</thead>
										<tbody>
											{paymentRequest.map((item, index: number) => (
												<tr key={`payment-request-${item.username}-${index}`} className={`${index % 2 === 0 ? "bg-gray-200" : "bg-gray-100"}`}>
													<td className="py-2 px-4">{paymentRequestDonorNames[index]}</td>
													<td className="text-right py-2 px-4">{formatCurrency(Number(item.amount) || 0)}</td>
												</tr>
											))}
											{paymentRequest.length === 0 && (
												<tr>
													<td colSpan={2} className="py-4 px-4 text-center text-gray-500">
														No payment requests
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</div>
						</Link>
					</div>
				</div>
			</div>
		);
	} catch (error) {
		console.error('Dashboard error:', error);
		return (
			<div className="p-4 bg-red-50 border border-red-200 rounded">
				<h2 className="text-red-800 font-semibold">Error Loading Dashboard</h2>
				<p className="text-red-600">Please try refreshing the page.</p>
			</div>
		);
	}
}