import React, { Suspense } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cookies } from 'next/headers';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/components/DeleteButton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import moment from 'moment';
import { ClipboardPenLine } from 'lucide-react';
import { filterAndSortDonations } from '@/lib/filterAndSortDonations';
import { UserDetailsByUsername } from '@/lib/userDetailsByUsername';





async function DonorList() {
	cookies();


	const response = await fetch("https://af-admin.vercel.app/api/donor_payment");
	if (!response.ok) {
		throw new Error("Failed fetch Data");
	};
	const paymentList = await response.json();

	const sortedDonations = filterAndSortDonations(paymentList);


	return (
		<>
			<TableBody>
				{
					sortedDonations.map((item, index: number) => (
						<TableRow key={index}>
							<TableCell className="font-medium">{index + 1}</TableCell>
							<TableCell className="font-medium uppercase">{UserDetailsByUsername(item.donorUsername)}</TableCell>
							<TableCell className="font-medium uppercase" >{item.amount}</TableCell>
							<TableCell className="font-medium">{`${moment(item.paymentDate).format('DD/MM/YYYY')}`}</TableCell>
							<TableCell className="font-medium uppercase">
								<Button className=' bg-color-main' variant={"outline"} size={"sm"} asChild>
									<Link href={`/dashboard/donor/${item.donorUsername}`}><ClipboardPenLine /></Link>
								</Button>
							</TableCell>
							<TableCell className="font-medium uppercase">
								<DeleteButton type='donor' username={item.id as string} />
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
						<TableHead>INDEX</TableHead>
						<TableHead className='w-[200px]'>NAME</TableHead>
						<TableHead>AMOUNT</TableHead>
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
					<Link className=' bg-color-main hover:bg-color-sub' href={`donor/lists`}>lender Lists</Link>
				</Button>
			</div>

		</div>
	)
}

export default page