import React, { Suspense } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DonorIProps, DonorPaymentIProps } from '@/types';
import { unstable_noStore } from 'next/cache';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/components/DeleteButton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


async function DonorList() {
	unstable_noStore();
	let res = await fetch('https://arafatfoundation.vercel.app/api/donor');
	if (!res.ok) {
		throw new Error("Failed to fetch data");
	};
	const donors: DonorIProps[] = await res.json();


	const TotalAmount = async (status: string, username: string, amount: string) => {
		unstable_noStore();
		const response = await fetch(`https://arafatfoundation.vercel.app/api/donor_payment/donor/${username}`);
		if (!response.ok) {
			throw new Error("Failed fetch Data");
		};
		const paymentList: DonorPaymentIProps[] = await response.json();
		if (status === "LEADER") {
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
		<TableBody>
			{
				donors.map((item, index: number) => (
					<TableRow key={index}>
						<TableCell className="font-medium">{item.code}</TableCell>
						<TableCell className="font-medium uppercase">{item.name}</TableCell>
						<TableCell className="font-medium uppercase" >{TotalAmount(item.status, item.username, item.amount)}</TableCell>
						<TableCell className="font-medium uppercase">{getStatus(item.status)}</TableCell>
						<TableCell className="font-medium">{item.email}</TableCell>
						<TableCell className="font-medium">{item.password}</TableCell>
						<TableCell className="font-medium uppercase">
							<Button className=' bg-color-main' variant={"outline"} size={"sm"} asChild>
								<Link href={`donor/${item.username}`}>Updated</Link>
							</Button>
						</TableCell>
						<TableCell className="font-medium uppercase">
							<DeleteButton type='donor' username={item.username} />
						</TableCell>
					</TableRow>
				))
			}
		</TableBody>
	)
};



async function page() {
	return (
		<div className='flex flex-col'>
			<h2 className="text-xl text-center">Donor List</h2>
			<div className="flex justify-between p-2 ">
				<Button asChild>
					<Link className=' bg-color-main hover:bg-color-sub' href={`donor/create`}>Donor Create</Link>
				</Button>
				<Button asChild>
					<Link className=' bg-color-main hover:bg-color-sub' href={`donor/payment`}>Donor Payment List</Link>
				</Button>
				<Input className='w-64' type="text" placeholder="Search" />
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>CODE</TableHead>
						<TableHead className='w-[300px]'>NAME</TableHead>
						<TableHead>AMOUNT</TableHead>
						<TableHead>TYPE</TableHead>
						<TableHead>EMAIL</TableHead>
						<TableHead>PASSWORD</TableHead>
						<TableHead>UPDATED</TableHead>
						<TableHead>DELETED</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense fallback={<h2 className='p-4 text-center '>Loading...</h2>} >
					<DonorList />
				</Suspense>
			</Table>

		</div>
	)
}

export default page