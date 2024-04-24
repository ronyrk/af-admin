import React, { Suspense } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ProjectsProps } from '@/types';
import { unstable_noStore } from 'next/cache';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import moment from 'moment';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import { PencilIcon } from 'lucide-react';
import DeleteButton from '@/components/DeleteButton';



async function ProjectsList() {
	unstable_noStore();
	let res = await fetch('https://af-admin.vercel.app/api/project');
	if (!res.ok) {
		throw new Error("Failed to fetch data list");
	};
	const project: ProjectsProps[] = await res.json();

	return (
		<TableBody>
			{
				project.map((item, index: number) => (
					<TableRow key={index}>
						<TableCell className="font-medium">{`${moment(item?.createAt).subtract(1, "years").format('DD/MM/YYYY')}`}</TableCell>
						<TableCell className="font-medium uppercase">{item.title}</TableCell>
						<TableCell className="font-medium uppercase">{item.author}</TableCell>
						<TableCell className="font-medium uppercase">
							<Dialog>
								<DialogTrigger>
									<Image
										alt='payment proved'
										src={item.photoUrl}
										width={80}
										height={50}
										className='object-contain h-[60px]'
									/></DialogTrigger>
								<DialogContent className=''>
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
								<Link href={`projects/${item.username}`}><PencilIcon color='blue' size={18} /></Link>
							</Button>
						</TableCell>
						<TableCell className="font-medium uppercase">
							<DeleteButton type='project' username={item?.id} />
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
			<h2 className="text-center text-xl">Project List</h2>
			<div className="p-2 flex justify-between ">
				<Button asChild>
					<Link className=' bg-color-main hover:bg-color-sub' href={`projects/create`}>Create</Link>
				</Button>
				<Input className='w-64' type="text" placeholder="Search" />
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>DATE</TableHead>
						<TableHead className='w-[300px] uppercase'>Title</TableHead>
						<TableHead className=' uppercase'>Author</TableHead>
						<TableHead className=' uppercase'>Picture</TableHead>
						<TableHead className=' uppercase'>Updated</TableHead>
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