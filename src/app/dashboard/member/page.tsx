import { unstable_noStore } from 'next/cache';
import React, { Suspense } from 'react'
import prisma from '@/lib/prisma';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import DeleteButton from '@/components/DeleteButton';

async function getBranchName(username: string) {
	const data = await prisma.branch.findUnique({
		where: {
			username
		}
	});
	return data?.branchName;
}

async function ProjectsList() {
	unstable_noStore();
	const data = await prisma.member.findMany();
	return (
		<TableBody>
			{
				data.map((item, index: number) => (
					<TableRow key={index}>
						<TableCell className="font-medium uppercase">{item.teamMemberName}</TableCell>
						<TableCell className="font-medium uppercase">
							<Image
								alt='payment proved'
								src={item.teamMemberPhotoUrl}
								width={80}
								height={50}
								className='object-contain h-[60px]'
							/>
						</TableCell>
						<TableCell className="font-medium uppercase">{getBranchName(item.branch)}</TableCell>
						<TableCell className="font-medium uppercase">
							<DeleteButton type='member' username={item?.id} />
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
			<h2 className="text-center text-xl">Member List</h2>
			<div className="p-2 flex justify-between ">
				<Input className='w-64' type="text" placeholder="Search" />
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>DATE</TableHead>
						<TableHead className='w-[300px] uppercase'>NAME</TableHead>
						<TableHead className=' uppercase'>Picture</TableHead>
						<TableHead className=' uppercase'>BRANCH NAME</TableHead>
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