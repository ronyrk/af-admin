"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "./ui/form";
import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { DateTimePicker } from "./ui/custom-calender";
import { Loader2 } from "lucide-react";

// Enhanced form schema with better validation
const formSchema = z.object({
    amount: z
        .string()
        .min(1, "Amount is required")
        .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number with up to 2 decimal places")
        .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0"),
    date: z.date({
        required_error: "Date is required",
        invalid_type_error: "Date must be a valid date"
    }).refine((date) => date <= new Date(), "Date cannot be in the future")
});

type FormData = z.infer<typeof formSchema>;

interface TransactionResponse {
    message: string;
    result: any;
}

interface BeneficialDonorTransactionCreateProps {
    beneficialDonorId: string;
    paymentType?: string;
    onSuccess?: (data: TransactionResponse) => void;
    triggerLabel?: string;
}

export function BeneficialDonorTransactionCreate({
    beneficialDonorId,
    paymentType = "donate",
    onSuccess,
    triggerLabel = "Create Transaction"
}: BeneficialDonorTransactionCreateProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: "",
            date: new Date()
        },
        mode: "onChange" // Enable real-time validation
    });

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ amount, date }: FormData): Promise<TransactionResponse> => {
            try {
                const response = await axios.post("/api/beneficial/transaction", {
                    beneficialDonorId,
                    amount: parseFloat(amount), // Convert to number
                    paymentType,
                    date: date.toISOString() // Ensure proper date format
                }, {
                    timeout: 1000, // 1 second timeout
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                return response.data;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const axiosError = error as AxiosError<{ message?: string }>;
                    throw new Error(
                        axiosError.response?.data?.message ||
                        axiosError.message ||
                        "Failed to create transaction"
                    );
                }
                throw new Error("An unexpected error occurred");
            }
        },
        onSuccess: (data) => {
            toast.success(data.message || "Transaction created successfully!");

            // Invalidate related queries to refresh data
            queryClient.invalidateQueries({
                queryKey: ['beneficial-transactions', beneficialDonorId]
            });
            queryClient.invalidateQueries({
                queryKey: ['beneficial-donor', beneficialDonorId]
            });

            // Close dialog and reset form
            setOpen(false);
            form.reset();

            // Refresh the page data
            router.refresh();

            // Call custom success handler if provided
            onSuccess?.(data);
        },
        onError: (error) => {
            const errorMessage = error instanceof Error
                ? error.message
                : "Failed to create transaction";

            toast.error(errorMessage);
            console.error("Transaction creation error:", error);
        }
    });

    const onSubmit = useCallback(async (values: FormData) => {
        try {
            // Validate beneficialDonorId
            if (!beneficialDonorId || beneficialDonorId.trim() === "") {
                toast.error("Beneficial donor ID is required");
                return;
            }

            mutate(values);
        } catch (error) {
            toast.error("Failed to submit form");
            console.error("Form submission error:", error);
        }
    }, [mutate, beneficialDonorId]);

    const handleDialogOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);

        // Reset form when closing dialog
        if (!newOpen) {
            form.reset();
        }
    }, [form]);

    // Prevent form submission on Enter key in input fields
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.target !== e.currentTarget) {
            e.preventDefault();
        }
    }, []);

    return (
        <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                <Button disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {triggerLabel}
                </Button>
            </DialogTrigger>

            <DialogContent
                className="sm:max-w-[425px]"
                onKeyDown={handleKeyDown}
                // Prevent dialog from closing on outside click when form is dirty
                onInteractOutside={(e) => {
                    if (form.formState.isDirty && !isPending) {
                        e.preventDefault();
                        toast.error("Please save or cancel your changes first");
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>
                        Create {paymentType === "donate" ? "Donation" : "Transaction"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                        noValidate // Use custom validation instead of browser validation
                    >
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date of Transaction</FormLabel>
                                    <FormControl>
                                        <DateTimePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter amount (e.g., 100.50)"
                                            type="text"
                                            inputMode="decimal"
                                            {...field}
                                            disabled={isPending}
                                            autoComplete="off"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => handleDialogOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending || !form.formState.isValid}
                            >
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isPending ? "Creating..." : "Create Transaction"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}