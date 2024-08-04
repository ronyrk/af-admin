import DonorTable from '@/components/DataTable';
import DonorUpdated from '@/components/DonorUpdated';
import ProfileEdit from '@/components/ProfileEdit';
import { DonorIProps, DonorPaymentIProps } from '@/types';
import { unstable_noStore } from 'next/cache';
import { cookies } from 'next/headers';
import React from 'react'

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
			<div className='flex flex-col gap-3'>
				<ProfileEdit data={data} paymentList={paymentList} />
				<div className="p-4">
					<h2 className="text-[16px] font-normal text-color-main">{data.about} </h2>
				</div>
				<DonorTable data={data} />
			</div>
			<DonorUpdated data={data} />
		</div>
	)
}

export default page