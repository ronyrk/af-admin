'use client';
import Link from 'next/link'
import { redirect, usePathname } from 'next/navigation';
import React, { useEffect } from 'react'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"


interface RoutesIProps {
	name: string,
	path: string,
	active: boolean,
}

function AdminSidebar() {
	const path = usePathname();
	const route = path.split('/');
	const hasana: RoutesIProps[] = [
		{
			name: "Summary",
			path: "/dashboard",
			active: path === '/dashboard'
		},
		{
			name: "Branch",
			path: "/dashboard/branch",
			active: path === '/dashboard/branch' || path === '/dashboard/branch/branch_create'
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
			name: "Upcoming money refund",
			path: "/dashboard/up-coming",
			active: path === '/dashboard/up-coming'
		},
		{
			name: "FAQ",
			path: "/dashboard/question",
			active: path === "/dashboard/question" || path === "/dashboard/question/create"
		}
	];
	const child: RoutesIProps[] = [


		{
			name: "Child",
			path: "/dashboard/child",
			active: path === "/dashboard/child" || path === "/dashboard/child/create" || path === "/dashboard/child/donation" || path === "/dashboard/child/pending"
		},
		{
			name: "Donate",
			path: "/dashboard/donate",
			active: path === "/dashboard/donate"
		},
		{
			name: "Disbursement",
			path: "/dashboard/disbursement",
			active: path === "/dashboard/disbursement" || path === "/dashboard/disbursement/create"
		}
	];
	const gallery: RoutesIProps[] = [
		{
			name: "Category",
			path: "/dashboard/category",
			active: path === "/dashboard/category" || path === "/dashboard/category/create"
		},
		{
			name: "Gallery",
			path: "/dashboard/gallery",
			active: path === "/dashboard/gallery" || path === "/dashboard/gallery/create"
		},

	];
	const beneficial: RoutesIProps[] = [
		{
			name: "District",
			path: "/dashboard/district",
			active: path === "/dashboard/district",
		},
		{
			name: "Beneficiary Question",
			path: "/dashboard/beneficiary/about-beneficiary",
			active: path === "/dashboard/beneficiary/about-beneficiary" || path === "/dashboard/beneficiary/about-beneficiary/create"
		},
		{
			name: "Beneficiary Donor",
			path: "/dashboard/beneficiary/donors",
			active: path === "/dashboard/beneficiary/donors" || path === "/dashboard/beneficiaries/donor/create"
		},
		{
			name: "Beneficiaries",
			path: "/dashboard/beneficiaries",
			active: path === "/dashboard/beneficiaries" || path === "/dashboard/beneficiaries/create"
		}



	];

	const others: RoutesIProps[] = [

		{
			name: "Team Member",
			path: "/dashboard/owner",
			active: path === "/dashboard/owner" || path === "/dashboard/owner/create"
		},
		{
			name: "Projects",
			path: "/dashboard/projects",
			active: path === "/dashboard/projects" || path === "/dashboard/projects/create"
		},
		{
			name: "Blog",
			path: "/dashboard/blog",
			active: path === "/dashboard/blog" || path === "/dashboard/blog/create"
		},

		{
			name: "Branch Member",
			path: "/dashboard/member",
			active: path === "/dashboard/member"
		},
		{
			name: "Income",
			path: "/dashboard/income",
			active: path === "/dashboard/income" || path === "/dashboard/income/create"
		},
		{
			name: "Expenses",
			path: "/dashboard/expenses",
			active: path === "/dashboard/expenses" || path === "/dashboard/expenses/create"
		},
		{
			name: "Our links",
			path: "/dashboard/our-links",
			active: path === "/dashboard/our-links" || path === "/dashboard/our-links/create"
		}

	];

	return (
		<div className=' min-h-screen flex flex-col gap-2'>
			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger className=' px-2 py-4 text-lg'>কর্যে হাসানা</AccordionTrigger>
					<AccordionContent>
						<div className="flex flex-col gap-2">
							{
								hasana.map((item, index) => (
									<Link key={index} className={`px-8 py-3 rounded ${item.active === true ? " bg-color-main text-white" : "hover:bg-color-main hover:text-white"}`} href={item.path}>{item.name}</Link>
								))
							}
						</div>
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-5">
					<AccordionTrigger className=' px-2 py-4 text-lg'>উপকারী</AccordionTrigger>
					<AccordionContent>
						<div className="flex flex-col gap-2">
							{
								beneficial.map((item, index) => (
									<Link key={index} className={`px-8 py-3 rounded ${item.active === true ? " bg-color-main text-white" : "hover:bg-color-main hover:text-white"}`} href={item.path}>{item.name}</Link>
								))
							}
						</div>
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-2">
					<AccordionTrigger className=' px-2 py-4 text-lg'>চাইল্ড</AccordionTrigger>
					<AccordionContent>
						<div className="flex flex-col gap-2">
							{
								child.map((item, index) => (
									<Link key={index} className={`px-8 py-3 rounded ${item.active === true ? " bg-color-main text-white" : "hover:bg-color-main hover:text-white"}`} href={item.path}>{item.name}</Link>
								))
							}
						</div>
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-3">
					<AccordionTrigger className=' px-2 py-4 text-lg'>গ্যালারী</AccordionTrigger>
					<AccordionContent>
						<div className="flex flex-col gap-2">
							{
								gallery.map((item, index) => (
									<Link key={index} className={`px-8 py-3 rounded ${item.active === true ? " bg-color-main text-white" : "hover:bg-color-main hover:text-white"}`} href={item.path}>{item.name}</Link>
								))
							}
						</div>
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-4">
					<AccordionTrigger className=' px-2 py-4 text-lg'>অন্যান্য</AccordionTrigger>
					<AccordionContent>
						<div className="flex flex-col gap-2">
							{
								others.map((item, index) => (
									<Link key={index} className={`px-8 py-3 rounded ${item.active === true ? " bg-color-main text-white" : "hover:bg-color-main hover:text-white"}`} href={item.path}>{item.name}</Link>
								))
							}
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

		</div>
	)
}

export default AdminSidebar