import prisma from "@/lib/prisma"
import { BranchIProps } from "@/types";
import { NextResponse } from "next/server";


export const dynamic = 'force-dynamic'

export const GET = async () => {
	try {
		const result = await prisma.branch.findMany();
		return NextResponse.json(result);
	} catch (error) {
		throw new Error("Server Error");
	}
};

export const POST = async (request: Request) => {
	try {
		const body: BranchIProps = await request.json();
		const { username, email, password, branchName, address, photoUrl, teamLeaderName, teamLeaderAddress, teamLeaderPhone, teamLeaderOccupation, teamLeaderPhotoUrl, presidentName, presidentAddress, presidentPhone, presidentOccupation, ImamName, ImamAddress, ImamPhone, ImamOccupation, SecretaryName, SecretaryAddress, SecretaryPhone, SecretaryOccupation, code, district, ps
		} = body;
		const result = await prisma.branch.create({
			data: {
				username, password, email, branchName, address, photoUrl, teamLeaderName, teamLeaderAddress, teamLeaderPhone, teamLeaderOccupation, teamLeaderPhotoUrl, presidentName, presidentAddress, presidentPhone, presidentOccupation, ImamName, ImamAddress, ImamPhone, ImamOccupation, SecretaryName, SecretaryAddress, SecretaryPhone, SecretaryOccupation, code, district, ps
			}
		});
		return NextResponse.json({ message: "Successfully Branch Created", result }, { status: 201 });
	} catch (error) {
		// throw new Error("Server Error");
		return NextResponse.json({ message: error });
	}
}