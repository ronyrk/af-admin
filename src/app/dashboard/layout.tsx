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
	// Check if user is authenticated
	const authenticated = await isAuthenticated();

	if (!authenticated) {
		redirect('/');
	}

	return (
		<div className="flex gap-0 min-h-screen bg-background">
			{/* Sidebar */}
			<div className="w-64 border-r border-border">
				<AdminSidebar />
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-auto">
				<main className="p-6 max-w-7xl mx-auto">
					{children}
				</main>
			</div>
		</div>
	);
}
