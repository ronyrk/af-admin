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
import { unstable_noStore } from 'next/cache';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import moment from 'moment';


async function getUserName(username: string) {
	unstable_noStore();
	let res = await fetch(`https://arafatfoundation.vercel.app/api/donor/${username}`);
	if (!res.ok) {
		throw new Error("Failed to fetch data");
	};
	const user: DonorIProps = await res.json();
	const name = user.name;
	return name;
}
async function getUserStatus(username: string) {
	unstable_noStore();
	let res = await fetch(`https://arafatfoundation.vercel.app/api/donor/${username}`);
	if (!res.ok) {
		throw new Error("Failed to fetch data");
	};
	const user: DonorIProps = await res.json();
	const status = user.status;
	return status;
}



async function DonorPaymentList() {
	unstable_noStore();
	let res = await fetch('https://arafatfoundation.vercel.app/api/donor_payment');
	if (!res.ok) {
		throw new Error("Failed to fetch data list");
	};
	const payment: DonorPaymentIProps[] = await res.json();

	return (
		<TableBody>
			{
				payment.map((item, index: number) => (
					<TableRow key={index}>
						<TableCell className="font-medium">{`${moment(item.createAt).subtract(1, "years").format('DD/MM/YYYY')}`}</TableCell>
						<TableCell className="font-medium uppercase">{getUserName(item.donorUsername)}</TableCell>
						<TableCell className="font-medium uppercase">{item.amount}</TableCell>
						<TableCell className="font-medium uppercase" >{item.loanPayment}</TableCell>
						<TableCell className="font-medium uppercase">{item.type}</TableCell>
						<TableCell className="font-medium uppercase">{getUserStatus(item.donorUsername)}</TableCell>
					</TableRow>
				))
			}
		</TableBody>
	)
};



async function page() {
	return (
		<div className='flex flex-col'>
			<h2 className="text-center text-xl">Donor Payment</h2>
			<div className="p-2 flex justify-between ">
				<Button asChild>
					<Link className=' bg-color-main hover:bg-color-sub' href={`payment/create`}>Donor payment Create</Link>
				</Button>
				<Input className='w-64' type="text" placeholder="Search" />
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>DATE</TableHead>
						<TableHead className='w-[300px]'>NAME</TableHead>
						<TableHead>AMOUNT</TableHead>
						<TableHead>LOAN PAYMENT</TableHead>
						<TableHead>PAYMENT STATUS</TableHead>
						<TableHead>DONOR TYPE</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense fallback={<h2 className=' text-center p-4'>Loading...</h2>} >
					<DonorPaymentList />
				</Suspense>
			</Table>

		</div>
	)
}

export default page