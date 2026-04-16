'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuthContext } from './auth-provider';

interface NavRoute {
	name: string;
	path: string;
}

interface NavSection {
	title: string;
	items: NavRoute[];
}

// ─── Static nav data (outside component — never recreated) ───────────────────

const BRANCH_NAV: NavSection[] = [
	{
		title: 'কর্যে হাসানা',
		items: [
			{ name: 'Summary', path: '/dashboard' },
			{ name: 'Borrowers', path: '/dashboard/borrowers' },
			{ name: 'Donor', path: '/dashboard/donor' },
		],
	},
];

const ADMIN_NAV: NavSection[] = [
	{
		title: 'কর্যে হাসানা',
		items: [
			{ name: 'Summary', path: '/dashboard' },
			{ name: 'Branch', path: '/dashboard/branch' },
			{ name: 'Borrowers', path: '/dashboard/borrowers' },
			{ name: 'Donor', path: '/dashboard/donor' },
			{ name: 'Borrowers Payment Pending', path: '/dashboard/pending' },
			{ name: 'Upcoming money refund', path: '/dashboard/up-coming' },
			{ name: 'FAQ', path: '/dashboard/question' },
		],
	},
	{
		title: 'উপকারী',
		items: [
			{ name: 'District', path: '/dashboard/district' },
			{ name: 'Beneficiary Question', path: '/dashboard/beneficiary/about-beneficiary' },
			{ name: 'Beneficiary Donor', path: '/dashboard/beneficiary/donors' },
			{ name: 'Beneficiaries', path: '/dashboard/beneficiaries' },
		],
	},
	{
		title: 'চাইল্ড',
		items: [
			{ name: 'Child', path: '/dashboard/child' },
			{ name: 'Donate', path: '/dashboard/donate' },
			{ name: 'Disbursement', path: '/dashboard/disbursement' },
		],
	},
	{
		title: 'গ্যালারী',
		items: [
			{ name: 'Category', path: '/dashboard/category' },
			{ name: 'Gallery', path: '/dashboard/gallery' },
		],
	},
	{
		title: 'অন্যান্য',
		items: [
			{ name: 'Team Member', path: '/dashboard/owner' },
			{ name: 'Projects', path: '/dashboard/projects' },
			{ name: 'Blog', path: '/dashboard/blog' },
			{ name: 'Branch Member', path: '/dashboard/member' },
			{ name: 'Income', path: '/dashboard/income' },
			{ name: 'Expenses', path: '/dashboard/expenses' },
			{ name: 'Our links', path: '/dashboard/our-links' },
		],
	},
];

// ─── Active-path helper ───────────────────────────────────────────────────────

function isActive(itemPath: string, currentPath: string): boolean {
	// Exact match for root dashboard, prefix match for everything else
	if (itemPath === '/dashboard') return currentPath === '/dashboard';
	return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
}

// ─── Reusable section renderer ────────────────────────────────────────────────

interface NavSectionsProps {
	sections: NavSection[];
	currentPath: string;
}

function NavSections({ sections, currentPath }: NavSectionsProps) {
	return (
		<>
			{sections.map((section, index) => (
				<AccordionItem
					key={section.title + index}
					value={`item-${index}`}
					className="border-none mb-1"
				>
					<AccordionTrigger className="px-3 py-2 text-sm font-semibold hover:bg-accent rounded-md transition-colors duration-200 text-foreground hover:text-foreground no-underline">
						{section.title}
					</AccordionTrigger>

					<AccordionContent className="space-y-1 pb-2 pt-1">
						{section.items.map((item) => {
							const active = isActive(item.path, currentPath);
							return (
								<Link
									key={item.path}
									href={item.path}
									aria-current={active ? 'page' : undefined}
									className={`block px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${active
										? 'bg-primary text-primary-foreground shadow-sm'
										: 'text-muted-foreground hover:text-foreground hover:bg-accent'
										}`}
								>
									{item.name}
								</Link>
							);
						})}
					</AccordionContent>
				</AccordionItem>
			))}
		</>
	);
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────

export default function AdminSidebar() {
	const path = usePathname();
	const { user } = useAuthContext();

	const isBranch = user?.role === 'branch';
	const sections = isBranch ? BRANCH_NAV : ADMIN_NAV;

	return (
		<aside className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-background border-r border-border">
			<nav className="flex flex-col w-full">
				<div className="px-4 py-4 border-b border-border">
					<h2 className="text-lg font-bold text-foreground">Management</h2>
				</div>

				<Accordion type="single" collapsible className="w-full px-2 py-3">
					<NavSections sections={sections} currentPath={path} />
				</Accordion>
			</nav>
		</aside>
	);
}