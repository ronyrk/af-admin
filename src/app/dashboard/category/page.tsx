import React, { Suspense } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { CategoryIProps } from '@/types';
import { unstable_noStore } from 'next/cache';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/components/DeleteButton';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';
import Link from 'next/link';






async function CategoryList() {
	unstable_noStore();
	const res = await fetch('https://af-admin.vercel.app/api/category');
	if (!res.ok) {
		throw new Error("Failed to fetch data");
	};
	const payments: CategoryIProps[] = await res.json();

	return (
		<TableBody>
			{
				payments.map((item, index: number) => (
					<TableRow key={index}>
						<TableCell>{index + 1}</TableCell>
						<TableCell className="font-medium uppercase" >{item.name}</TableCell>
						<TableCell className="font-medium uppercase">
							<Button className=' bg-gray-300 text-red-400 hover:text-red-700 hover:bg-gray-50' ><PencilIcon color='blue' size={18} /> </Button>
						</TableCell>
						<TableCell className="font-medium uppercase">
							<DeleteButton type='category' username={item?.id as string} />
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
					<Link className=' bg-color-main hover:bg-color-sub' href={`category/create`}>Create</Link>
				</Button>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>INDEX</TableHead>
						<TableHead className='w-[300px]'>NAME</TableHead>
						<TableHead>DELETE</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense fallback={<h2 className=' text-center p-4'>Loading...</h2>} >
					<CategoryList />
				</Suspense>
			</Table>

		</div>
	)
}

export default page