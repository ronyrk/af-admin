import prisma from "@/lib/prisma";
import { ParamsIProps } from "@/types";
import { NextResponse } from "next/server";

export const GET = async (request: Request, { params }: ParamsIProps) => {
    try {
        const { username } = params;

        // Validate input
        if (!username) {
            return NextResponse.json(
                { error: "Username parameter is required" },
                { status: 400 }
            );
        }

        // Query the database
        const result = await prisma.donorPayment.findMany({
            where: {
                donorUsername: username
            }
        });

        // Handle case where record is not found
        if (!result) {
            return NextResponse.json(
                { error: "Donor payment not found" },
                { status: 404 }
            );
        }

        // Success response
        return NextResponse.json(
            {
                message: "Donor payment retrieved successfully",
                data: result
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching donor payment:", error);

        // Handle different types of errors
        if (error instanceof Error) {
            // Database connection errors, validation errors, etc.
            return NextResponse.json(
                {
                    error: "Failed to retrieve donor payment",
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                },
                { status: 500 }
            );
        }

        // Fallback for unknown errors
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}