import { ParamsIdIProps, PaymentIProps } from "@/types";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export const dynamic = 'force-dynamic'

export const POST = async (request: Request, { params }: ParamsIdIProps) => {
	try {
		const { id } = params;
		const loanAmount = "0";
		const body: PaymentIProps = await request.json();
		const { loanusername, amount, createAt } = body;
		const payment = await prisma.payment.create({
			data: {
				loanusername, amount, createAt, loanAmount
			}
		});
		const deleted = await prisma.request.delete({
			where: {
				id
			}
		});
		return NextResponse.json({ message: "payment request approved Successfully", payment });
	} catch (error) {
		return NextResponse.json({ message: error });
	}
};

export const DELETE = async (request: Request, { params }: ParamsIdIProps) => {
	try {
		const { id } = params;
		await prisma.request.delete({
			where: {
				id
			}
		});
		return NextResponse.json({ message: "Payment Request Deleted" })
	} catch (error) {
		return NextResponse.json({ error });
	}
}