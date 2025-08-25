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
import { useMemo, useState, useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { DateTimePicker } from "./ui/custom-calender";
import TailwindEditor from "./editor";
import { Check, ChevronsUpDown, Loader2, AlertCircle, Wallet } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { BeneficialIProps } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Enhanced form schema with comprehensive validation
const formSchema = z.object({
    amount: z
        .string()
        .min(1, "Amount is required")
        .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number with up to 2 decimal places")
        .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0")
        .refine((val) => parseFloat(val) <= 1000000, "Amount cannot exceed 1,000,000"),
    date: z.date({
        required_error: "Date is required",
        invalid_type_error: "Date must be a valid date"
    }).refine((date) => date <= new Date(), "Date cannot be in the future"),
    beneficialId: z.string().min(1, "Beneficiary selection is required"),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(1000, "Description cannot exceed 1000 characters")
        .refine((val) => val.trim().length > 0, "Description cannot be empty"),
});

type FormData = z.infer<typeof formSchema>;

interface TransactionResponse {
    message: string;
    result: any;
}

interface BeneficialDonorSpendTransactionCreateProps {
    beneficialDonorId: string;
    paymentType?: string;
    onSuccess?: (data: TransactionResponse) => void;
    triggerLabel?: string;
}

export function BeneficialDonorSpendTransactionCreate({
    beneficialDonorId,
    paymentType = "spend",
    onSuccess,
    triggerLabel = "Create Spending Transaction"
}: BeneficialDonorSpendTransactionCreateProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [openBeneficial, setOpenBeneficial] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout>();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: "",
            date: new Date(),
            beneficialId: "",
            description: ""
        },
        mode: "onChange"
    });

    // Enhanced beneficial data fetching with better error handling
    const {
        data: beneficial = [],
        isLoading: isLoadingDonors,
        error: donorsError,
        refetch: refetchBeneficial
    } = useQuery<BeneficialIProps[]>({
        queryKey: ['beneficial'],
        queryFn: async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const response = await axios.get('/api/beneficial', {
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                clearTimeout(timeoutId);

                if (!response.data || !Array.isArray(response.data)) {
                    throw new Error('Invalid data format received');
                }

                return response.data;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const axiosError = error as AxiosError<{ message?: string }>;
                    throw new Error(
                        axiosError.response?.data?.message ||
                        axiosError.message ||
                        "Failed to fetch beneficiaries"
                    );
                }
                throw new Error("Network error occurred");
            }
        },
        staleTime: 40 * 1000, // 40 seconds
        gcTime: 1 * 60 * 1000,   // 1 minute (previously cacheTime)
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled: open, // Only fetch when dialog is open
    });

    // Memoized available donors for performance
    const availableDonors = useMemo(() => {
        if (!beneficial || beneficial.length === 0) return [];

        return beneficial.map(b => ({
            value: b.id,
            label: `${b.name}`,
            username: b.username || 'N/A',
            phone: b.phone || 'N/A',
            location: `${b.district || ''} ${b.policeStation || ''}`.trim() || 'N/A',
            searchText: `${b.name} ${b.username || ''} ${b.phone || ''} ${b.district || ''} ${b.policeStation || ''}`.toLowerCase()
        }));
    }, [beneficial]);

    // Enhanced mutation with comprehensive error handling
    const { mutate, isPending } = useMutation({
        mutationFn: async (data: FormData): Promise<TransactionResponse> => {
            try {
                // Validate beneficialDonorId before submission
                if (!beneficialDonorId || beneficialDonorId.trim() === "") {
                    throw new Error("Beneficial donor ID is required");
                }

                const response = await axios.post("/api/beneficial/transaction", {
                    beneficialDonorId,
                    amount: parseFloat(data.amount),
                    paymentType,
                    date: data.date.toISOString(),
                    beneficialId: data.beneficialId,
                    description: data.description.trim()
                }, {
                    timeout: 30000,
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
            toast.success(data.message || "Spending transaction created successfully!");

            // Invalidate multiple related queries
            queryClient.invalidateQueries({
                queryKey: ['beneficial-transactions', beneficialDonorId]
            });
            queryClient.invalidateQueries({
                queryKey: ['beneficial-donor', beneficialDonorId]
            });
            queryClient.invalidateQueries({
                queryKey: ['beneficial-spending']
            });

            // Close dialog and reset form
            handleDialogClose();

            // Refresh the page data
            router.refresh();

            // Call custom success handler
            onSuccess?.(data);
        },
        onError: (error) => {
            const errorMessage = error instanceof Error
                ? error.message
                : "Failed to create spending transaction";

            toast.error(errorMessage);
            console.error("Transaction creation error:", error);
        }
    });

    const onSubmit = useCallback(async (values: FormData) => {
        try {
            // Additional client-side validation
            const selectedBeneficial = beneficial.find(b => b.id === values.beneficialId);
            if (!selectedBeneficial) {
                toast.error("Please select a valid beneficiary");
                return;
            }

            mutate(values);
        } catch (error) {
            toast.error("Failed to submit form");
            console.error("Form submission error:", error);
        }
    }, [mutate, beneficial]);

    const handleDialogClose = useCallback(() => {
        setOpen(false);
        setOpenBeneficial(false);
        form.reset();
    }, [form]);

    const handleDialogOpenChange = useCallback((newOpen: boolean) => {
        if (newOpen) {
            setOpen(true);
        } else {
            // Check if form is dirty before closing
            if (form.formState.isDirty && !isPending) {
                const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close?");
                if (!confirmClose) return;
            }
            handleDialogClose();
        }
    }, [form.formState.isDirty, isPending, handleDialogClose]);

    const handleBeneficialSelect = useCallback((selectedValue: string, currentValue: string) => {
        const newValue = selectedValue === currentValue ? "" : selectedValue;
        form.setValue("beneficialId", newValue, { shouldValidate: true });
        setOpenBeneficial(false);
    }, [form]);

    // Debounced search for better performance
    const handleSearchChange = useCallback((value: string) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            // Search logic can be enhanced here if needed
        }, 100);
    }, []);

    const handleDescriptionChange = useCallback((value: string) => {
        form.setValue("description", value, { shouldValidate: true });
    }, [form]);

    // Keyboard event handler
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.target !== e.currentTarget) {
            e.preventDefault();
        }
    }, []);

    const watchedDescription = form.watch("description");
    const descriptionLength = watchedDescription?.length || 0;

    return (
        <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                <Button disabled={isPending} className="gap-2">
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Wallet className="h-4 w-4" />
                    )}
                    {triggerLabel}
                </Button>
            </DialogTrigger>

            <DialogContent
                className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto"
                onKeyDown={handleKeyDown}
                onInteractOutside={(e) => {
                    if (form.formState.isDirty && !isPending) {
                        e.preventDefault();
                        toast.error("Please save or cancel your changes first");
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Create {paymentType === "spend" ? "Spending" : "Transaction"} Record
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                        noValidate
                    >
                        {/* Beneficial Donor Selection */}
                        <FormField
                            control={form.control}
                            name="beneficialId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-base font-medium">
                                        Select Beneficiary <span className="text-destructive">*</span>
                                    </FormLabel>

                                    {donorsError && (
                                        <Alert variant="destructive" className="mb-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="flex items-center justify-between">
                                                <span>Failed to load beneficiaries</span>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => refetchBeneficial()}
                                                    disabled={isLoadingDonors}
                                                >
                                                    Retry
                                                </Button>
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <Popover open={openBeneficial} onOpenChange={setOpenBeneficial}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="destructive"
                                                    role="combobox"
                                                    aria-expanded={openBeneficial}
                                                    disabled={isLoadingDonors || isPending}
                                                    className={cn(
                                                        "w-full justify-between min-h-[40px] h-auto",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <div className="flex flex-col items-start text-left">
                                                        {field.value ? (
                                                            <>
                                                                <span className="font-medium">
                                                                    {availableDonors.find((donor) => donor.value === field.value)?.label}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    @{availableDonors.find((donor) => donor.value === field.value)?.username} •
                                                                    {availableDonors.find((donor) => donor.value === field.value)?.location}
                                                                </span>
                                                            </>
                                                        ) : isLoadingDonors ? (
                                                            <span>Loading beneficiaries...</span>
                                                        ) : (
                                                            <span>Search and select beneficiary...</span>
                                                        )}
                                                    </div>
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="p-0"
                                            align="start"
                                            style={{ width: 'var(--radix-popover-trigger-width)' }}
                                            sideOffset={4}
                                        >
                                            <Command className="w-full">
                                                <CommandInput
                                                    placeholder="Search by name, username, or location..."
                                                    className="h-9 w-full"
                                                    onValueChange={handleSearchChange}
                                                />
                                                <CommandList className="max-h-[250px] w-full">
                                                    <CommandEmpty>
                                                        {isLoadingDonors
                                                            ? "Loading beneficiaries..."
                                                            : donorsError
                                                                ? "Error loading beneficiaries"
                                                                : "No beneficiary found."}
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {availableDonors.map((donor) => (
                                                            <CommandItem
                                                                value={donor.searchText}
                                                                key={donor.value}
                                                                onSelect={() => handleBeneficialSelect(donor.value, field.value)}
                                                                className="flex items-start p-3"
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4 mt-1",
                                                                        donor.value === field.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col min-w-0 flex-1">
                                                                    <span className="font-medium truncate">{donor.label}</span>
                                                                    <div className="text-xs text-muted-foreground space-y-1">
                                                                        <div>@{donor.username}</div>
                                                                        <div>{donor.phone}</div>
                                                                        <div>{donor.location}</div>
                                                                    </div>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date and Amount in responsive grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-base font-medium">
                                            Transaction Date <span className="text-destructive">*</span>
                                        </FormLabel>
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
                                        <FormLabel className="text-base font-medium">
                                            Amount <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter amount (e.g., 1500.50)"
                                                type="text"
                                                inputMode="decimal"
                                                {...field}
                                                disabled={isPending}
                                                autoComplete="off"
                                                className="text-base"
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
                                    <FormLabel className="text-base font-medium">
                                        Description <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="min-h-[120px] border rounded-md">
                                            <TailwindEditor
                                                description={field.name} onChange={field.onChange} value={field.value}
                                            />
                                        </div>
                                    </FormControl>
                                    <div className="flex justify-between items-center">
                                        <FormMessage />
                                        <div className={cn(
                                            "text-xs transition-colors",
                                            descriptionLength > 900 ? "text-destructive" :
                                                descriptionLength > 800 ? "text-yellow-600" :
                                                    "text-muted-foreground"
                                        )}>
                                            {descriptionLength}/1000 characters
                                        </div>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => handleDialogOpenChange(false)}
                                disabled={isPending}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending || !form.formState.isValid}
                                className="w-full sm:w-auto gap-2"
                            >
                                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isPending ? "Creating..." : "Create Transaction"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}