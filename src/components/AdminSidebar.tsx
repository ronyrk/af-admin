'use client';
import Link from 'next/link'
import { redirect, usePathname } from 'next/navigation';
import React, { useEffect } from 'react'
import { useUser } from './ContextProvider';

interface RoutesIProps {
	name: string,
	path: string,
	active: boolean,
}

function AdminSidebar() {
	const path = usePathname();
	const { user } = useUser();
	const route = path.split('/');
	const routes: RoutesIProps[] = [
		{
			name: "Branch",
			path: "/dashboard",
			active: path === '/dashboard' || path === '/dashboard/branch_create'
		},
		{
			name: "Borrowers",
			path: "/dashboard/borrowers",
			active: route.at(2) === 'borrowers'
		},
		{
			name: "Donor",
			path: "/dashboard/donor",
			active: route.at(2) === 'donor'
		},
		{
			name: "Borrowers Payment Pending",
			path: "/dashboard/pending",
			active: path === '/dashboard/pending'
		},
		{
			name: "FAQ",
			path: "/dashboard/question",
			active: path === "/dashboard/question"
		}
	];

	useEffect(() => {
		if (!user?.email) {
			redirect('/');
		}
	}, [user?.email]);

	return (
		<div className='h-[280px]'>
			<div className="flex flex-col gap-2">
				{
					routes.map((item, index) => (
						<Link key={index} className={`px-8 py-3 rounded ${item.active === true ? " bg-color-main text-white" : "hover:bg-color-main hover:text-white"}`} href={item.path}>{item.name}</Link>
					))
				}
			</div>
		</div>
	)
}

export default AdminSidebar