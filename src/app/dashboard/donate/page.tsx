import React, { Suspense } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DonateProps, NewsProps } from '@/types';
import { cookies } from 'next/headers';
import moment from 'moment';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';

async function getMethod(method: string) {
	if (method === '') {
		return "Outside"
	} else {
		return method
	}
}


async function NewsList() {
	cookies();
	let res = await fetch('https://af-admin.vercel.app/api/donate');
	if (!res.ok) {
		throw new Error("Failed to fetch data list");
	};
	const data: DonateProps[] = await res.json();

	return (
		<TableBody>
			{
				data.map((item, index: number) => (
					<TableRow key={index}>
						<TableCell className="font-medium">{`${moment(item?.createAt).format('DD/MM/YYYY')}`}</TableCell>
						<TableCell className="font-medium uppercase">{item.name}</TableCell>
						<TableCell className="font-medium lowercase">{item.email}</TableCell>
						<TableCell className="font-medium ">{item.amount}</TableCell>
						<TableCell className="font-medium ">{item.method ? item.method : "Outside"}</TableCell>
						<TableCell className="font-medium uppercase">
							{item.photoUrl === "" ? "N/A" : <Dialog>
								<DialogTrigger>
									<Image
										alt='payment proved'
										src={item.photoUrl as string}
										width={80}
										height={50}
										className='object-contain h-[60px]'
									/></DialogTrigger>
								<DialogContent className=''>
									<Image
										alt='payment proved'
										src={item.photoUrl as string}
										width={500}
										height={200}
										className=' object-fill rounded-md'
									/>
								</DialogContent>
							</Dialog>}
						</TableCell>
					</TableRow>
				))
			}
		</TableBody>
	)
};



async function page() {
	return (
		<div className='flex flex-col gap-4'>
			<h2 className="text-center text-xl">Donate List</h2>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Date</TableHead>
						<TableHead className='uppercase'>Name</TableHead>
						<TableHead className='uppercase'>Email</TableHead>
						<TableHead className='uppercase'>Amount</TableHead>
						<TableHead className='uppercase'>method</TableHead>
						<TableHead className='uppercase'>Picture</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense fallback={<h2 className=' text-center p-4'>Loading...</h2>} >
					<NewsList />
				</Suspense>
			</Table>

		</div>
	)
}

export default page