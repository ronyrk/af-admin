import React from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import Image from 'next/image';
import icon from "../../../public/divider.svg";
import { filterAndSortDonors } from '@/lib/fillterAndSortDonors';
import { ChildDonateRequestProps, DonorPaymentIProps, PaymentApproveIProps } from '@/types';
import { getDonorName } from '@/lib/getDonorName';
import { GetBranchDetails } from '@/lib/getBranchList';
import Link from 'next/link';

const TotalOutstanding = async (): Promise<string> => {
	// Ensure cookies are processed (likely for authentication or session validation).
	cookies();

	// Fetch all donor payment records from the database.
	const paymentList = await prisma.donorPayment.findMany();

	const loanList = await prisma.payment.findMany();

	const totalLoan = loanList.reduce((sum, item) => sum + Number(item.amount || 0), 0);
	const totalLoanPayment = loanList.reduce((sum, item) => sum + Number(item.loanAmount || 0), 0);

	const totalLoanRefund = totalLoanPayment - totalLoan;

	// Calculate total DONATE amount.
	const donate = paymentList
		.filter((item) => item.type === "DONATE")
		.reduce((sum, item) => sum + Number(item.donate || 0), 0);

	// Calculate total LENDING amount.
	const totalLending = paymentList
		.filter((item) => item.type === "LENDING")
		.reduce((sum, item) => sum + Number(item.amount || 0), 0);

	// Calculate total REFOUND payments.
	const totalRefund = paymentList
		.filter((item) => item.type === "REFOUND")
		.reduce((sum, item) => sum + Number(item.loanPayment || 0), 0);

	// Calculate total DONATE amount for non-DONOR status.
	const totalDonate = paymentList
		.filter((item) => item.type === "DONATE" && item.status !== "DONOR")
		.reduce((sum, item) => sum + Number(item.donate || 0), 0);

	// Calculate the total outstanding amount.
	const result = totalLending - (totalRefund + totalDonate);
	const totalAmount = (result + donate) - totalLoanRefund;

	// Format the result for readability.
	const formattedResult = new Intl.NumberFormat("en-BN", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(totalAmount);

	// Return the formatted result with "/=" appended.
	return `BDT=${formattedResult}/=`;
};


async function page() {
	cookies();
	const skips = 45;
	const list = await prisma.donorPayment.findMany() as DonorPaymentIProps[];

	const updatedList = list.map(item => ({ ...item, upComing: false }));
	const upComing = filterAndSortDonors(updatedList, skips, true);

	const res = await fetch('https://af-admin.vercel.app/api/request');
	if (!res.ok) {
		throw new Error("Failed to fetch data");
	};
	const payments: PaymentApproveIProps[] = await res.json();

	let response = await fetch('https://af-admin.vercel.app/api/donation-request');
	if (!response.ok) {
		throw new Error("Failed to fetch data list");
	};
	const childRequest: ChildDonateRequestProps[] = await response.json();

	return (
		<div className=''>
			<div className="p-2 bg-white">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Fund Summary Panel */}
					<Link href="/dashboard" className="cursor-pointer">
						<div className="border border-gray-300 rounded shadow-sm">
							<div className="bg-[#2d2150] text-white font-semibold py-2 px-4 text-center">Our Fund Summary</div>
							<div className="p-0">
								<div className="border-b border-orange-300 mx-4 my-1 h-[2px]"></div>
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
											<td className="text-right py-2 px-4">{TotalOutstanding()}</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</Link>

					{/* Upcoming Money Refund Panel */}
					<Link href="/dashboard/up-coming" className="cursor-pointer">
						<div className="border border-gray-300 rounded shadow-sm">
							<div className="bg-[#2d2150] text-white font-semibold py-2 px-4 text-center">Upcoming money refund</div>
							<div className="p-0">
								<table className="w-full">
									<thead>
										<tr className="border-b">
											<th className="text-left py-2 px-4">NAME</th>
											<th className="text-right py-2 px-4">AMOUNT</th>
										</tr>
									</thead>
									<tbody>
										{upComing.slice(0, 3).map((item, index: number) => (
											<tr key={index} className={`${index % 2 === 0 ? "bg-gray-200" : "bg-gray-100"}`}>
												<td className="py-2 px-4">{getDonorName(item.donorUsername)}</td>
												<td className="text-right py-2 px-4">{item.amount}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</Link>

					{/* Borrowers Payment Request List Panel */}
					<Link href="/dashboard/pending" className="cursor-pointer">
						<div className="border border-gray-300 rounded shadow-sm">
							<div className="bg-[#2d2150] text-white font-semibold py-2 px-4 text-center">Borrowers Payment Request List</div>
							<div className="p-0">
								<table className="w-full">
									<thead>
										<tr className="border-b">
											<th className="text-left py-2 px-4">NAME</th>
											<th className="text-right py-2 px-4">AMOUNT</th>
										</tr>
									</thead>
									<tbody>
										{
											payments.slice(0, 4).map((item, index: number) => (
												<tr key={index} className={`${index % 2 === 0 ? "bg-gray-200" : "bg-gray-100"}`}>
													<td className="py-2 px-4">{GetBranchDetails(item.loanusername)}</td>
													<td className="text-right py-2 px-4">{item.amount}</td>
												</tr>
											))
										}
									</tbody>
								</table>
							</div>
						</div>
					</Link>


					{/* Chadid Donation Request List Panel */}

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
										{
											childRequest.map((item, index: number) => (
												<tr key={index} className={`${index % 2 === 0 ? "bg-gray-200" : "bg-gray-100"}`}>
													<td className="py-2 px-4">{item.childName}</td>
													<td className="text-right py-2 px-4">{item.amount}</td>
												</tr>
											))
										}
									</tbody>
								</table>
							</div>
						</div>

					</Link>
					{/* Karje hasana Request List Panel */}
					<div className="border border-gray-300 rounded shadow-sm md:col-span-2">
						<div className="bg-[#2d2150] text-white font-semibold py-2 px-4 text-center">Karje hasana Request List</div>
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
									<tr className="bg-gray-200">
										<td className="py-2 px-4">Arif Hossain</td>
										<td className="text-right py-2 px-4">29670</td>
									</tr>
									<tr className="bg-gray-100">
										<td className="py-2 px-4">Arif Hossain</td>
										<td className="text-right py-2 px-4">29670</td>
									</tr>
									<tr className="bg-gray-200">
										<td className="py-2 px-4">Arif Hossain</td>
										<td className="text-right py-2 px-4">29670</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

		</div>
	)
}

export default page