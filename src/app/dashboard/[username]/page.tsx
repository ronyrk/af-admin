import BranchUpdated from '@/components/BranchUpdated';
import { BranchIProps } from '@/types';
import { cookies } from 'next/headers';
import React from 'react'

async function page({ params }: {
	params: {
		username: string
	}
}) {
	cookies();
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