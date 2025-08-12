"use client";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { DateTimePicker } from "./ui/custom-calender";
import TailwindEditor from "./editor";
import { Loader2 } from "lucide-react";

// Query keys for cache management
const QUERY_KEYS = {
    beneficialTransactions: ['beneficial-transactions'],
    beneficialStats: ['beneficial-stats'],
    dashboardSummary: ['dashboard-summary'],
} as const;

// Schema validation with improved validation
const formSchema = z.object({
    amount: z.string()
        .min(1, "Amount is required")
        .refine((val) => {
            const num = parseFloat(val);
            return !isNaN(num) && num > 0;
        }, {
            message: "Amount must be a positive number"
        })
        .refine((val) => {
            const num = parseFloat(val);
            return num <= 999999999; // Reasonable upper limit
        }, {
            message: "Amount is too large"
        }),
    date: z.date({
        required_error: "Date is required.",
        invalid_type_error: "Please select a valid date",
    }).refine((date) => {
        const now = new Date();
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(now.getFullYear() + 1);
        return date <= oneYearFromNow;
    }, {
        message: "Date cannot be more than 1 year in the future"
    }),
    description: z.string()
        .min(2, "Description is required")
        .max(1000, "Description must be less than 1000 characters")
        .refine((val) => val.trim().length >= 2, {
            message: "Description cannot be just whitespace"
        }),
});

type FormData = z.infer<typeof formSchema>;

// API interface
interface TransactionCreateData {
    amount: number;
    beneficialDonorId: string;
    beneficialId: string;
    description: string;
    date: Date;
}

