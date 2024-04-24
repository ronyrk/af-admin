import { ChildIProps } from '@/types';
import { unstable_noStore } from 'next/cache';
import React from 'react'

async function page({ params }: {
	params: {
		username: string,
	}
}) {
	unstable_noStore();
	const res = await fetch(`https://af-admin.vercel.app/api/child/${params.username}`);
	if (!res.ok) {
		throw new Error("Failed to fetch data");
	};
	const payments: ChildIProps = await res.json();
	return (
		<div>page</div>
	)
}

export default page