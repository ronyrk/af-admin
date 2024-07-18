import ProjectUpdated from '@/components/ProjectUpdated';
import { ProjectsProps } from '@/types';
import { cookies } from 'next/headers';
import React from 'react'

async function page({ params }: {
	params: {
		username: string
	}
}) {
	cookies();
	let res = await fetch(`https://af-admin.vercel.app/api/project/${params.username}`);
	if (!res.ok) {
		throw new Error("Failed to fetch data list");
	};
	const data: ProjectsProps = await res.json();
	return (
		<div>
			<ProjectUpdated data={data} />
		</div>
	)
}

export default page