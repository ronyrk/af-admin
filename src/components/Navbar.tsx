"use client"
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


import Link from 'next/link';
import { useUser } from './ContextProvider';
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



function Navbar() {
	const { user, setUser, isUserLoading } = useUser();
	const logOut = () => {
		setUser(null);
		localStorage.removeItem("admin");
	};
	return (
		<div className=" bg-slate-200">

			<div className='md:px-20 px-4 flex flex-row  justify-end items-center py-6'>
				<div className=" px-2  flex flex-row justify-between items-center">
					{user?.username &&
						<div className="flex flex-row items-center gap-4">

							<Button className='text-black' variant={"outline"} asChild>
								<Link href="/dashboard">DashBoard</Link>
							</Button>
							<AlertDialog>
								<AlertDialogTrigger>
									<Avatar>
										<AvatarImage src={user?.photoUrl} />
										<AvatarFallback>U</AvatarFallback>
									</Avatar>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Are you absolutely logout?</AlertDialogTitle>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel className=' text-color-main'>No</AlertDialogCancel>
										<AlertDialogAction onClick={logOut} >Yes</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>


					}
					{
						user?.username &&
						<div className="mx-3">
							<Button className='text-black mx-3' variant={"outline"} asChild>
								<Link href="/dashboard/password-change">Password Change</Link>
							</Button>
						</div>
					}
				</div>
			</div>
		</div>
	)
}

export default Navbar