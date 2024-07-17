import BorrowerUpdated from '@/components/BorrowersUpdated';
import { LoanIProps } from '@/types';
import { cookies } from 'next/headers';
import React from 'react'

async function page({ params }: {
	params: {
		username: string;
	}
}) {
	cookies();
	let res = await fetch(`https://arafatfoundation.vercel.app/api/loan/${params.username}`);
	if (!res.ok) {
		throw new Error("Failed to fetch data list");
	};
	const borrowers: LoanIProps = await res.json();
	return (
		<div>
			<BorrowerUpdated data={borrowers} />
		</div>
	)
}

export default page