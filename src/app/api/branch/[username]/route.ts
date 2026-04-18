import { ParamsIProps } from "@/types";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'
// Single branch
export const GET = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;

		const result = await prisma.branchList.findUnique({
			where: { username }
		});
		return NextResponse.json(result);
	} catch (error) {
		console.log(error);
		return NextResponse.json({ message: "Branch Get Failed" });
	}
};

// Single branch Updated

export const PATCH = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;
		const body = await request.json();
		const { password, branchName, address, photoUrl, teamLeaderName, teamLeaderAddress, teamLeaderPhone, teamLeaderOccupation, teamLeaderPhotoUrl, presidentName, presidentAddress, presidentPhone, presidentOccupation, ImamName, ImamAddress, ImamPhone, ImamOccupation, SecretaryName, SecretaryAddress, SecretaryPhone, SecretaryOccupation, district, ps } = body;
		const result = await prisma.branchList.update({
			where: {
				username
			},
			data: {
				password, branchName, address, photoUrl, teamLeaderName, teamLeaderAddress, teamLeaderPhone, teamLeaderOccupation, teamLeaderPhotoUrl, presidentName, presidentAddress, presidentPhone, presidentOccupation, ImamName, ImamAddress, ImamPhone, ImamOccupation, SecretaryName, SecretaryAddress, SecretaryPhone, SecretaryOccupation, district, ps
			}
		});
		return NextResponse.json({ message: "successfully updated", result })
	} catch (error) {
		return NextResponse.json({ error });
	}
};

export const DELETE = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;

		// 1. Verify branch exists + fetch related usernames
		const branch = await prisma.branchList.findUnique({
			where: { username },
			select: {
				username: true,
				borrowers: { select: { username: true } },
				donorLists: { select: { username: true } },
			},
		});

		if (!branch) {
			return NextResponse.json({ error: "Branch not found" }, { status: 404 });
		}

		const borrowerUsernames = branch.borrowers.map((b) => b.username);
		const donorUsernames = branch.donorLists.map((d) => d.username);

		// 2. Sequential transaction — order guaranteed
		const result = await prisma.$transaction(async (tx) => {
			// Step 1: Delete borrower payments first (child of borrowers)
			if (borrowerUsernames.length > 0) {
				await tx.payment.deleteMany({
					where: { loanusername: { in: borrowerUsernames } },
				});
			}

			// Step 2: Delete donor payments first (child of donors)
			if (donorUsernames.length > 0) {
				await tx.donorPayment.deleteMany({
					where: { donorUsername: { in: donorUsernames } },
				});
			}

			// Step 3: Delete borrowers (child of branch)
			await tx.borrowers.deleteMany({
				where: { branch: username },
			});

			// Step 4: Delete donors (child of branch)
			await tx.donorList.deleteMany({
				where: { branch: username },
			});

			// Step 5: Delete branch itself (root)
			await tx.branchList.delete({
				where: { username },
			});
		});

		console.log({ result })

		return NextResponse.json({
			message: "Branch and all related data deleted successfully",
		});
	} catch (error) {
		console.error("Delete branch error:", error);
		return NextResponse.json(
			{ error: "Failed to delete branch" },
			{ status: 500 }
		);
	}
};