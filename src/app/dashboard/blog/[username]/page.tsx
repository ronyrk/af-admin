import BlogUpdated from '@/components/BlogUpdated';
import { NewsProps } from '@/types';
import { cookies } from 'next/headers';
import React from 'react'

async function page({ params }: {
	params: {
		username: string
	}
}) {
	cookies();
	let res = await fetch(`https://af-admin.vercel.app/api/news/${params.username}`);
	if (!res.ok) {
		throw new Error("Failed to fetch data list");
	};
	const data: NewsProps = await res.json();
	// console.log({ data });
	return (
		<div>
			<BlogUpdated data={data} />
		</div>
	)
}

export default page