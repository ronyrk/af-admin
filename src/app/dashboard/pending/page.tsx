import React, { Suspense } from 'react'
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { LoanIProps, PaymentApproveIProps } from '@/types';
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

// Loan Details
async function GetLoanDetails(username: string) {
	try {
		unstable_noStore();
		let res = await fetch(`https://arafatfoundation.vercel.app/api/loan/${username}`);
		if (!res.ok) {
			throw new Error("Failed to fetch data");
		};
		const loan: LoanIProps = await res.json();
		const name = loan.name;
		return name;
	} catch (error) {
		throw new Error("Server Error get Loan Details");
	}
}
// Loan to Branch Details
async function GetBranchDetails(username: string) {
	try {
		unstable_noStore();
		let res = await fetch(`https://arafatfoundation.vercel.app/api/loan/${username}`);
		if (!res.ok) {
			throw new Error("Failed to fetch data");
		};
		const loan: LoanIProps = await res.json();
		const BranchUserName = loan.branch;
		const branch = await prisma.branch.findUnique({ where: { username: BranchUserName } });
		return `${branch?.branchName}`;
	} catch (error) {
		throw new Error("Server Error  Branch");
	}
}



async function BorrowersList() {
	unstable_noStore();
	let res = await fetch('https://arafatfoundation.vercel.app/api/requestPayment');
	if (!res.ok) {
		throw new Error("Failed to fetch data");
	};
	const payments: PaymentApproveIProps[] = await res.json();


	return (
		<TableBody>
			{
				payments.map((item, index: number) => (
					<TableRow key={index}>
						<TableCell>{`${Moment(item.createAt).subtract(1, "years").format('DD/MM/YYYY')}`}</TableCell>

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