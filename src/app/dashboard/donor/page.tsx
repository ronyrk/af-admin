import React, { Suspense } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DonorIProps, DonorPaymentIProps } from '@/types';
import { cookies } from 'next/headers';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/components/DeleteButton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import moment, { now } from 'moment';
import { ClipboardPenLine } from 'lucide-react';
import { filterAndSortDonors } from '@/lib/donorfillterByDate';
import prisma from '@/lib/prisma';



const Amount = async (status: string, username: string, amount: string) => {
	cookies();
	const response = await fetch(`https://arafatfoundation.vercel.app/api/donor_payment/donor/${username}`);
	if (!response.ok) {
		throw new Error("Failed fetch Data");
	};
	const payment: DonorPaymentIProps[] = await response.json();
	if (status === "LEADER") {
		const returnArray = payment.filter((item) => item.type === "return");
		let returnStringArray: string[] = [];
		returnArray.forEach((item) => returnStringArray.push(item.loanPayment));
		const returnNumberArray = returnStringArray.map(Number);
		const totalReturn = returnNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

		const increaseArray = payment.filter((item) => item.type === "increase");
		let increaseStringArray: string[] = [];
		increaseArray.forEach((item) => increaseStringArray.push(item.amount));
		const increaseNumberArray = increaseStringArray.map(Number);
		const totalIncrease = increaseNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
		return totalIncrease - totalReturn;
	} else {
		let amountStringArray: string[] = [];
		const Create = payment.forEach((item) => amountStringArray.push(item.amount));
		// Convert String Array to Number Array
		let AmountArray = amountStringArray.map(Number);
		const totalAmount = AmountArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
		return `${totalAmount}`
	}

}
const ReturnAmount = async (status: string, username: string, amount: string) => {
	cookies();
	const response = await fetch(`https://arafatfoundation.vercel.app/api/donor_payment/donor/${username}`);
	if (!response.ok) {
		throw new Error("Failed fetch Data");
	};
	const payment: DonorPaymentIProps[] = await response.json();
	if (status === "LEADER") {
		const returnArray = payment.filter((item) => item.type === "return");
		let returnStringArray: string[] = [];
		returnArray.forEach((item) => returnStringArray.push(item.loanPayment));
		const returnNumberArray = returnStringArray.map(Number);
		const totalReturn = returnNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
		return `${totalReturn}`;
	} else {
		return "N/A"
	}

}


async function DonorList() {
	const skips = 90;
	const today = new Date();

	cookies();
	const donors = await prisma.donor.findMany({
		where: {
			status: "LEADER"
		}
	});


	const donorsWithin30Days = filterAndSortDonors(donors as any, 30, true);
	// console.log({ donorsWithin30Days });
	console.log({ donors })

	const response = await fetch("https://arafatfoundation.vercel.app/api/donor_payment");
	if (!response.ok) {
		throw new Error("Failed fetch Data");
	};
	const paymentList: DonorPaymentIProps[] = await response.json();

	const TotalReturnAmount = async () => {
		const returnArray = paymentList.filter((item) => item.type === "return");
		let returnStringArray: string[] = [];
		returnArray.forEach((item) => returnStringArray.push(item.loanPayment));
		const returnNumberArray = returnStringArray.map(Number);
		const totalReturn = returnNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
		return `BDT=${totalReturn}/=`;

	}
	const TotalAmount = async () => {
		const returnArray = paymentList.filter((item) => item.type === "return");
		let returnStringArray: string[] = [];
		returnArray.forEach((item) => returnStringArray.push(item.loanPayment));
		const returnNumberArray = returnStringArray.map(Number);
		const totalReturn = returnNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

		const increaseArray = paymentList.filter((item) => item.type === "increase");
		let increaseStringArray: string[] = [];
		increaseArray.forEach((item) => increaseStringArray.push(item.amount));
		const increaseNumberArray = increaseStringArray.map(Number);
		const totalIncrease = increaseNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
		return `BDT=${totalIncrease - totalReturn}/=`;

	}


	async function getStatus(status: string) {
		if (status === "LEADER") {
			return "LENDER"
		} else {
			return status
		}
	};


	return (
		<>
			<TableBody>
				{
					donorsWithin30Days.map((item, index: number) => (
						<TableRow key={index}>
							<TableCell className="font-medium">{item.code}</TableCell>
							<TableCell className="font-medium uppercase">{item.name}</TableCell>
							<TableCell className="font-medium uppercase">{getStatus(item.status)}</TableCell>
							<TableCell className="font-medium uppercase" >{Amount(item.status, item.username, item.amount)}</TableCell>
							<TableCell className="font-medium uppercase" >{ReturnAmount(item.status, item.username, item.amount)}</TableCell>
							<TableCell className="font-medium">{`${moment(item.paymentDate).format('DD/MM/YYYY')}`}</TableCell>
							<TableCell className="font-medium uppercase">
								<Button className=' bg-color-main' variant={"outline"} size={"sm"} asChild>
									<Link href={`/dashboard/donor/${item.username}`}><ClipboardPenLine /></Link>
								</Button>
							</TableCell>
							<TableCell className="font-medium uppercase">
								<DeleteButton type='donor' username={item.username} />
							</TableCell>
						</TableRow>
					))
				}
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell className=' font-semibold' colSpan={3}>Total</TableCell>
					<TableCell className=' font-semibold'>{TotalAmount()} </TableCell>
					<TableCell className=' font-semibold'>{TotalReturnAmount()} </TableCell>
				</TableRow>
			</TableFooter>
		</>
	)
};



async function page() {
	return (
		<div className='flex flex-col'>
			<h2 className="text-xl text-center">Donor List</h2>
			<div className="flex justify-between p-2 ">
				<Button asChild>
					<Link className=' bg-color-main hover:bg-color-sub' href={`donor/create`}>Donor Create</Link>
				</Button>
				<Input className='w-64' type="text" placeholder="Search" />
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>CODE</TableHead>
						<TableHead className='w-[200px]'>NAME</TableHead>
						<TableHead>TYPE</TableHead>
						<TableHead>AMOUNT</TableHead>
						<TableHead>RETURNED AMOUNT</TableHead>
						<TableHead>RETURNED DATE</TableHead>
						<TableHead>UPDATED</TableHead>
						<TableHead>DELETED</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense fallback={<h2 className='p-4 text-center '>Loading...</h2>} >
					<DonorList />
				</Suspense>
			</Table>
			<div className=" py-4 text-center">
				<Button asChild>
					<Link className=' bg-color-main hover:bg-color-sub' href={`donor/older-donor`}> Older-Donor</Link>
				</Button>
			</div>

		</div>
	)
}

export default page