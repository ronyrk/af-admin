import React, { Suspense } from 'react'
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
import { LoanIProps, PaymentIProps } from '@/types';
import { cookies } from 'next/headers';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/components/DeleteButton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { ClipboardPenLine } from 'lucide-react';
import PaginationPart from '@/components/Pagination';
import { getBorrowers } from '@/lib/getBorrowers';
import SearchBox from '@/components/SearchBox';
import { getSearchBorrowers } from '@/lib/SearchBorrowers';
import { unstable_noStore } from 'next/cache';

function SearchBarFallback() {
	return <>placeholder</>
}

async function getUser(username: string) {
	cookies();
	const res = await fetch(`https://af-admin.vercel.app/api/loan/${username}`);
	if (!res.ok) {
		throw new Error("Failed to fetch data user");
	};
	return res.json();
};

async function duePayment(username: string, balance: string): Promise<number> {
	// Fetch payment data for the borrower
	unstable_noStore();
	const response = await fetch(`https://af-admin.vercel.app/api/loan_list/${username}`);
	if (!response.ok) {
		throw new Error("Failed to fetch data due payment");
	}
	const paymentList: PaymentIProps[] = await response.json();
	const totalDisbursed = paymentList.reduce((total, item) => total + Number(item.loanAmount), Number(balance));
	const totalPayment = paymentList.reduce((total, item) => total + Number(item.amount), 0);
	const due = totalDisbursed - totalPayment;
	return due > 0 ? due : 0;

}

async function allPayment(username: string): Promise<number> {
	unstable_noStore();
	const response = await fetch(`https://af-admin.vercel.app/api/loan_list/${username}`);
	if (!response.ok) {
		throw new Error("Failed to fetch all payment data");
	}
	const paymentList: PaymentIProps[] = await response.json();

	// Use reduce directly to calculate the total amount
	return paymentList.reduce((total, item) => total + Number(item.amount), 0);
}
const TotalDisbursed = async (username: string, balance: string): Promise<number> => {
	unstable_noStore();
	const response = await fetch(`https://af-admin.vercel.app/api/loan_list/${username}`);
	if (!response.ok) {
		throw new Error("Failed to fetch data all payment");
	}
	const paymentList: PaymentIProps[] = await response.json();


	return paymentList.reduce((total, item) => total + Number(item.loanAmount), Number(balance));
}

const TotalDisbursedAmount = async () => {
	cookies();
	const paymentList: PaymentIProps[] = await prisma.payment.findMany();
	let indexPaymentString: string[] = ["0"];
	const result = paymentList.forEach((item) => indexPaymentString.push(item.loanAmount));
	let indexPayment = indexPaymentString.map(Number);
	const loanSumAmount = indexPayment.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
	return `${loanSumAmount}`;
}
async function AllPaymentAmount() {
	cookies();
	const paymentList: PaymentIProps[] = await prisma.payment.findMany();
	let indexPaymentString: string[] = ["0"];
	const result = paymentList.forEach((item) => indexPaymentString.push(item.amount));
	let indexPayment = indexPaymentString.map(Number);
	const Amount = indexPayment.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
	return `${Amount}`;

}
async function DuePaymentAmount() {
	cookies();
	// Loan Amount
	const paymentList: PaymentIProps[] = await prisma.payment.findMany();
	let indexPaymentString: string[] = ["0"];
	const result = paymentList.forEach((item) => indexPaymentString.push(item.loanAmount));
	let indexPayment = indexPaymentString.map(Number);
	const loanSumAmount = indexPayment.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

	// Payment Amount
	let indexPaymentString2: string[] = ["0"];
	const result2 = paymentList.forEach((item) => indexPaymentString2.push(item.amount));
	let indexPayment2 = indexPaymentString2.map(Number);
	const PaymentAmount = indexPayment2.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

	return `${loanSumAmount - PaymentAmount}`
}


async function BorrowersList({ searchParams }: {
	searchParams?: {
		search?: string,
		page?: string,
	}
}) {
	const query = searchParams?.search || "all";
	const page = searchParams?.page || "1";
	const borrowers = await getSearchBorrowers(query, page);
	const pageSize = 10; // Number of items per page
	const start = (Number(page) - 1) * pageSize;
	const end = start + pageSize;

	// Sort borrowers by (TotalDisbursed - allPayment) in descending order
	const sortedBorrowers = await Promise.all(
		borrowers.map(async (borrower) => {
			const totalDisbursed = await TotalDisbursed(borrower.username, borrower.balance);
			const allPayments = await allPayment(borrower.username);
			const balanceDifference = totalDisbursed - allPayments;

			return {
				...borrower,
				balanceDifference,
			};
		})
	);


	// Sort by balanceDifference: positive values first, then zero, then negative
	sortedBorrowers.sort((a, b) => b.balanceDifference - a.balanceDifference);

	return (
		<>
			<TableBody>
				{
					sortedBorrowers.slice(start, end).map((item, index: number) => (
						<TableRow key={index}>
							<TableCell className="font-medium">{item.code}</TableCell>
							<TableCell className="font-medium uppercase">{item.name}</TableCell>
							<TableCell className="font-medium uppercase" >{TotalDisbursed(item.username, item.balance)}</TableCell>
							<TableCell className="font-medium uppercase">{allPayment(item?.username)}</TableCell>
							<TableCell className="font-medium uppercase">{duePayment(item?.username, item.balance)}</TableCell>
							<TableCell className="font-medium uppercase">
								<Button className='bg-color-main' variant={"outline"} size={"sm"} asChild>
									<Link href={`borrowers/${item.username}`}><ClipboardPenLine /></Link>
								</Button>
							</TableCell>
							<TableCell className="font-medium uppercase">
								<DeleteButton type='loan' username={item.username} />
							</TableCell>
						</TableRow>
					))
				}
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell className=" font-semibold" colSpan={2}>Total</TableCell>
					<TableCell className="font-semibold">{TotalDisbursedAmount()}</TableCell>
					<TableCell className="font-semibold">{AllPaymentAmount()}</TableCell>
					<TableCell className="font-semibold">{DuePaymentAmount()}</TableCell>
				</TableRow>
			</TableFooter>
		</>
	)
};



async function page(
	{ searchParams }: {
		searchParams?: {
			search?: string,
			page?: string,
		}
	}
) {
	const query = searchParams?.search || "all";
	const pageNumber = await getBorrowers(query);
	const length = pageNumber?.length;

	return (
		<div className='flex flex-col'>

			<div className="flex flex-row justify-between p-2 ">
				<Button asChild>
					<Link className=' bg-color-main hover:bg-color-sub' href={`borrowers/create`}>Borrowers Create</Link>
				</Button>
				<Suspense fallback={<SearchBarFallback />}>
					<SearchBox />
				</Suspense>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>CODE</TableHead>
						<TableHead className='w-[300px]'>BORROWERS NAME</TableHead>
						<TableHead>DISBURSED</TableHead>
						<TableHead>RECOVERED</TableHead>
						<TableHead>BALANCE</TableHead>
						<TableHead>UPDATED</TableHead>
						<TableHead>DELETE</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense fallback={<h2 className='p-4 text-center '>Loading...</h2>} >
					<BorrowersList searchParams={searchParams} />
				</Suspense>
			</Table>
			<div className="flex justify-center py-2">
				<PaginationPart item={10} data={length} />
			</div>

		</div>
	)
}

export default page