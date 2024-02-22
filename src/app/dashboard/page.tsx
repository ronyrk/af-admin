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
import { Button } from "@/components/ui/button"
import Link from 'next/link';
import { BranchIProps } from '@/types';
import { unstable_noStore } from 'next/cache';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/components/DeleteButton';

async function BranchList() {
	unstable_noStore();
	let res = await fetch('https://af-admin.vercel.app/api/branch');
	if (!res.ok) {
		throw new Error("Failed to fetch data");
	};
	let branches: BranchIProps[] = await res.json();

	return (
		<TableBody>
			{
				branches.map((item, index: number) => (
					<TableRow key={index}>
						<TableCell className="font-medium">{item.code}</TableCell>
						<TableCell className="font-medium uppercase">{item.branchName}</TableCell>
						<TableCell className="font-medium uppercase" >{item.district}</TableCell>
						<TableCell className="font-medium uppercase">{item.ps}</TableCell>
						<TableCell className="font-medium uppercase">
							<Suspense fallback={<h2>Loading...</h2>}>
								<DeleteButton username={item.username} />
							</Suspense>
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
			<div className="p-2 flex justify-between ">
				<Button asChild>
					<Link className=' bg-color-main hover:bg-color-sub' href={`dashboard/branch_create`}>Branch Create</Link>
				</Button>
				<Input className='w-64' type="text" placeholder="Search" />
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>CODE</TableHead>
						<TableHead className='md:w-[300px]'>BRANCH</TableHead>
						<TableHead>DISTRICT</TableHead>
						<TableHead>PS(TANA)</TableHead>
						<TableHead>DETAILS</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense fallback={<h2 className=' text-center p-4'>Loading...</h2>} >
					<BranchList />
				</Suspense>
			</Table>

		</div>
	)
}

export default page