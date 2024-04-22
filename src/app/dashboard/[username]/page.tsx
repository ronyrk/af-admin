import BranchUpdated from '@/components/BranchUpdated';
import { BranchIProps } from '@/types';
import { unstable_noStore } from 'next/cache';
import React from 'react'

async function page({ params }: {
	params: {
		username: string
	}
}) {
	unstable_noStore();
	const res = await fetch(`https://af-admin.vercel.app/api/branch/${params.username}`);
	if (!res.ok) {
		throw new Error("Failed to fetch data");
	};
	const data: BranchIProps = await res.json();
	return (
		<div>
			<BranchUpdated data={data} />
		</div>
	)
}

export default page