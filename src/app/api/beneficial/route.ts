import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BeneficialCreateIProps } from "@/types";
import { z } from "zod";

export const dynamic = 'force-dynamic'

// Validation schema for the API
const beneficialCreateSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
    username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username is too long"),
    village: z.string().min(1, "Village is required").max(100, "Village name is too long"),
    postoffice: z.string().min(1, "Post office is required").max(100, "Post office name is too long"),
    district: z.string().min(1, "District is required"),
    policeStation: z.string().min(1, "Police station is required"),
    occupation: z.string().min(1, "Occupation is required").max(100, "Occupation is too long"),
    photoUrl: z.array(z.string().url("Invalid image URL")).min(1, "Profile picture is required"),
    about: z.string().min(10, "About must be at least 10 characters"),
    phone: z.string().regex(/^[0-9]{11}$/, "Phone must be exactly 11 digits"),
    nidFront: z.string().url("NID front image is required"),
    nidBack: z.string().url("NID back image is required"),
    beneficialDonorId: z.string().optional().nullable(),
});

// Helper function to handle Prisma errors
function handlePrismaError(error: any) {
    console.error('Prisma error:', error);

    if (error?.code === 'P2002') {
        const target = error?.meta?.target;
        if (Array.isArray(target)) {
            const fieldName = target[0];
            return {
                message: `A record with this ${fieldName} already exists. Please use a different ${fieldName}.`,
                status: 409
            };
        }
        return {
            message: "A record with these details already exists.",
            status: 409
        };
    }

    if (error?.code === 'P2003') {
        return {
            message: "Referenced record does not exist. Please check your input data.",
            status: 400
        };
    }

    if (error?.code === 'P2025') {
        return {
            message: "Record not found. Please check your input data.",
            status: 404
        };
    }

    if (error?.code === 'P2000') {
        return {
            message: "Input data is too long for the database field.",
            status: 400
        };
    }

    if (error?.code === 'P2001') {
        return {
            message: "Required field is missing.",
            status: 400
        };
    }

    // Default error for unknown Prisma errors
    return {
        message: "Database operation failed. Please try again.",
        status: 500
    };
}

// Helper function to validate required fields
function validateRequiredFields(data: any) {
    const requiredFields = [
        'name', 'username', 'village', 'postoffice', 'district',
        'policeStation', 'occupation', 'photoUrl', 'about',
        'phone', 'nidFront', 'nidBack'
    ];

    const missingFields = requiredFields.filter(field => {
        const value = data[field];
        if (field === 'photoUrl') {
            return !value || !Array.isArray(value) || value.length === 0;
        }
        return !value || (typeof value === 'string' && value.trim() === '');
    });

    return missingFields;
}

// Create Beneficial
export const POST = async (request: Request) => {
    try {
        // Parse request body
        let body: BeneficialCreateIProps;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { message: "Invalid JSON format in request body" },
                { status: 400 }
            );
        }

        // console.log('Received data:', body);

        // Check if body exists and is an object
        if (!body || typeof body !== 'object') {
            return NextResponse.json(
                { message: "Request body is required" },
                { status: 400 }
            );
        }

        // Validate required fields before Zod validation
        const missingFields = validateRequiredFields(body);
        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    message: `Missing required fields: ${missingFields.join(', ')}`,
                    missingFields
                },
                { status: 400 }
            );
        }

        // Validate data using Zod schema
        let validatedData;
        try {
            validatedData = beneficialCreateSchema.parse(body);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
                return NextResponse.json(
                    {
                        message: "Validation failed",
                        errors: errorMessages,
                        details: error.errors
                    },
                    { status: 400 }
                );
            }
            throw error;
        }

        const {
            name,
            username,
            village,
            postoffice,
            district,
            policeStation,
            occupation,
            photoUrl,
            about,
            beneficialDonorId,
            phone,
            nidFront,
            nidBack
        } = validatedData;

        // Additional server-side validation
        if (beneficialDonorId && beneficialDonorId.trim() === '') {
            // Convert empty string to null for optional field
            validatedData.beneficialDonorId = null;
        }

        // Check if beneficial donor exists (if provided)
        if (validatedData.beneficialDonorId) {
            try {
                const donorExists = await prisma.beneficialDonor.findUnique({
                    where: { id: validatedData.beneficialDonorId },
                    select: { id: true }
                });

                if (!donorExists) {
                    return NextResponse.json(
                        { message: "Selected beneficial donor does not exist" },
                        { status: 400 }
                    );
                }
            } catch (error) {
                console.error('Error checking beneficial donor:', error);
                return NextResponse.json(
                    { message: "Error validating beneficial donor" },
                    { status: 500 }
                );
            }
        }

        // Check for existing username (if your schema has unique constraint)
        try {
            const existingUser = await prisma.beneficial.findFirst({
                where: {
                    OR: [
                        { username: username },
                        { phone: phone }
                    ]
                },
                select: { username: true, phone: true }
            });

            if (existingUser) {
                if (existingUser.username === username) {
                    return NextResponse.json(
                        { message: "Username already exists. Please choose a different username." },
                        { status: 409 }
                    );
                }
                if (existingUser.phone === phone) {
                    return NextResponse.json(
                        { message: "Phone number already exists. Please use a different phone number." },
                        { status: 409 }
                    );
                }
            }
        } catch (error) {
            console.error('Error checking existing user:', error);
            // Continue with creation if check fails
        }

        // Create the beneficial record
        try {
            const result = await prisma.beneficial.create({
                data: {
                    name,
                    username,
                    village,
                    postoffice,
                    district,
                    policeStation,
                    occupation,
                    photoUrl,
                    about,
                    beneficialDonorId: validatedData.beneficialDonorId,
                    phone,
                    nidFront,
                    nidBack
                },
                include: {
                    beneficialDonor: {
                        select: {
                            id: true,
                            name: true,
                            username: true
                        }
                    }
                }
            });

            console.log('Successfully created beneficial:', result.id);

            return NextResponse.json(
                {
                    message: "Beneficial record created successfully",
                    result
                },
                { status: 201 }
            );

        } catch (prismaError) {
            const { message, status } = handlePrismaError(prismaError);
            return NextResponse.json({ message }, { status });
        }

    } catch (error: any) {
        console.error('Unexpected error in POST /api/beneficial:', error);

        // Handle different types of errors
        if (error.name === 'ValidationError') {
            return NextResponse.json(
                { message: error.message },
                { status: 400 }
            );
        }

        if (error.name === 'DatabaseError') {
            return NextResponse.json(
                { message: "Database connection error. Please try again later." },
                { status: 503 }
            );
        }

        // Generic error response
        return NextResponse.json(
            {
                message: "An unexpected error occurred while creating the beneficial record. Please try again later.",
                ...(process.env.NODE_ENV === 'development' && { error: error.message })
            },
            { status: 500 }
        );
    }
}