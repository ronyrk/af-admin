'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from "next/cache"
import prisma from "./prisma";
import { DonorIProps, DonorPaymentIProps, DonorPaymentRequestIProps } from '@/types';

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

export async function getDonorPaymentRequests(): Promise<any> {
	// In a real application, you would fetch from a database
	// Example: return await db.entries.findMany()
	const result = await prisma.donor_payment_request.findMany({});
	// For demo purposes, we're returning sample data
	return result as any;
}

export async function deleteDonorPaymentRequest(id: string) {
	try {
		// In a real application, you would delete from your database
		// Example: await db.entries.delete({ where: { id } })

		await prisma.donor_payment_request.delete({
			where: { id },
		});

		// Revalidate the entries page to refresh the data
		revalidatePath("/dashboard/donor/payment-request")

		return { success: true }
	} catch (error) {
		console.error("Error deleting entry:", error)
		return { success: false, error: "Failed to delete entry" }
	}
}

// Approve an entry
export async function approveEntry(entry: DonorPaymentRequestIProps) {
	try {
		const { id, username, amount, createAt, return_date } = entry;

		// Determine returnDate and upComing based on return_date
		let returnDate: Date | null = null;
		let upComing = false;

		if (return_date === "life-time") {
			returnDate = null; // No return date for life-time
			upComing = false;
		} else if (return_date === "6-months") {
			returnDate = new Date(createAt);
			returnDate.setMonth(returnDate.getMonth() + 6); // Add 6 months to createAt
			upComing = true;
		} else if (return_date === "1-years") {
			returnDate = new Date(createAt);
			returnDate.setFullYear(returnDate.getFullYear() + 1); // Add 1 year to createAt
			upComing = true;
		}

		// Create the donor payment entry
		const result = await prisma.donorPayment.create({
			data: {
				donorUsername: username,
				status: return_date === "life-time" ? "DONOR" : "LEADER",
				type: return_date === "life-time" ? "DONATE" : "LENDING",
				donate: return_date === "life-time" ? amount : " ",
				loanPayment: return_date === "life-time" ? amount : " ",
				amount: return_date === "life-time" ? " " : amount,
				returnDate: returnDate,
				upComing: upComing,
				createAt,
			},
		});


		// Delete the original entry
		await prisma.donor_payment_request.delete({
			where: { id },
		});




		// Revalidate the entries page to refresh the data
		revalidatePath("/dashboard/donor/payment-request");

		return { success: true };
	} catch (error) {
		console.error("Error approving entry:", error);
		return { success: false, error: "Failed to approve entry" };
	}
}
export async function getDonorData(username: string) {
	try {
		cookies();
		const donor = await prisma.donor.findUnique({
			where: {
				username: username,
			},
		}) as DonorIProps;

		return {
			success: true,
			data: donor,
		}
	} catch (error) {
		console.error("Error fetching donor data:", error)
		return {
			success: false,
			error: "Failed to fetch donor data",
			data: null,
		}
	}
}