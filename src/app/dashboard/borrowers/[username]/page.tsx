import BorrowerProfile from '@/components/BorrowerProfile';
import BorrowersTransaction from '@/components/BorrowersTransaction';
import BorrowerUpdated from '@/components/BorrowersUpdated';
import { LoanIProps, PaymentIProps } from '@/types';
import { cookies } from 'next/headers';
import React from 'react'

async function page({ params }: {
	params: {
		username: string;
	}
}) {
	cookies();
	let res = await fetch(`https://af-admin.vercel.app/api/loan/${params.username}`);
	if (!res.ok) {
		throw new Error("Failed to fetch data list");
	};
	const borrowers: LoanIProps = await res.json();

	const response = await fetch(`https://af-admin.vercel.app/api/loan_list/${params.username}`);
	if (!response.ok) {
		throw new Error("Failed to fetch data");
	}
	const paymentList: PaymentIProps[] = await response.json();
	return (
		<div>
			<BorrowerProfile data={borrowers} paymentList={paymentList} />
			<BorrowersTransaction username={params.username} paymentList={paymentList} data={borrowers} />
		</div>
	)
}

export default page