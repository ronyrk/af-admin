import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


import Link from 'next/link';
// import { useUser } from './ContextProvider';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from './ui/button';
import { getAuthToken } from '@/lib/auth';



async function Navbar() {
	const token = await getAuthToken();
	return (
		<div className=" bg-slate-200">

			<div className='md:px-20 px-4 flex flex-row  justify-end items-center py-6'>
				<div className=" px-2  flex flex-row justify-between items-center">
					<Link href={"/dashboard"} className='text-lg font-medium text-gray-700'>Dashboard</Link>
				</div>
				<div className="ml-4">
					<Avatar>
						<AvatarImage src="https://github.com/shadcn.png" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
				</div>
			</div>
		</div>
	)
}

export default Navbar