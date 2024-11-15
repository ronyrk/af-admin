import DonorTable from '@/components/DataTable';
import ProfileEdit from '@/components/ProfileEdit';
import { DonateInfo } from '@/lib/donateInfo';
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
	let res = await fetch(`https://af-admin.vercel.app/api/donor/${params.username}`);
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

	const donateList = await DonateInfo(params.username);


	return (
		<div>
			<Suspense fallback={<h2>Loading..</h2>}>
				<ProfileEdit donateList={donateList} data={data} paymentList={paymentList} />
				<DonorTable username={params.username} data={data} />
			</Suspense>
		</div>
	)
}

export default page