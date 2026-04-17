'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
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

function isActive(itemPath: string, currentPath: string): boolean {
	if (itemPath === '/dashboard') return currentPath === '/dashboard';
	return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
}

interface NavSectionsProps {
	sections: NavSection[];
	currentPath: string;
	onNavClick?: () => void;
}

function NavSections({ sections, currentPath, onNavClick }: NavSectionsProps) {
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
									onClick={onNavClick}
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

// ─── Sidebar inner content (shared between desktop & mobile drawer) ───────────

interface SidebarContentProps {
	sections: NavSection[];
	currentPath: string;
	onNavClick?: () => void;
}

function SidebarContent({ sections, currentPath, onNavClick }: SidebarContentProps) {
	return (
		<nav className="flex flex-col w-full">
			<div className="px-4 py-4 border-b border-border">
				<h2 className="text-lg font-bold text-foreground">Management</h2>
			</div>
			<Accordion type="single" collapsible className="w-full px-2 py-3">
				<NavSections sections={sections} currentPath={currentPath} onNavClick={onNavClick} />
			</Accordion>
		</nav>
	);
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────

export default function AdminSidebar() {
	const path = usePathname();
	const { user } = useAuthContext();
	const [drawerOpen, setDrawerOpen] = useState(false);

	const isBranch = user?.role === 'branch';
	const sections = isBranch ? BRANCH_NAV : ADMIN_NAV;

	// Close drawer on route change
	useEffect(() => {
		setDrawerOpen(false);
	}, [path]);

	// Prevent body scroll when drawer is open
	useEffect(() => {
		if (drawerOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => { document.body.style.overflow = ''; };
	}, [drawerOpen]);

	return (
		<>
			{/* ── Mobile hamburger button ── */}
			<button
				className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border border-border shadow-sm"
				onClick={() => setDrawerOpen((v) => !v)}
				aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
			>
				{drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
			</button>

			{/* ── Mobile backdrop ── */}
			{drawerOpen && (
				<div
					className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
					onClick={() => setDrawerOpen(false)}
				/>
			)}

			{/* ── Mobile drawer ── */}
			<aside
				className={`
          lg:hidden fixed top-0 left-0 z-40 h-full w-72 bg-background border-r border-border
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
			>
				{/* Top padding so content clears the hamburger button */}
				<div className="pt-14">
					<SidebarContent
						sections={sections}
						currentPath={path}
						onNavClick={() => setDrawerOpen(false)}
					/>
				</div>
			</aside>

			{/* ── Desktop sidebar ── */}
			<aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-background border-r border-border">
				<SidebarContent sections={sections} currentPath={path} />
			</aside>
		</>
	);
}