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
import { DialogClose, DialogFooter } from "./ui/dialog"
import { DateTimePicker } from "./ui/custom-calender"




const formSchema = z.object({
    type: z.enum(["DONATE", "REFOUND"]),
    amount: z.string().optional(),
    loanPayment: z.string().optional(),
    donate: z.string().optional(),
    date: z.date({
        required_error: "A date is required.",
    }).optional(),
});


function DonorDonationPayment({ username, setOpen, status }: { username: string, setOpen: React.Dispatch<React.SetStateAction<boolean>>, status: string, }) {
    const router = useRouter();

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ donorUsername, amount, loanPayment, type, createAt, returnDate, donate, status }: DonorPaymentIPropsSend) => {
            const response = await axios.post("/api/donor_payment", {
                donorUsername, amount, loanPayment, type, createAt, returnDate, donate, status
            });
            return response.data;
        },
    });

    const Type = form.watch("type");

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        // console.log({ values })
        const donorUsername = username;
        const amount = values.amount;
        const loanPayment = values.loanPayment;
        const donate = values.donate;
        const type = values.type;

        const previous = values?.date as any;
        const createAt = new Date(previous);
        createAt?.setDate(previous?.getDate() + 1);



        // Donor /Lender Payment Created
        mutate({ donorUsername, amount, loanPayment, type, createAt, donate, status }, {
            onSuccess: (data: DonorPaymentIProps) => {
                if (data?.id) {
                    toast.success("Donor Payment Create Successfully");
                } else {
                    throw new Error("Donor Payment Created Failed")
                }
                toast.success("Donor Payment Create Successfully");
                router.refresh();
                setTimeout(() => {
                    setOpen(false);
                }, 2000);
            },
            onError: (error) => {
                // console.log({ error })
                toast.error("Donor payment Request Created Failed");
            }
        });
    };

    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-center text-xl">Lender Payment</h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <div className=" grid grid-cols-3  gap-3">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => {
                                return (
                                    <FormItem className=" mt-[-10px]">
                                        <FormLabel>Payment type</FormLabel>
                                        <Select onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an payment type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="DONATE">DONATE</SelectItem>
                                                <SelectItem value="REFOUND">REFOUND</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                        {
                            Type && (
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date of received</FormLabel>
                                            <FormControl>
                                                <DateTimePicker value={field.value} onChange={field.onChange} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )
                        }
                        {
                            Type === "DONATE" && (
                                <FormField
                                    control={form.control}
                                    name="donate"
                                    render={({ field }) => (
                                        <FormItem className=" mt-[-10px]">
                                            <FormLabel>Donate Amount</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Donate Amount" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )
                        }
                        {
                            Type === "REFOUND" && (
                                <FormField
                                    control={form.control}
                                    name="loanPayment"
                                    render={({ field }) => (
                                        <FormItem className=" mt-[-10px]">
                                            <FormLabel>Refound Amount</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Refound Amount" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )
                        }


                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        {isPending ? <Button disabled >Loading...</Button> : <Button type="submit">Submit</Button>}
                    </DialogFooter>
                </form>
            </Form>
        </div>
    )
}

export default DonorDonationPayment;