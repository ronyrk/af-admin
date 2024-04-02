'use server';

import prisma from "./prisma";

export async function deleteRequest(item: any) {
	try {
		const { id, loanusername, photoUrl, method, createAt, amount } = item;
		const approved = await prisma.payment.create({
			data: {
				loanusername, photoUrl, method, createAt, amount
			}
		});
		const removed = await prisma.donationChild.delete({ where: { id } });
	} catch (error) {
		console.log(error);
	}

}
export async function ApproveChildSponsor(item: any) {
	try {
		// console.log(item, "log");
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