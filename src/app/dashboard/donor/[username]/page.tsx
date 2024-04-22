import DonorUpdated from '@/components/DonorUpdated';
import { DonorIProps } from '@/types';
import { unstable_noStore } from 'next/cache';
import React from 'react'

async function page({ params }: {
	params: {
		username: string
	}
}) {
	unstable_noStore();
	let res = await fetch(`https://arafatfoundation.vercel.app/api/donor/${params.username}`);
	if (!res.ok) {
		throw new Error("Failed to fetch data");
	};
	const donors: DonorIProps = await res.json();
	return (
		<div>
			<DonorUpdated data={donors} />
		</div>
	)
}

export default page