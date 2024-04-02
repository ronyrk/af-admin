import type { Metadata } from "next";


export const metadata: Metadata = {
	title: "Admin DashBoard Arafat Foundation",
	description: "Generated by Rakibul Hasan",
};

export default function ChildLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<section className="p-2 flex flex-col gap-2">
			<h2 className="text-center text-xl">Child</h2>
			{children}
		</section>
	);
}