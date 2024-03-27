import React, { Suspense } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DonorPaymentIProps } from '@/types';
import { unstable_noStore } from 'next/cache';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import moment from 'moment';



async function ProjectsList() {
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
						<TableCell className="font-medium uppercase">Name</TableCell>
						<TableCell className="font-medium uppercase">{item.amount}</TableCell>
						<TableCell className="font-medium uppercase" >{item.loanPayment}</TableCell>
						<TableCell className="font-medium uppercase">{item.type}</TableCell>
						<TableCell className="font-medium uppercase">SetUp</TableCell>
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
					<Link className=' bg-color-main hover:bg-color-sub' href={`projects/create`}>Create</Link>
				</Button>
				<Input className='w-64' type="text" placeholder="Search" />
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>DATE</TableHead>
						<TableHead className='w-[300px] uppercase'>Title</TableHead>
						<TableHead className=' uppercase'>Author</TableHead>
						<TableHead className=' uppercase'>Picture</TableHead>
						<TableHead className=' uppercase'>Updated</TableHead>
						<TableHead className=' uppercase'>Deleted</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense fallback={<h2 className=' text-center p-4'>Loading...</h2>} >
					<ProjectsList />
				</Suspense>
			</Table>

		</div>
	)
}

export default page