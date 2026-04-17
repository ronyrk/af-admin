import AdminSidebar from '@/components/AdminSidebar';
import { isAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Admin Dashboard | Arafat Foundation',
	description: 'Admin Dashboard for Arafat Foundation Management',
};

export default async function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const authenticated = await isAuthenticated();
	if (!authenticated) redirect('/');

	return (
		<div className="flex min-h-screen bg-background">
			{/* Sidebar — controls its own width & visibility per breakpoint */}
			<AdminSidebar />

			{/* Main content — takes remaining space, has left padding on mobile for hamburger */}
			<div className="flex-1 overflow-auto min-w-0">
				<main className="p-4 pt-14 lg:p-6 lg:pt-6 max-w-7xl mx-auto">
					{children}
				</main>
			</div>
		</div>
	);
}