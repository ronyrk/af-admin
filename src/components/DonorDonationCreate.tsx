"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { DonorIProps, DonorPaymentIProps, DonorPaymentIPropsSend, LoanIProps } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const formSchema = z.object({
    amount: z.string().optional(),
    loanPayment: z.string().optional(),
    date: z.date({
        required_error: "A date is required.",
    }),
    PaymentDate: z.date({
        required_error: "A date is required.",
    })
});


function DonorDonationCreate({ username }: { username: string }) {
    const router = useRouter();

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: "0",
            loanPayment: "0"
        }
    });

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ donorUsername, amount, loanPayment, type, createAt, paymentDate }: DonorPaymentIPropsSend) => {
            const response = await axios.post("/api/donor_payment", {
                donorUsername, amount, loanPayment, type, createAt, paymentDate
            });
            return response.data;
        },
    });

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log({ values })
        const donorUsername = username;
        const amount = values.amount;
        const loanPayment = values.loanPayment;
        const type = "increase";

        const previous = values.date;
        const createAt = new Date(previous);
        createAt.setDate(previous.getDate() + 1);

        const previousPayment = values.PaymentDate;
        const paymentDate = new Date(previousPayment);
        paymentDate.setDate(previousPayment.getDate() + 1);

        // Donor /Lender Payment Created
        mutate({ donorUsername, amount, loanPayment, type, createAt, paymentDate }, {
            onSuccess: (data: DonorPaymentIProps) => {
                console.log({ data })
                if (data?.id) {
                    toast.success("Donor Payment Create Successfully");
                } else {
                    throw new Error("Donor Payment Created Failed")
                }
                toast.success("Donor Payment Create Successfully");
                router.refresh();
            },
            onError: (error) => {
                console.log({ error })
                toast.error("Donor payment Request Created Failed");
            }
        });
    };

    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-center text-xl">Donor Payment Create</h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <div className=" grid grid-cols-3 justify-self-stretch gap-3">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date of received</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "text-color-main pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="PaymentDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date of return</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "text-color-main pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem className=" mt-[-10px]">
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Amount" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel type="button" className=' text-black'>Cancel</AlertDialogCancel>
                        {isPending ? <Button disabled >Loading...</Button> : <AlertDialogAction type="submit">Submit</AlertDialogAction>}
                    </AlertDialogFooter>
                </form>
            </Form>
        </div>
    )
}

export default DonorDonationCreate;