import DonorTable from '@/components/DataTable';
import DonorUpdated from '@/components/DonorUpdated';
import { DonorIProps, DonorPaymentIProps } from '@/types';
import { unstable_noStore } from 'next/cache';
import { cookies } from 'next/headers';
import Image from 'next/image';
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
	const response = await fetch(`https://arafatfoundation.vercel.app/api/donor_payment/donor/${params.username}`);
	if (!res.ok) {
		throw new Error("Failed fetch Data");
	};
	const paymentList: DonorPaymentIProps[] = await response.json();

	const TotalAmount = async () => {
		if (data.status === "LEADER") {
			const returnArray = paymentList.filter((item) => item.type === "return");
			let returnStringArray: string[] = [];
			returnArray.forEach((item) => returnStringArray.push(item.loanPayment));
			const returnNumberArray = returnStringArray.map(Number);
			const totalReturn = returnNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

			const increaseArray = paymentList.filter((item) => item.type === "increase");
			let increaseStringArray: string[] = [];
			increaseArray.forEach((item) => increaseStringArray.push(item.amount));
			const increaseNumberArray = increaseStringArray.map(Number);
			const totalIncrease = increaseNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
			return totalIncrease - totalReturn;
		} else {
			let amountStringArray: string[] = [];
			const Create = paymentList.forEach((item) => amountStringArray.push(item.amount));
			// Convert String Array to Number Array
			let AmountArray = amountStringArray.map(Number);
			const totalAmount = AmountArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
			// console.log(totalAmount, 'number array');
			return `${totalAmount}`
		}

	}
	async function getStatus(status: string) {
		if (status === "LEADER") {
			return "LENDER"
		} else {
			return status
		}
	};

	return (
		<div>
			<div className='flex flex-col gap-3'>
				<div className="flex md:flex-row flex-col justify-between gap-3 px-2">
					<div className=" basis-3/12 border-[2px] p-2 flex justify-around relative rounded">
						<Image sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className=' rounded-md object-cover' src={data.photoUrl} alt={data.name} width={260} height={140} />
						<span className=" absolute top-3 bg-white left-2 border-[2px] text-[13px] lowercase font-normal p-[2px] rounded">{getStatus(data.status)}</span>
					</div>
					<div className="basis-9/12 border-[2px] rounded p-1 px-2 flex flex-col justify-around">
						<h2 className=" font-semibold text-xl py-1  text-color-main">{data.name}</h2>
						<h2 className=" font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">Lives in :</span>{data.lives} </h2>
						<h2 className=" font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">Home town:</span>{data.hometown}</h2>
						<h2 className=" font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">{data.status === "LEADER" ? "Total Lending" : "Total Donation"} :- </span>{TotalAmount()}</h2>
					</div>
				</div>
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