import React, { Suspense } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { LoanIProps, PaymentApproveIProps, SponsorProps } from '@/types';
import { unstable_noStore } from 'next/cache';
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
import ActionButton from '@/components/ActionButton';
import prisma from '@/lib/prisma';
import Image from 'next/image';
import { GetBranchDetails } from '@/lib/getBranchList';
import { GetLoanDetails } from '@/lib/getLoanName';
import ChildAction from '@/components/ChildAction';






async function ChildDonationList() {
	unstable_noStore();
	const res = await fetch('https://af-admin.vercel.app/api/request');
	if (!res.ok) {
		throw new Error("Failed to fetch data");
	};
	const payments: SponsorProps[] = await res.json();

	return (
		<TableBody>
			{
				payments.map((item, index: number) => (
					<TableRow key={index}>
						<TableCell>{index + 1}</TableCell>

						{/* <TableCell className="font-medium uppercase" >{GetBranchDetails(item.loanusername)}</TableCell>
						<TableCell className="font-medium uppercase">{GetLoanDetails(item.loanusername)}</TableCell> */}
						<TableCell className="font-medium uppercase">{item.amount}</TableCell>
						<TableCell className="font-medium uppercase">{item.method}</TableCell>
						<TableCell className="font-medium uppercase">
							<Dialog>
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
							</Dialog>

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
						<TableHead>INDEX</TableHead>
						<TableHead className='w-[300px]'>NAME</TableHead>
						<TableHead>CHILD</TableHead>
						<TableHead>AMOUNT</TableHead>
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