import React, { Suspense } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ChildDonateRequestProps, LoanIProps, PaymentApproveIProps, SponsorProps } from '@/types';
import { cookies } from 'next/headers';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import Moment from "moment"
import prisma from '@/lib/prisma';
import Image from 'next/image';
import ChildAction from '@/components/ChildAction';

async function getChildName(username: string) {
	cookies();
	const child = await prisma.child.findUnique({
		where: {
			username
		}
	});
	return child?.name;
}



async function ChildDonationList() {
	cookies();
	let res = await fetch('https://af-admin.vercel.app/api/donation-request');
	if (!res.ok) {
		throw new Error("Failed to fetch data list");
	};
	const data: ChildDonateRequestProps[] = await res.json();

	return (
		<TableBody>
			{
				data?.map((item, index: number) => (
					<TableRow key={index}>
						<TableCell>{`${Moment(item.createAt).format('DD/MM/YYYY')}`}</TableCell>
						<TableCell className="font-medium uppercase">{item.name}</TableCell>
						<TableCell className="font-medium uppercase">{getChildName(item.childName)}</TableCell>
						<TableCell className="font-medium uppercase">{item.amount}</TableCell>
						<TableCell className="font-medium uppercase">{item?.method}</TableCell>
						<TableCell className="font-medium uppercase">
							{item.photoUrl === '' ? "N/A" : <Dialog>
								<DialogTrigger>
									<Image
										alt='payment proved'
										src={item.photoUrl as string}
										width={80}
										height={50}
										className=' object-contain'
									/></DialogTrigger>
								<DialogContent>
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
						<TableCell className="font-medium uppercase">
							<ChildAction item={item} />
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
			<h2 className="text-center text-xl">Pending Payment Request List</h2>
			<div className="p-2 flex justify-end">
				<Input className='w-64' type="text" placeholder="Search" />
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>DATE</TableHead>
						<TableHead className='w-[200px]'>NAME</TableHead>
						<TableHead className='w-[200px]'>CHILD</TableHead>
						<TableHead>AMOUNT</TableHead>
						<TableHead>METHOD</TableHead>
						<TableHead>PHOTOS</TableHead>
						<TableHead>ACTION</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense fallback={<h2 className=' text-center p-4'>Loading...</h2>} >
					<ChildDonationList />
				</Suspense>
			</Table>

		</div>
	)
}

export default page