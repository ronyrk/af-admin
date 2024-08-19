import ChildUpdated from '@/components/ChildUpdated';
import { ChildIProps } from '@/types';
import { cookies } from 'next/headers';
import React from 'react'

async function page({ params }: {
	params: {
		username: string,
	}
}) {
	cookies();
	const res = await fetch(`https://af-admin.vercel.app/api/child/${params.username}`);
	if (!res.ok) {
		throw new Error("Failed to fetch data");
	};
	const payments: ChildIProps = await res.json();
	return (
		<div>
			<ChildUpdated data={payments} />
		</div>
	)
}

export default page