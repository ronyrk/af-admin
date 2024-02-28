"use client"
import Image from 'next/image'
import React from 'react';
import logo from '../../public/karze-hasana.png';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Lock } from 'lucide-react';
import Marquee from 'react-fast-marquee'

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
		<div className=" bg-color-main">
			{
				isUserLoading ? <h2 className=' text-center py-8'>Loading...</h2> :
					<div className='md:px-20 px-4 flex flex-row  justify-end items-center py-6'>
						<div className=" px-2 ">
							{user?.username &&
								<div className="flex flex-row items-center gap-4">
									<Button variant={"secondary"} asChild>
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
												<AlertDialogCancel className=' text-color-main'>Cancel</AlertDialogCancel>
												<AlertDialogAction onClick={logOut} >Continue</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>


							}
						</div>
					</div>
			}
		</div>
	)
}

export default Navbar