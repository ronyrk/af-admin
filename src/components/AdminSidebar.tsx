'use client';
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import React from 'react'

function AdminSidebar() {
	const path = usePathname();
	// console.log(path)
	return (
		<div className=' h-[280px]'>
			<div className="flex flex-col  pb-2">
				<div className="px-8 py-3 rounded active:bg-color-main hover:bg-color-main hover:text-white">
					<Link href="/">Branch List</Link>
				</div>
				<div className="px-8 py-3 rounded hover:bg-color-main hover:text-white">
					<Link href="/loan">Loan List</Link>
				</div>
				<div className="px-8 py-3 rounded hover:bg-color-main hover:text-white">
					<Link href="/">Payment Request</Link>
				</div>
				<div className="px-8 py-3 rounded hover:bg-color-main hover:text-white">
					<Link href="/">Payment Request</Link>
				</div>
			</div>
		</div>
	)
}

export default AdminSidebar