"use client"
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';



function Navbar({ token }: { token?: string | null }) {
	const router = useRouter();

	const handleLogout = async () => {
		await fetch("/api/logout", { method: "POST" });
		router.refresh();
	}

	return (
		<div className=" bg-slate-200">

			<div className='md:px-20 px-4 flex flex-row  justify-end items-center py-6'>
				<div className=" px-2  flex flex-row justify-between items-center">
					{
						token && <Link href={"/dashboard"} className='text-lg font-medium text-gray-700'>Dashboard</Link>
					}
				</div>
				<div className="ml-4">
					{
						token && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="rounded-full">
										<Avatar>
											<AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
											<AvatarFallback>CN</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-32">
									{/* <DropdownMenuGroup>
										<DropdownMenuItem>Profile</DropdownMenuItem>
										<DropdownMenuItem>Billing</DropdownMenuItem>
										<DropdownMenuItem>Settings</DropdownMenuItem>
									</DropdownMenuGroup> */}
									{/* <DropdownMenuSeparator /> */}
									<DropdownMenuGroup>
										<DropdownMenuItem onClick={handleLogout} >Log out</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>

						)
					}
				</div>
			</div>
		</div>
	)
}

export default Navbar