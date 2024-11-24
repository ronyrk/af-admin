import React, { Suspense } from 'react'
import {
	Table,
	TableBody,
	TableCell,
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
import { ClipboardPenLine } from 'lucide-react';
import prisma from '@/lib/prisma';



const TotalLending = async (username: string) => {
	cookies();
	const paymentList = await prisma.donorPayment.findMany({
		where: {
			donorUsername: username
		}
	});
	const returnArray = paymentList.filter((item) => item.type === "LENDING");
	let returnStringArray: string[] = [];
	returnArray.forEach((item) => returnStringArray.push(item.amount as string));
	const returnNumberArray = returnStringArray.map(Number);
	const total = returnNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
	return `${total}`;
}

const TotalRefound = async (username: string) => {
	cookies();
	const paymentList = await prisma.donorPayment.findMany({
		where: {
			donorUsername: username
		}
	});
	let returnStringArray: string[] = [];
	paymentList.forEach((item) => returnStringArray.push(item.loanPayment as string));
	const returnNumberArray = returnStringArray.map(Number);
	const total = returnNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
	return `${total}`;
}

const Outstanding = async (username: string) => {
	cookies();
	const paymentList = await prisma.donorPayment.findMany({
		where: {
			donorUsername: username
		}
	});
	const returnArray = paymentList.filter((item) => item.type === "LENDING");
	let returnStringArray: string[] = [];
	returnArray.forEach((item) => returnStringArray.push(item.amount as string));
	const returnNumberArray = returnStringArray.map(Number);
	const total = returnNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

	let returnStringArray2: string[] = [];
	paymentList.forEach((item) => returnStringArray2.push(item.loanPayment as string));
	const returnNumberArray2 = returnStringArray2.map(Number);
	const payment = returnNumberArray2.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

	return `${total - payment}`;
}


async function DonorList() {
	cookies();

	const donors: DonorIProps[] = await prisma.donor.findMany({
		orderBy: {
			code: "asc"
		}
	}) as DonorIProps[];


	const response = await fetch("https://af-admin.vercel.app/api/donor_payment");
	if (!response.ok) {
		throw new Error("Failed fetch Data Donor Payment");
	};
	const paymentList: DonorPaymentIProps[] = await response.json();



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
					donors.map((item, index: number) => (
						<TableRow key={index}>
							<TableCell className="font-medium">{item.code}</TableCell>
							<TableCell className="font-medium uppercase">{item.name}</TableCell>
							<TableCell className="font-medium uppercase">{getStatus(item.status)}</TableCell>
							<TableCell className="font-medium uppercase">{TotalLending(item.username)}</TableCell>
							<TableCell className="font-medium uppercase">{TotalRefound(item.username)}</TableCell>
							<TableCell className="font-medium uppercase">{Outstanding(item.username)}</TableCell>
							<TableCell className="font-medium uppercase">
								<Button className=' bg-color-main' variant={"outline"} size={"sm"} asChild>
									<Link href={`donor/${item.username}`}><ClipboardPenLine /></Link>
								</Button>
							</TableCell>
							<TableCell className="font-medium uppercase">
								<DeleteButton type='donor' username={item.username} />
							</TableCell>
						</TableRow>
					))
				}
			</TableBody>
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
						<TableHead className=' uppercase'>Total Lending </TableHead>
						<TableHead className=' uppercase'>Total Refound</TableHead>
						<TableHead className=' uppercase' >Outstanding</TableHead>
						<TableHead>UPDATED</TableHead>
						<TableHead>DELETED</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense fallback={<h2 className='p-4 text-center '>Loading...</h2>} >
					<DonorList />
				</Suspense>
			</Table>
		</div>
	)
}

export default page