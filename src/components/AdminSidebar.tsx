'use client';
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import React, { useMemo } from 'react'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"

interface NavRoute {
	name: string;
	path: string;
	active: boolean;
}

interface NavSection {
	title: string;
	items: NavRoute[];
}

function AdminSidebar() {
	const path = usePathname();
	const route = path.split('/');

	// Memoize route data to prevent unnecessary recalculations
	const navSections = useMemo<NavSection[]>(() => [
		{
			title: 'কর্যে হাসানা',
			items: [
				{ name: "Summary", path: "/dashboard", active: path === '/dashboard' },
				{ name: "Branch", path: "/dashboard/branch", active: path === '/dashboard/branch' || path === '/dashboard/branch/branch_create' },
				{ name: "Borrowers", path: "/dashboard/borrowers", active: route.at(2) === 'borrowers' },
				{ name: "Donor", path: "/dashboard/donor", active: route.at(2) === 'donor' },
				{ name: "Borrowers Payment Pending", path: "/dashboard/pending", active: path === '/dashboard/pending' },
				{ name: "Upcoming money refund", path: "/dashboard/up-coming", active: path === '/dashboard/up-coming' },
				{ name: "FAQ", path: "/dashboard/question", active: path === "/dashboard/question" || path === "/dashboard/question/create" }
			]
		},
		{
			title: 'উপকারী',
			items: [
				{ name: "District", path: "/dashboard/district", active: path === "/dashboard/district" },
				{ name: "Beneficiary Question", path: "/dashboard/beneficiary/about-beneficiary", active: path === "/dashboard/beneficiary/about-beneficiary" || path === "/dashboard/beneficiary/about-beneficiary/create" },
				{ name: "Beneficiary Donor", path: "/dashboard/beneficiary/donors", active: path === "/dashboard/beneficiary/donors" || path === "/dashboard/beneficiaries/donor/create" },
				{ name: "Beneficiaries", path: "/dashboard/beneficiaries", active: path === "/dashboard/beneficiaries" || path === "/dashboard/beneficiaries/create" }
			]
		},
		{
			title: 'চাইল্ড',
			items: [
				{ name: "Child", path: "/dashboard/child", active: path === "/dashboard/child" || path === "/dashboard/child/create" || path === "/dashboard/child/donation" || path === "/dashboard/child/pending" },
				{ name: "Donate", path: "/dashboard/donate", active: path === "/dashboard/donate" },
				{ name: "Disbursement", path: "/dashboard/disbursement", active: path === "/dashboard/disbursement" || path === "/dashboard/disbursement/create" }
			]
		},
		{
			title: 'গ্যালারী',
			items: [
				{ name: "Category", path: "/dashboard/category", active: path === "/dashboard/category" || path === "/dashboard/category/create" },
				{ name: "Gallery", path: "/dashboard/gallery", active: path === "/dashboard/gallery" || path === "/dashboard/gallery/create" }
			]
		},
		{
			title: 'অন্যান্য',
			items: [
				{ name: "Team Member", path: "/dashboard/owner", active: path === "/dashboard/owner" || path === "/dashboard/owner/create" },
				{ name: "Projects", path: "/dashboard/projects", active: path === "/dashboard/projects" || path === "/dashboard/projects/create" },
				{ name: "Blog", path: "/dashboard/blog", active: path === "/dashboard/blog" || path === "/dashboard/blog/create" },
				{ name: "Branch Member", path: "/dashboard/member", active: path === "/dashboard/member" },
				{ name: "Income", path: "/dashboard/income", active: path === "/dashboard/income" || path === "/dashboard/income/create" },
				{ name: "Expenses", path: "/dashboard/expenses", active: path === "/dashboard/expenses" || path === "/dashboard/expenses/create" },
				{ name: "Our links", path: "/dashboard/our-links", active: path === "/dashboard/our-links" || path === "/dashboard/our-links/create" }
			]
		}
	], [path, route]);

	return (
		<aside className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-background border-r border-border">
			<nav className="flex flex-col w-full">
				<div className="px-4 py-4 border-b border-border">
					<h2 className="text-lg font-bold text-foreground">Management</h2>
				</div>

				<Accordion type="single" collapsible className="w-full px-2 py-3">
					{navSections.map((section, index) => (
						<AccordionItem
							key={index}
							value={`item-${index}`}
							className="border-none mb-1"
						>
							<AccordionTrigger className="px-3 py-2 text-sm font-semibold hover:bg-accent rounded-md transition-colors duration-200 text-foreground hover:text-foreground no-underline">
								{section.title}
							</AccordionTrigger>

							<AccordionContent className="space-y-1 pb-2 pt-1">
								{section.items.map((item) => (
									<Link
										key={item.path}
										href={item.path}
										className={`block px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${item.active
											? 'bg-primary text-primary-foreground shadow-sm'
											: 'text-muted-foreground hover:text-foreground hover:bg-accent'
											}`}
										aria-current={item.active ? 'page' : undefined}
									>
										{item.name}
									</Link>
								))}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</nav>
		</aside>
	)
}

export default AdminSidebar