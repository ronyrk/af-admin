import AdminSidebar from "@/components/AdminSidebar";
import type { Metadata } from "next";


export const metadata: Metadata = {
	title: "Admin DashBoard Arafat Foundation",
	description: "Generated by Rakibul Hasan",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<section className=" p-4 flex flex-row gap-4 min-h-screen ">
			<div className="w-1/4 border-2 rounded-md h-fit">
				<AdminSidebar />
			</div>
			<div className="w-3/4 p-4 border-2 rounded-md">
				{children}
			</div>
		</section>
	);
}