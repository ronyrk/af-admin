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
    loanPayment: z.string(),
});


function DonorDonationCreate({ username }: { username: string }) {
    const router = useRouter();

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            loanPayment: "0"
        }
    });

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ donorUsername, loanPayment, type }: DonorPaymentIPropsSend) => {
            const response = await axios.post("/api/donor_payment", {
                donorUsername, loanPayment, type
            });
            return response.data;
        },
    });

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        const donorUsername = username;
        const loanPayment = values.loanPayment;
        const type = "increase";


        // Donor /Lender Payment Created
        mutate({ donorUsername, type, loanPayment }, {
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