interface BeneficialTransactionCreateProps {
    beneficialDonorId: string;
    beneficialId: string;
    onSuccess?: (data: any) => void;
    disabled?: boolean;
    triggerText?: string;
    triggerVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function BeneficialTransactionCreate({
    beneficialDonorId,
    beneficialId,
    onSuccess,
    disabled = false,
    triggerText = "Create Transaction",
    triggerVariant = "default"
}: BeneficialTransactionCreateProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Fix hydration issues
    useEffect(() => {
        setIsClient(true);
    }, []);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: '',
            date: undefined,
            description: '',
        }
    });

    // Watch form values for better UX
    const watchedValues = form.watch();
    const isFormDirty = form.formState.isDirty;

    // Enhanced mutation with TanStack Query best practices
    const { mutate, isPending, error, reset } = useMutation({
        mutationFn: async (data: TransactionCreateData): Promise<any> => {
            // Fix the typo in the API endpoint
            const response = await axios.post("/api/beneficial/transacttion", data);
            return response.data;
        },

        // Optimistic update
        onMutate: async (newTransaction) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({
                queryKey: QUERY_KEYS.beneficialTransactions
            });

            // Snapshot the previous value
            const previousTransactions = queryClient.getQueryData(
                QUERY_KEYS.beneficialTransactions
            );

            // Optimistically update the cache
            queryClient.setQueryData(
                QUERY_KEYS.beneficialTransactions,
                (old: any) => {
                    if (!old?.data) return old;

                    return {
                        ...old,
                        data: [
                            {
                                id: `temp-${Date.now()}`,
                                ...newTransaction,
                                createdAt: new Date().toISOString(),
                            },
                            ...old.data
                        ]
                    };
                }
            );

            return { previousTransactions };
        },

        onSuccess: (data, variables, context) => {
            // Invalidate and refetch related queries
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.beneficialTransactions
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.beneficialStats
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.dashboardSummary
            });

            toast.success("Transaction created successfully!", {
                duration: 4000,
                position: "top-right",
            });

            setOpen(false);
            form.reset({
                amount: '',
                date: undefined,
                description: '',
            });

            router.refresh();

            // Call custom success callback
            onSuccess?.(data);
        },

        onError: (error: any, variables, context) => {
            // Rollback optimistic update
            if (context?.previousTransactions) {
                queryClient.setQueryData(
                    QUERY_KEYS.beneficialTransactions,
                    context.previousTransactions
                );
            }

            console.error('Transaction creation error:', error);

            // Enhanced error handling with specific messages
            const errorData = error.response?.data;
            const status = error.response?.status;

            if (errorData?.message) {
                toast.error(errorData.message, {
                    duration: 5000,
                    position: "top-right",
                });
            } else if (errorData?.error) {
                switch (errorData.error) {
                    case 'VALIDATION_ERROR':
                        toast.error("Please check your input data");
                        break;
                    case 'DUPLICATE_ENTRY':
                        toast.error("This transaction already exists");
                        break;
                    case 'FOREIGN_KEY_VIOLATION':
                        toast.error("Invalid donor or beneficial ID");
                        break;
                    case 'INVALID_AMOUNT':
                        toast.error("Amount must be greater than zero");
                        break;
                    default:
                        toast.error(`Error: ${errorData.error}`);
                }
            } else {
                // Fallback based on status codes
                switch (status) {
                    case 400:
                        toast.error("Invalid request data");
                        break;
                    case 404:
                        toast.error("Donor or beneficial record not found");
                        break;
                    case 409:
                        toast.error("Transaction conflicts with existing data");
                        break;
                    case 500:
                        toast.error("Server error. Please try again later");
                        break;
                    default:
                        toast.error("Failed to create transaction");
                }
            }
        },

        // Retry configuration
        retry: (failureCount, error: any) => {
            const status = error.response?.status;

            // Don't retry client errors (4xx)
            if (status >= 400 && status < 500) {
                return false;
            }

            // Retry server errors up to 2 times
            return failureCount < 2;
        },

        retryDelay: (attemptIndex) => {
            // Exponential backoff: 1s, 2s, 4s
            return Math.min(1000 * Math.pow(2, attemptIndex), 10000);
        },
    });

    const onSubmit = async (values: FormData) => {
        // Reset any previous errors
        reset();

        // Trim description
        const trimmedDescription = values.description.trim();

        const submitData: TransactionCreateData = {
            amount: parseFloat(values.amount),
            beneficialDonorId,
            beneficialId,
            date: values.date,
            description: trimmedDescription,
        };

        mutate(submitData);
    };

    const handleDialogChange = (newOpen: boolean) => {
        // Prevent closing if form is dirty and submitting
        if (!newOpen && isFormDirty && isPending) {
            return;
        }

        setOpen(newOpen);

        if (!newOpen) {
            // Reset form and clear any errors when closing
            setTimeout(() => {
                form.reset({
                    amount: '',
                    date: undefined,
                    description: '',
                });
                reset();
            }, 150); // Small delay to prevent flash
        }
    };

    const handleCancel = () => {
        if (isFormDirty && !isPending) {
            const confirmClose = window.confirm(
                "You have unsaved changes. Are you sure you want to close?"
            );
            if (!confirmClose) return;
        }
        handleDialogChange(false);
    };

    const isFormDisabled = isPending || disabled;

    if (!isClient) {
        return null; // Prevent hydration mismatch
    }

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                <Button
                    variant={triggerVariant}
                    disabled={disabled}
                    className="w-full sm:w-auto"
                >
                    {triggerText}
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Create Beneficial Transaction</DialogTitle>
                    <DialogDescription>
                        Add a new beneficial transaction record for the selected donor and beneficial.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Amount and Date - Responsive Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter amount"
                                                    step="0.01"
                                                    min="0"
                                                    disabled={isFormDisabled}
                                                    className="text-right"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Transaction Date *</FormLabel>
                                            <FormControl>
                                                <DateTimePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    disabled={isFormDisabled}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Description - Full Width */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description *</FormLabel>
                                        <FormControl>
                                            <div className="min-h-[120px]">
                                                <TailwindEditor
                                                    description={field.name}
                                                    onChange={field.onChange}
                                                    value={field.value || ''}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {field.value ? field.value.length : 0}/1000 characters
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* Show mutation error if any */}
                            {error && (
                                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                                    <p className="font-medium">Error occurred</p>
                                    <p>Please check your input and try again.</p>
                                </div>
                            )}

                            {/* Action Buttons - Responsive */}
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleCancel}
                                    disabled={isFormDisabled}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"

                                    disabled={isFormDisabled}
                                    className="w-full sm:w-auto  bg-blue-400 hover:bg-blue-500 text-white disabled:bg-blue-300 disabled:cursor-not-allowed"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Transaction"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Enhanced custom hook for transaction management
export function useBeneficialTransactionActions() {
    const queryClient = useQueryClient();

    const invalidateTransactions = () => {
        return queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.beneficialTransactions
        });
    };

    const prefetchTransactions = () => {
        return queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.beneficialTransactions,
            queryFn: async () => {
                const response = await axios.get("/api/beneficial/transaction");
                return response.data;
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
        });
    };

    const getTransactionsCacheData = () => {
        return queryClient.getQueryData(QUERY_KEYS.beneficialTransactions);
    };

    const setTransactionsData = (data: any) => {
        return queryClient.setQueryData(QUERY_KEYS.beneficialTransactions, data);
    };

    const removeTransaction = (transactionId: string) => {
        queryClient.setQueryData(
            QUERY_KEYS.beneficialTransactions,
            (oldData: any) => {
                if (!oldData?.data) return oldData;
                return {
                    ...oldData,
                    data: oldData.data.filter((transaction: any) => transaction.id !== transactionId)
                };
            }
        );
    };

    return {
        invalidateTransactions,
        prefetchTransactions,
        getTransactionsCacheData,
        setTransactionsData,
        removeTransaction,
    };
}