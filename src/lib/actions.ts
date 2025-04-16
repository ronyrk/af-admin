'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from "next/cache"
import prisma from "./prisma";
import { DonorPaymentIProps, DonorPaymentRequestIProps } from '@/types';

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
		// console.log(error);
	}

}
export async function ApproveProjectRequest(item: any) {

	try {
		cookies();
		const { id, name, email, amount, photoUrl, about, method, type, sendNumber, transaction, projectName } = item;
		await prisma.donate.create({
			data: {
				name, email, amount, photoUrl, about, method, type, sendNumber, transaction, projectName
			}
		})
		const removed = await prisma.projectDonateRequest.delete({ where: { id } });
	} catch (error) {
		// console.log(error);
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
		// console.log(error);
	}

}


// Define the data entry type

// Server action to fetch all entries
export async function fetchEntries() {
	cookies();
	const request = await prisma.donor_request.findMany({}) as any;
	return request;
	// Simulate network delay
}

// Server action to delete an entry
export async function deleteEntry(id: string) {
	try {
		cookies();
		// Find the entry by ID
		await prisma.donor_request.delete({
			where: { id },
		})

		// Revalidate the data
		revalidatePath("/dashboard/donor/request")

		return { success: true }
	} catch (error) {
		console.error("Error deleting entry:", error)
		return { success: false, error: "Failed to delete entry" }
	}
}

export async function getEntries(): Promise<DonorPaymentIProps[]> {
	// In a real application, you would fetch from a database
	// Example: return await db.entries.findMany()
	const result = await prisma.donor_payment_request.findMany({});
	// For demo purposes, we're returning sample data
	return result as any;
}

// Get a single entry by ID
export async function getEntry(id: string): Promise<DonorPaymentIProps | null> {
	// In a real application, you would fetch from a database
	// Example: return await db.entries.findUnique({ where: { id } })

	// For demo purposes, we're searching in sample data
	return await prisma.donor_payment_request.findUnique({
		where: { id }
	}) as any;
}
