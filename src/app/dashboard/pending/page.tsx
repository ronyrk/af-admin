import React, { Suspense } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { PaymentApproveIProps } from '@/types';
import { cookies } from 'next/headers';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@/components/ui/dialog"
import Moment from "moment"
import ActionButton from '@/components/ActionButton';
import Image from 'next/image';
import { GetBranchDetails } from '@/lib/getBranchList';
import { GetLoanDetails } from '@/lib/getLoanName';






async function BorrowersList() {
	cookies();
	const res = await fetch('https://af-admin.vercel.app/api/request');
	if (!res.ok) {
		throw new Error("Failed to fetch data");
	};
	const payments: PaymentApproveIProps[] = await res.json();

	return (
		<TableBody>
			{
				payments.map((item, index: number) => (
					<TableRow key={index}>
						<TableCell>{`${Moment(item.createAt).format('DD/MM/YYYY')}`}</TableCell>

						<TableCell className="font-medium uppercase" >{GetBranchDetails(item.loanusername)}</TableCell>
						<TableCell className="font-medium uppercase">{GetLoanDetails(item.loanusername)}</TableCell>
						<TableCell className="font-medium uppercase">{item.amount}</TableCell>
						<TableCell className="font-medium uppercase">{item.method}</TableCell>
						<TableCell className="font-medium uppercase">
							<Dialog>
								<DialogTrigger>
									<Image
										alt='payment proved'
										src={item.photoUrl}
										width={80}
										height={50}
										className=' object-contain'
									/></DialogTrigger>
								<DialogContent>
									<Image
										alt='payment proved'
										src={item.photoUrl}
										width={500}
										height={200}
										className=' object-fill rounded-md'
									/>
								</DialogContent>
							</Dialog>

						</TableCell>
						<TableCell className="font-medium uppercase">
							<ActionButton item={item} />
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
						<TableHead className='w-[300px]'>BRANCH NAME</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>AMOUNT</TableHead>
						<TableHead>METHOD</TableHead>
						<TableHead>PHOTOS</TableHead>
						<TableHead>ACTION</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense fallback={<h2 className=' text-center p-4'>Loading...</h2>} >
					<BorrowersList />
				</Suspense>
			</Table>

		</div>
	)
}

export default page