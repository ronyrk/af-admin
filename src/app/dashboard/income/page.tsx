import React, { Suspense } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { IncomeIProps } from '@/types';
import { unstable_noStore } from 'next/cache';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import moment from 'moment';
import { PencilIcon } from 'lucide-react';
import DeleteButton from '@/components/DeleteButton';

async function IncomeList() {
	unstable_noStore();
	let res = await fetch('https://af-admin.vercel.app/api/income');
	if (!res.ok) {
		throw new Error("Failed to fetch data list");
	};
	const data: IncomeIProps[] = await res.json();

	return (
		<TableBody>
			{
				data.map((item, index: number) => (
					<TableRow key={index}>
						<TableCell className="font-medium">{`${moment(item?.date).format('DD/MM/YYYY')}`}</TableCell>
						<TableCell className="font-medium uppercase">{item.type}</TableCell>
						<TableCell className="font-medium uppercase">{item.transaction}</TableCell>
						<TableCell className="font-medium uppercase">{item.amount}</TableCell>

						<TableCell className="font-medium uppercase">
							<Button className=' bg-gray-300 text-red-400 hover:text-red-700 hover:bg-gray-50' asChild >
								<Link href={`income/${item.id}`}><PencilIcon color='blue' size={18} /></Link></Button>
						</TableCell>
						<TableCell className="font-medium uppercase">
							<DeleteButton type='income' username={item?.id as string} />
						</TableCell>
					</TableRow>
				))
			}
		</TableBody>
	)
};



async function page() {
	return (
		<div className='flex flex-col'>
			<h2 className="text-center text-xl">Income List</h2>
			<div className="p-2 flex justify-between ">
				<Button asChild>
					<Link className=' bg-color-main hover:bg-color-sub' href={`disbursement/create`}>Create</Link>
				</Button>
				<Input className='w-64' type="text" placeholder="Search" />
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>DATE</TableHead>
						<TableHead className=' uppercase'>Amount</TableHead>
						<TableHead className=' uppercase'>Payment Method</TableHead>
						<TableHead className=' uppercase'>Transaction ID</TableHead>
						<TableHead className=' uppercase'>Updated</TableHead>
						<TableHead className=' uppercase'>Deleted</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense fallback={<h2 className=' text-center p-4'>Loading...</h2>} >
					<IncomeList />
				</Suspense>
			</Table>

		</div>
	)
}

export default page