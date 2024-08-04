import DonorTable from '@/components/DataTable';
import DonorUpdated from '@/components/DonorUpdated';
import ProfileEdit from '@/components/ProfileEdit';
import { DonorIProps, DonorPaymentIProps } from '@/types';
import { unstable_noStore } from 'next/cache';
import { cookies } from 'next/headers';
import React, { Suspense } from 'react'

async function page({ params }: {
	params: {
		username: string
	}
}) {
	cookies();
	let res = await fetch(`https://arafatfoundation.vercel.app/api/donor/${params.username}`);
	if (!res.ok) {
		throw new Error("Failed to fetch data");
	};
	const data: DonorIProps = await res.json();

	unstable_noStore();
	const response = await fetch(`https://arafatfoundation.vercel.app/api/donor_payment/donor/${data.username}`);
	if (!response.ok) {
		throw new Error("Failed fetch Data");
	};
	const paymentList: DonorPaymentIProps[] = await response.json();


	return (
		<div>
			<Suspense fallback={<h2>Loading..</h2>}>
				<ProfileEdit data={data} paymentList={paymentList} />
				<DonorTable data={data} />
			</Suspense>
		</div>
	)
}

export default page