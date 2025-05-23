import React, { Suspense } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DonorIProps, DonorPaymentIProps } from '@/types';
import { cookies } from 'next/headers';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/components/DeleteButton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ClipboardPenLine } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getSearchDonor } from '@/lib/getSearchDonor';
import SearchBox from '@/components/SearchBox';
import PaginationPart from '@/components/Pagination';


const TotalAmount = async (): Promise<string> => {
	// Ensure cookies are processed (likely for authentication or session validation).
	cookies();

	// Fetch all donor payment records from the database.
	const paymentList = await prisma.donorPayment.findMany();

	// Calculate the total of "LENDING" type payments.
	const totalLending = paymentList
		.filter((item) => item.type === "LENDING")
		.reduce((sum, item) => sum + Number(item.amount), 0);

	// Calculate the total donations where status is "DONOR".
	const totalDonations = paymentList
		.filter((item) => item.type === "DONATE" && item.status === "DONOR")
		.reduce((sum, item) => sum + Number(item.donate || 0), 0);

	// Combine the two totals to get the final result.
	const grandTotal = totalLending + totalDonations;

	// Format the result into a localized format for Bangladesh without decimals.
	const formattedTotal = new Intl.NumberFormat("en-BD", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(grandTotal);

	// Append "/=" to the formatted total.
	return `${formattedTotal}/=`;
};


const calculateRefund = async (): Promise<string> => {
	// Ensure cookies are processed (likely for authentication or session validation).
	cookies();

	// Fetch all donor payment records from the database.
	const paymentList = await prisma.donorPayment.findMany();

	// Calculate the total loan payment.
	const totalRefund = paymentList
		.map((item) => Number(item.loanPayment || 0)) // Convert loanPayment to a number, defaulting to 0 if null/undefined.
		.reduce((sum, current) => sum + current, 0); // Sum up all loan payments.

	// Format the result for Bangladesh without decimals.
	const formattedTotal = new Intl.NumberFormat("en-BD", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(totalRefund);

	// Append "/=" to the formatted total and return.
	return `${formattedTotal}/=`;
};


const TotalDonate = async () => {
	cookies();
	const paymentList = await prisma.donorPayment.findMany();

	const returnArray2 = paymentList.filter((item) => item.type === "DONATE");
	let returnStringArray2: string[] = [];
	returnArray2.forEach((item) => returnStringArray2.push(item.donate as string));
	const returnNumberArray2 = returnStringArray2.map(Number);
	const donate = returnNumberArray2.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
	const formatted = new Intl.NumberFormat('en-IN').format(donate)

	return `${formatted}/=`;
}

const Donate = async (username: string, status: string) => {
	cookies();
	const paymentList = await prisma.donorPayment.findMany({
		where: {
			donorUsername: username
		}
	});

	const returnArray2 = paymentList.filter((item) => item.type === "DONATE");
	let returnStringArray2: string[] = [];
	returnArray2.forEach((item) => returnStringArray2.push(item.donate as string));
	const returnNumberArray2 = returnStringArray2.map(Number);
	const donate = returnNumberArray2.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
	return donate;
}



const TotalLending = async (username: string, status: string) => {
	cookies();
	const paymentList = await prisma.donorPayment.findMany({
		where: {
			donorUsername: username
		}
	});
	const returnArray = paymentList.filter((item) => item.type === "LENDING");
	let returnStringArray: string[] = [];
	returnArray.forEach((item) => returnStringArray.push(item.amount as string));
	const returnNumberArray = returnStringArray.map(Number);
	const total = returnNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

	const returnArray2 = paymentList.filter((item) => item.type === "DONATE");
	let returnStringArray2: string[] = [];
	returnArray2.forEach((item) => returnStringArray2.push(item.donate as string));
	const returnNumberArray2 = returnStringArray2.map(Number);
	const donate = returnNumberArray2.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

	const result = status === "LEADER" ? total : total + donate;

	return result;
}

const TotalRefound = async (username: string, status: string) => {
	cookies();
	const paymentList = await prisma.donorPayment.findMany({
		where: {
			donorUsername: username
		}
	});
	let returnStringArray: string[] = [];
	paymentList.forEach((item) => returnStringArray.push(item.loanPayment as string));
	const returnNumberArray = returnStringArray.map(Number);
	const total = returnNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

	const result = status === "LEADER" ? total : 0;

	return result;
}
const TotalOutstanding = async (): Promise<string> => {
	// Ensure cookies are processed (likely for authentication or session validation).
	cookies();

	// Fetch all donor payment records from the database.
	const paymentList = await prisma.donorPayment.findMany();

	// Calculate total LENDING amount.
	const totalLending = paymentList
		.filter((item) => item.type === "LENDING")
		.reduce((sum, item) => sum + Number(item.amount || 0), 0);

	// Calculate total REFOUND payments.
	const totalRefund = paymentList
		.filter((item) => item.type === "REFOUND")
		.reduce((sum, item) => sum + Number(item.loanPayment || 0), 0);

	// Calculate total DONATE amount for non-DONOR status.
	const totalDonate = paymentList
		.filter((item) => item.type === "DONATE" && item.status !== "DONOR")
		.reduce((sum, item) => sum + Number(item.donate || 0), 0);

	// Calculate the total outstanding amount.
	const result = totalLending - (totalRefund + totalDonate);

	// Format the result for readability.
	const formattedResult = new Intl.NumberFormat("en-BN", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(result);

	// Return the formatted result with "/=" appended.
	return `${formattedResult}/=`;
};


const Outstanding = async (username: string, status: string) => {
	cookies();
	const paymentList = await prisma.donorPayment.findMany({
		where: {
			donorUsername: username
		}
	});
	const returnArray = paymentList.filter((item) => item.type === "LENDING");
	let returnStringArray: string[] = [];
	returnArray.forEach((item) => returnStringArray.push(item.amount as string));
	const returnNumberArray = returnStringArray.map(Number);
	const total = returnNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

	let returnStringArray2: string[] = [];
	paymentList.forEach((item) => returnStringArray2.push(item.loanPayment as string));
	const returnNumberArray2 = returnStringArray2.map(Number);
	const payment = returnNumberArray2.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

	const returnArray3 = paymentList.filter((item) => item.type === "DONATE");
	let returnStringArray3: string[] = [];
	returnArray3.forEach((item) => returnStringArray3.push(item.donate as string));
	const returnNumberArray3 = returnStringArray3.map(Number);
	const donate = returnNumberArray3.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

	const result = status === "LEADER" ? (total - payment) - donate : 0;

	return result;
}
const DonorTotalAmount = async (username: string) => {
	cookies();
	const paymentList = await prisma.donorPayment.findMany({
		where: {
			donorUsername: username
		}
	});
	const returnArray = paymentList.filter((item) => item.type === "LENDING");
	let returnStringArray: string[] = [];
	returnArray.forEach((item) => returnStringArray.push(item.amount as string));
	const returnNumberArray = returnStringArray.map(Number);
	const total = returnNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

	const returnArray3 = paymentList.filter((item) => item.type === "DONATE");
	let returnStringArray3: string[] = [];
	returnArray3.forEach((item) => returnStringArray3.push(item.donate as string));
	const returnNumberArray3 = returnStringArray3.map(Number);
	const donate = returnNumberArray3.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

	return total + donate;
}


async function DonorList({ searchParams }: {
	searchParams?: {
		search?: string,
		page?: string,
	}
}) {
	cookies();
	const query = searchParams?.search || "all";
	const page = searchParams?.page || "1";

	const donors = await getSearchDonor(query, page) as DonorIProps[];

	async function getStatus(status: string) {
		if (status === "LEADER") {
			return "LENDER"
		} else {
			return status
		}
	};


	return (
		<>
			<TableBody>
				{
					donors.map((item, index: number) => (
						<TableRow key={index}>
							<TableCell className="font-medium">{item.code}</TableCell>
							<TableCell className="font-medium uppercase">{item.name}</TableCell>
							<TableCell className="font-medium uppercase">{getStatus(item.status)}</TableCell>
							<TableCell className="font-medium uppercase">{TotalLending(item.username, item.status)}</TableCell>
							<TableCell className="font-medium uppercase">{TotalRefound(item.username, item.status)}</TableCell>
							<TableCell className="font-medium uppercase">{Donate(item.username, item.status)}</TableCell>
							<TableCell className="font-medium uppercase">{Outstanding(item.username, item.status)}</TableCell>
							<TableCell className="font-medium uppercase">
								<Button className=' bg-color-main' variant={"outline"} size={"sm"} asChild>
									<Link href={`donor/${item.username}`}><ClipboardPenLine /></Link>
								</Button>
							</TableCell>
							<TableCell className="font-medium uppercase">
								<DeleteButton type='donor' username={item.username} />
							</TableCell>
						</TableRow>
					))
				}
			</TableBody>
		</>
	)
};



async function page({ searchParams }: {
	searchParams?: {
		search?: string,
		page?: string,
	}
}) {
	const length = (await prisma.donor.findMany()).length;
	return (
		<div className='flex flex-col'>
			<h2 className="text-xl text-center">Donor List</h2>
			<div className="flex justify-between p-2 ">
				<Button asChild>
					<Link className=' bg-color-main hover:bg-color-sub' href={`donor/create`}>Donor Create</Link>
				</Button>
				<SearchBox />
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>CODE</TableHead>
						<TableHead className='w-[200px]'>NAME</TableHead>
						<TableHead>TYPE</TableHead>
						<TableHead className=' uppercase'>amount</TableHead>
						<TableHead className=' uppercase'>Refound</TableHead>
						<TableHead className=' uppercase'>donate</TableHead>
						<TableHead className=' uppercase' >Outstanding</TableHead>
						<TableHead>UPDATED</TableHead>
						<TableHead>DELETED</TableHead>
					</TableRow>
				</TableHeader>
				<Suspense fallback={<h2 className='p-4 text-center '>Loading...</h2>} >
					<DonorList searchParams={searchParams} />
				</Suspense>
				<TableFooter>
					<TableRow>
						<TableCell colSpan={3}>Total</TableCell>
						<TableCell >{TotalAmount()}</TableCell>
						<TableCell >{calculateRefund()}</TableCell>
						<TableCell >{TotalDonate()}</TableCell>
						<TableCell >{TotalOutstanding()}</TableCell>
					</TableRow>
				</TableFooter>
			</Table>

			<div className="flex justify-center py-4">
				<PaginationPart item={10} data={length} />
			</div>
		</div>
	)
}

export default page