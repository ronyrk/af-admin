import React, { Suspense } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ChildIProps, LoanIProps, PaymentApproveIProps } from '@/types';
import { cookies } from 'next/headers';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@/components/ui/dialog"
import Image from 'next/image';

import DeleteButton from '@/components/DeleteButton';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';
import Link from 'next/link';

async function ChildsList() {
	cookies();
	const res = await fetch('https://af-admin.vercel.app/api/child');
	if (!res.ok) {
		throw new Error("Failed to fetch data");
	};
	const payments: ChildIProps[] = await res.json();

	return (
		<TableBody>
			{
				payments.map((item, index: number) => (
					<TableRow key={index}>
						<TableCell>{item.academy}</TableCell>
						<TableCell className="font-medium uppercase" >{item.name}</TableCell>
						<TableCell className="font-medium uppercase">{item.phone}</TableCell>
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
							<Button asChild className=' bg-gray-300 text-red-400 hover:text-red-700 hover:bg-gray-50' >
								<Link href={`child/${item.username}`}><PencilIcon color='blue' size={18} /></Link>
							</Button>
						</TableCell>
						<TableCell className="font-medium uppercase">
							<DeleteButton type='child' username={item.username} />
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
					<Link className=' bg-color-main hover:bg-color-sub' href={`child/create`}>Create</Link>
				</Button>
				<Button asChild>
					<Link className=' bg-color-main hover:bg-color-sub' href={`child/pending`}>Pending</Link>
				</Button>
				<Input className='w-64' type="text" placeholder="Search" />
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Academy</TableHead>
						<TableHead className='w-[300px]'>NAME</TableHead>
						<TableHead>PHONE</TableHead>
						<TableHead>PHOTOS</TableHead>
						<TableHead>UPDATE</TableHead>
						<TableHead>DELETE</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense fallback={<h2 className=' text-center p-4'>Loading...</h2>} >
					<ChildsList />
				</Suspense>
			</Table>

		</div>
	)
}

export default page