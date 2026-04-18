"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// -- Validation schema --------------------------------------------------------

const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(
                /[^A-Za-z0-9]/,
                "Password must contain at least one special character"
            ),
        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"],
    });

// -- Types --------------------------------------------------------------------

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type ActionResult =
    | { success: false; errors: Record<string, string[]> | string };

// -- Server Action ------------------------------------------------------------

export async function changePassword(
    _prevState: ActionResult | null,
    formData: FormData
): Promise<ActionResult> {
    const raw = {
        currentPassword: formData.get("currentPassword") as string,
        newPassword: formData.get("newPassword") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    const parsed = changePasswordSchema.safeParse(raw);
    if (!parsed.success) {
        return {
            success: false,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    const { currentPassword, newPassword } = parsed.data;

    const token = cookies().get("auth")?.value ?? "";
    const payload = (await verifyToken(token)) as {
        username: string;
        role: string;
    } | null;

    if (!payload) {
        return { success: false, errors: "Session expired. Please log in again." };
    }

    const isAdmin = payload.role === "admin";

    try {
        if (isAdmin) {
            const user = await prisma.admin.findUnique({
                where: { username: payload.username },
                select: { password: true },
            });

            if (!user) {
                return { success: false, errors: "User not found." };
            }

            if (user.password !== currentPassword) {
                return {
                    success: false,
                    errors: { currentPassword: ["Current password is incorrect."] },
                };
            }

            await prisma.admin.update({
                where: { username: payload.username },
                data: { password: newPassword },
            });
        } else {
            const user = await prisma.branchList.findUnique({
                where: { username: payload.username },
                select: { password: true },
            });

            if (!user) {
                return { success: false, errors: "User not found." };
            }

            if (user.password !== currentPassword) {
                return {
                    success: false,
                    errors: { currentPassword: ["Current password is incorrect."] },
                };
            }

            await prisma.branchList.update({
                where: { username: payload.username },
                data: { password: newPassword },
            });
        }
    } catch (error) {
        console.error("[changePassword]", error);
        return {
            success: false,
            errors: "An unexpected error occurred. Please try again.",
        };
    }

    // redirect() must be called OUTSIDE try/catch — it throws internally
    // and a catch block would swallow it, preventing the redirect
    redirect("/dashboard");
}