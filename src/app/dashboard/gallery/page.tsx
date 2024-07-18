import React, { Suspense } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { GalleryIProps } from '@/types';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import DeleteButton from '@/components/DeleteButton';



async function GalleryList() {
	cookies();
	let res = await fetch('https://af-admin.vercel.app/api/gallery');
	if (!res.ok) {
		throw new Error("Failed to fetch data list");
	};
	const project: GalleryIProps[] = await res.json();

	return (
		<TableBody>
			{
				project.map((item, index: number) => (
					<TableRow key={index}>

						<TableCell className="font-medium uppercase">{item.category}</TableCell>
						<TableCell className="font-medium uppercase">
							<Dialog>
								<DialogTrigger>
									{
										item.category === "video" ?
											<Button className=' bg-color-sub'>Video</Button>
											: <Image
												alt='payment proved'
												src={item.content}
												width={80}
												height={50}
												className='object-contain rounded-md h-[60px]'
											/>
									}
								</DialogTrigger>
								<DialogContent className=''>
									{
										item.category === "video" ?
											<iframe width="450" height="315" className='object-fill rounded-md' src={`${item.content}`} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen ></iframe>
											: <Image
												alt='payment proved'
												src={item.content}
												width={600}
												height={320}
												className=' object-fill rounded-md'
											/>
									}
								</DialogContent>
							</Dialog>
						</TableCell>
						<TableCell className="font-medium uppercase">
							<DeleteButton type='gallery' username={item?.id as string} />
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
			<h2 className="text-center text-xl">Gallery List</h2>
			<div className="p-2 flex justify-between ">
				<Button asChild>
					<Link className=' bg-color-main hover:bg-color-sub' href={`gallery/create`}>Create</Link>
				</Button>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className='w-[300px] uppercase'>Category</TableHead>
						<TableHead className=' uppercase'>Picture</TableHead>
						<TableHead className=' uppercase'>Deleted</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense fallback={<h2 className=' text-center p-4'>Loading...</h2>} >
					<GalleryList />
				</Suspense>
			</Table>

		</div>
	)
}

export default page