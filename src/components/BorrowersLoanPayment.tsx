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
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { PaymentIProps } from "@/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "./ui/alert-dialog"
import { DateTimePicker } from "./ui/custom-calender"


const formSchema = z.object({
    amount: z.string(),
    date: z.date({
        required_error: "A date is required.",
    })
});
function BorrowersLoanPayment({ username }: { username: string }) {
    const router = useRouter();

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),

    });

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ loanusername, loanAmount, amount, createAt }: PaymentIProps) => {
            const response = await axios.post("/api/payment", {
                loanAmount, loanusername, amount, createAt
            });
            return response.data;
        },
    });

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        const loanAmount = "0";
        const amount = values.amount

        const previous = values.date;
        const createAt = new Date(previous);
        createAt.setDate(previous.getDate() + 1);


        // Borrowers Another Loan  Created

        mutate({ amount, loanAmount, createAt, loanusername: username }, {
            onSuccess: (data) => {
                if (data?.id) {
                    toast.success("Borrowers payment Successfully");
                } else {
                    throw new Error("Borrowers payment Failed")
                }
                toast.success("Borrowers payment Successfully");
                router.refresh();
            },
            onError: (error) => {
                // console.log({ error })
                toast.error("Borrowers payment Created Failed");
            }
        });
    };
    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-center text-xl">Borrowers Payment Create</h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <div className=" grid grid-cols-3 justify-self-stretch gap-3">

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date of payment</FormLabel>
                                    <FormControl>
                                        <DateTimePicker value={field.value} onChange={field.onChange} />
                                    </FormControl>
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

export default BorrowersLoanPayment