import React from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import Image from 'next/image';
import icon from "../../../public/divider.svg";

const TotalOutstanding = async (): Promise<string> => {
	// Ensure cookies are processed (likely for authentication or session validation).
	cookies();

	// Fetch all donor payment records from the database.
	const paymentList = await prisma.donorPayment.findMany();

	// Calculate total DONATE amount.
	const donate = paymentList
		.filter((item) => item.type === "DONATE")
		.reduce((sum, item) => sum + Number(item.donate || 0), 0);

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
	const totalAmount = result + donate;

	// Format the result for readability.
	const formattedResult = new Intl.NumberFormat("en-BN", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(totalAmount);
	console.log(result, donate, totalAmount);

	// Return the formatted result with "/=" appended.
	return `BDT=${formattedResult}/=`;
};


function page() {
	return (
		<div className='mx-40 my-20'>
			<div className='flex flex-col items-center justify-center gap-2 mb-5'>
				<h1 className="py-2 text-xl font-semibold text-center border-dotted text-color-main">Our Fund Summary</h1>
				<Image sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" src={icon} alt='icon' />
			</div>
			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[100px]">Categories</TableHead>
							<TableHead className="text-right"> Available balance</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="font-medium">কর্জে হাসনা</TableCell>
							<TableCell className="text-right">{TotalOutstanding()}</TableCell>
						</TableRow>
					</TableBody>
				</Table>

			</Card>

		</div>
	)
}

export default page