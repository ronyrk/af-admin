import { ProjectsProps } from '@/types';
import { unstable_noStore } from 'next/cache';
import React from 'react'

async function page({ params }: {
	params: {
		username: string
	}
}) {
	unstable_noStore();
	let res = await fetch(`https://af-admin.vercel.app/api/project/${params.username}`);
	if (!res.ok) {
		throw new Error("Failed to fetch data list");
	};
	const data: ProjectsProps = await res.json();
	return (
		<div>page</div>
	)
}

export default page