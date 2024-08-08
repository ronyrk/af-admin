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

async function getUser(username: string) {
	cookies();
	const res = await fetch(`https://arafatfoundation.vercel.app/api/loan/${username}`);
	if (!res.ok) {
		throw new Error("Failed to fetch data user");
	};
	return res.json();
};

async function duePayment(username: string, balance: string) {
	cookies();
	const response = await fetch(`https://af-admin.vercel.app/api/loan_list/${username}`);
	if (!response.ok) {
		throw new Error("Failed to fetch data due payment");
	}
	const paymentList: PaymentIProps[] = await response.json();

	let indexPaymentString2: string[] = ["0"];
	paymentList.forEach((item) => indexPaymentString2.push(item.loanAmount));
	let indexPayment2 = indexPaymentString2.map(Number);
	const totalBalance = indexPayment2.reduce((accumulator, currentValue) => accumulator + currentValue, Number(balance));

	let indexPaymentString: string[] = ["0"];
	const result = paymentList.forEach((item) => indexPaymentString.push(item.amount));
	let indexPayment = indexPaymentString.map(Number);
	const loanSumAmount = indexPayment.reduce((accumulator, currentValue) => accumulator - currentValue, totalBalance);
	return `${loanSumAmount}`;

}
async function allPayment(username: string) {
	cookies();
	const response = await fetch(`https://af-admin.vercel.app/api/loan_list/${username}`);
	if (!response.ok) {
		throw new Error("Failed to fetch data all payment");
	}
	const paymentList: PaymentIProps[] = await response.json();

	let indexPaymentString: string[] = ["0"];
	const result = paymentList.forEach((item) => indexPaymentString.push(item.amount));
	let indexPayment = indexPaymentString.map(Number);
	const Amount = indexPayment.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
	return `${Amount}`;

}
const TotalDisbursed = async (username: string, balance: string) => {
	cookies();
	const response = await fetch(`https://af-admin.vercel.app/api/loan_list/${username}`);
	if (!response.ok) {
		throw new Error("Failed to fetch data all payment");
	}
	const paymentList: PaymentIProps[] = await response.json();

	let indexPaymentString: string[] = ["0"];
	const result = paymentList.forEach((item) => indexPaymentString.push(item.loanAmount));
	let indexPayment = indexPaymentString.map(Number);
	const loanSumAmount = indexPayment.reduce((accumulator, currentValue) => accumulator + currentValue, Number(balance));
	return `${loanSumAmount}`;
}



async function BorrowersList() {
	cookies();
	let res = await fetch('https://arafatfoundation.vercel.app/api/loan');
	if (!res.ok) {
		throw new Error("Failed to fetch data list");
	};
	const borrowers: LoanIProps[] = await res.json();

	const paymentList = await prisma.payment.findMany();

	return (
		<>
			<TableBody>
				{
					borrowers.map((item, index: number) => (
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
				{/* <TableRow>
					<TableCell className=" font-semibold" colSpan={2}>Total</TableCell>
					<TableCell className="font-semibold">{TotalDisbursed()}</TableCell>
					<TableCell className="font-semibold">{TotalPayment()}</TableCell>
					<TableCell className="font-semibold">{TotalBalance()}</TableCell>
				</TableRow> */}
			</TableFooter>
		</>
	)
};



async function page() {
	return (
		<div className='flex flex-col'>

			<div className="flex justify-between p-2 ">
				<Button asChild>
					<Link className=' bg-color-main hover:bg-color-sub' href={`borrowers/create`}>Borrowers Create</Link>
				</Button>
				<Input className='w-64' type="text" placeholder="Search" />
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
					<BorrowersList />
				</Suspense>
			</Table>

		</div>
	)
}

export default page