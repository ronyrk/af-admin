import DonorTable from '@/components/DataTable';
import ProfileEdit from '@/components/ProfileEdit';
import { DonorIProps, DonorPaymentIProps } from '@/types';
import { cookies } from 'next/headers';
import React, { Suspense } from 'react'
import prisma from '@/lib/prisma';

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

	const donorUsername = params.username;

	const paymentList = await prisma.donorPayment.findMany({
		where: {
			donorUsername
		}
	}) as DonorPaymentIProps[];
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