import { DonorPaymentIProps } from "@/types";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export const POST = async (request: Request) => {
	try {
		const body: DonorPaymentIProps = await request.json();
		const { amount, donorUsername, loanPayment, type, createAt, paymentDate } = body;
		const result = await prisma.donorPayment.create({
			data: {
				amount, donorUsername, loanPayment, type, createAt
			}
		});
		await prisma.donor.update({
			where: {
				username: donorUsername
			},
			data: {
				paymentDate
			}
		});
		return NextResponse.json(result);
	} catch (error) {
		console.log(error, "server error");
		return NextResponse.json(error);
	};
};

export const GET = async () => {
	try {
		const result = await prisma.donorPayment.findMany();
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Server Error")
	}
}