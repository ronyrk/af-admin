'use server';

import { unstable_noStore } from "next/cache";
import prisma from "./prisma";

export async function approvedRequest(id: string, loanusername: string, photoUrl: string, method: string, createAt: Date, amount: string) {
	try {
		unstable_noStore();
		const approved = await prisma.payment.create({
			data: {
				loanusername, photoUrl, method, createAt, amount
			}
		});
		const removed = await prisma.request.delete({ where: { id } });
		console.log(approved, '#', removed)
		return { message: "successfully" };
	} catch (error) {
		console.log(error);
	}

}
export async function ApproveChildSponsor(item: any) {

	try {
		// console.log(item, "log");
		unstable_noStore();
		const { id, name, username, email, amount, method, photoUrl, about, createAt } = item;
		await prisma.donation.create({
			data: {
				name, username, email, amount, method, photoUrl, about, createAt
			}
		})
		const removed = await prisma.donationChild.delete({ where: { id } });
	} catch (error) {
		console.log(error);
	}

}