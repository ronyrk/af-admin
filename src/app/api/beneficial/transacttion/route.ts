import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BeneficialTransactionIProps } from "@/types";

export const dynamic = 'force-dynamic'

// Create Beneficial Transaction
export const POST = async (request: Request) => {
    try {
        // Parse and validate request body
        const body: BeneficialTransactionIProps = await request.json();
        const { beneficialDonorId, amount, beneficialId, date, description, paymentType } = body;

        // Basic validation
        if (!beneficialDonorId || !amount || !paymentType) {
            return NextResponse.json(
                {
                    message: "Missing required fields: beneficialDonorId, amount, and paymentType are required",
                    error: "VALIDATION_ERROR"
                },
                { status: 400 }
            );
        }

        // Validate amount is positive
        if (Number(amount) <= 0) {
            return NextResponse.json(
                {
                    message: "Amount must be greater than zero",
                    error: "INVALID_AMOUNT"
                },
                { status: 400 }
            );
        }

        // Create the beneficial transaction
        const result = await prisma.beneficialTransaction.create({
            data: {
                beneficialDonorId,
                amount: String(amount),
                paymentType,
                beneficialId,
                description: description,
                date: date || new Date() // Use provided date or current date
            }
        });

        return NextResponse.json(
            {
                message: " transaction created successfully",
                data: result
            },
            { status: 201 } // 201 for successful creation
        );

    } catch (error: any) {
        console.error('Transaction Creation Error:', error);

        // Handle JSON parsing errors
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                {
                    message: "Invalid JSON format in request body",
                    error: "INVALID_JSON"
                },
                { status: 400 }
            );
        }

        // Handle Prisma-specific errors
        if (error?.code) {
            switch (error.code) {
                case 'P2002': // Unique constraint violation
                    const target = error?.meta?.target || 'field';
                    return NextResponse.json(
                        {
                            message: `A record with this ${Array.isArray(target) ? target.join(', ') : target} already exists`,
                            error: "DUPLICATE_ENTRY",
                            field: target
                        },
                        { status: 409 } // 409 Conflict
                    );

                case 'P2003': // Foreign key constraint violation
                    return NextResponse.json(
                        {
                            message: "Referenced record does not exist. Please check beneficialDonorId and beneficialId",
                            error: "FOREIGN_KEY_VIOLATION"
                        },
                        { status: 400 }
                    );

                case 'P2025': // Record not found
                    return NextResponse.json(
                        {
                            message: "Referenced record not found",
                            error: "RECORD_NOT_FOUND"
                        },
                        { status: 404 }
                    );

                case 'P2011': // Null constraint violation
                    return NextResponse.json(
                        {
                            message: "Required field cannot be null",
                            error: "NULL_CONSTRAINT_VIOLATION",
                            field: error?.meta?.target
                        },
                        { status: 400 }
                    );

                default:
                    // Other Prisma errors
                    return NextResponse.json(
                        {
                            message: "Database operation failed",
                            error: "DATABASE_ERROR",
                            code: error.code
                        },
                        { status: 500 }
                    );
            }
        }

        // Handle other specific error types
        if (error.name === 'ValidationError') {
            return NextResponse.json(
                {
                    message: "Validation failed",
                    error: "VALIDATION_ERROR",
                    details: error.message
                },
                { status: 400 }
            );
        }

        // Generic server error for unexpected errors
        return NextResponse.json(
            {
                message: "An unexpected error occurred while creating the beneficial transaction",
                error: "INTERNAL_SERVER_ERROR"
            },
            { status: 500 }
        );
    }
}