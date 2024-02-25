'use client';
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import React from 'react'

interface RoutesIProps {
	name: string,
	path: string,
	active: boolean,
}

function AdminSidebar() {
	const path = usePathname();

	const route = path.split('/');

	const routes: RoutesIProps[] = [
		{
			name: "Branch",
			path: "/dashboard",
			active: path === '/dashboard' || path === '/dashboard/branch_create'
		},
		{
			name: "Borrowers",
			path: "borrowers",
			active: false
		},
		{
			name: "Donor",
			path: "donor",
			active: false
		},
		{
			name: "Borrowers Payment Pending",
			path: "pending",
			active: false
		}
	];
	return (
		<div className='h-[280px]'>
			<div className="flex flex-col gap-2">
				{
					routes.map((item, index) => (
						<Link key={index} className={`px-8 py-3 rounded ${item.path === route.at(2) || item.active === true ? " bg-color-main text-white" : "hover:bg-color-main hover:text-white"}`} href={item.path}>{item.name}</Link>
					))
				}
			</div>
		</div>
	)
}

export default AdminSidebar