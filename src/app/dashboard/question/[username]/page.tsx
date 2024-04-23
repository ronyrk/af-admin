import FAQUpdated from '@/components/FaqUpdated';
import { FaqProps } from '@/types';
import { unstable_noStore } from 'next/cache';
import React from 'react'

async function page({ params }: {
	params: {
		username: string,
	}
}) {
	unstable_noStore();
	let res = await fetch(`https://af-admin.vercel.app/api/faq/${params.username}`);
	if (!res.ok) {
		throw new Error("Failed to fetch data list");
	};
	const data: FaqProps = await res.json();
	return (
		<div>
			<FAQUpdated data={data} />
		</div>
	)
}

export default page