'use server';

import { cookies } from 'next/headers';
import prisma from "./prisma";

export async function approvedRequest(id: string, loanusername: string, photoUrl: string, method: string, createAt: Date, amount: string) {
	const loanAmount = "0";
	try {
		cookies();
		const approved = await prisma.payment.create({
			data: {
				loanusername, createAt, amount, loanAmount
			}
		});
		const removed = await prisma.request.delete({ where: { id } });
		// console.log(approved, '#', removed)
		return { message: "successfully" };
	} catch (error) {
		console.log(error);
	}

}
export async function ApproveProjectRequest(item: any) {

	try {
		// console.log(item, "log");
		cookies();
		const { id, name, email, amount, photoUrl, about, method, type, sendNumber, transaction, projectName } = item;
		await prisma.projectDonateRequest.create({
			data: {
				name, email, amount, photoUrl, about, method, type, sendNumber, transaction, projectName
			}
		})
		const removed = await prisma.projectDonateRequest.delete({ where: { id } });
	} catch (error) {
		console.log(error);
	}

}
export async function ApproveChildSponsor(item: any) {

	try {
		// console.log(item, "log");
		cookies();
		const { id, name, email, amount, photoUrl, about, method, type, transaction, sendNumber, childName } = item;
		await prisma.childsDonate.create({
			data: {
				name, email, amount, photoUrl, about, method, type, transaction, sendNumber, childName
			}
		})
		const removed = await prisma.childsDonateRequest.delete({ where: { id } });
	} catch (error) {
		console.log(error);
	}

}