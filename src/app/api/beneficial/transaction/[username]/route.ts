import { ParamsIProps } from "@/types";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'

// Delete beneficial transaction
export const DELETE = async (request: Request, { params }: ParamsIProps) => {
    try {
        const { username } = params;

        // Validate that ID parameter exists
        if (!username) {
            return NextResponse.json(
                {
                    message: "Transaction ID is required",
                    error: "MISSING_ID"
                },
                { status: 400 }
            );
        }

        // For string/UUID IDs, validate format (adjust regex as needed)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (typeof username !== 'string' || username.length === 0) {
            return NextResponse.json(
                {
                    message: "Invalid transaction ID format",
                    error: "INVALID_ID_FORMAT"
                },
                { status: 400 }
            );
        }

        // Use the ID directly (no conversion needed for string IDs)
        const transactionId = username;

        // Check if the transaction exists before attempting to delete
        const existingTransaction = await prisma.beneficialTransaction.findUnique({
            where: { id: transactionId }
        });

        if (!existingTransaction) {
            return NextResponse.json(
                {
                    message: "Beneficial transaction not found",
                    error: "TRANSACTION_NOT_FOUND"
                },
                { status: 404 }
            );
        }

        // Delete the transaction
        const deletedTransaction = await prisma.beneficialTransaction.delete({
            where: { id: transactionId }
        });

        return NextResponse.json(
            {
                message: "Beneficial transaction deleted successfully",
                data: {
                    id: deletedTransaction.id,
                    deletedAt: new Date().toISOString()
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Beneficial Transaction Deletion Error:', error);

        // Handle Prisma-specific errors
        if (error?.code) {
            switch (error.code) {
                case 'P2025': // Record not found
                    return NextResponse.json(
                        {
                            message: "Beneficial transaction not found",
                            error: "TRANSACTION_NOT_FOUND"
                        },
                        { status: 404 }
                    );

                case 'P2003': // Foreign key constraint violation
                    return NextResponse.json(
                        {
                            message: "Cannot delete transaction due to existing dependencies",
                            error: "FOREIGN_KEY_CONSTRAINT"
                        },
                        { status: 409 }
                    );

                case 'P2014': // Required relation violation
                    return NextResponse.json(
                        {
                            message: "Cannot delete transaction due to required relationships",
                            error: "RELATION_CONSTRAINT"
                        },
                        { status: 409 }
                    );

                default:
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

        // Handle other error types
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

        // Generic server error
        return NextResponse.json(
            {
                message: "An unexpected error occurred while deleting the beneficial transaction",
                error: "INTERNAL_SERVER_ERROR"
            },
            { status: 500 }
        );
    }
}