import { ParamsIProps } from "@/types";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'
// Single branch
export const GET = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;

		const result = await prisma.branch.findUnique({ where: { username } })
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Server Error");
	}
};

// Single branch Updated

export const PATCH = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;
		const body = await request.json();
		const { password, branchName, address, photoUrl, teamLeaderName, teamLeaderAddress, teamLeaderPhone, teamLeaderOccupation, teamLeaderPhotoUrl, presidentName, presidentAddress, presidentPhone, presidentOccupation, ImamName, ImamAddress, ImamPhone, ImamOccupation, SecretaryName, SecretaryAddress, SecretaryPhone, SecretaryOccupation, district, ps } = body;
		const result = await prisma.branch.update({
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

// Deleted branch
export const DELETE = async (request: Request, { params }: ParamsIProps) => {
	try {
		const { username } = params;

		const loanList = await prisma.loan.findMany({
			where: {
				branch: username
			}
		});
		for (const loans of loanList) {
			await prisma.request.deleteMany({
				where: {
					loanusername: loans.username,
				}
			});
			await prisma.payment.deleteMany({
				where: {
					loanusername: loans.username,
				}
			});
		};
		await prisma.loan.deleteMany({
			where: {
				branch: username
			}
		});
		await prisma.member.deleteMany({
			where: {
				branch: username,
			}
		});
		await prisma.branch.delete({ where: { username } });
		return NextResponse.json({ message: "deleted successfully" });
	} catch (error) {
		return NextResponse.json({ error });
	}
}
