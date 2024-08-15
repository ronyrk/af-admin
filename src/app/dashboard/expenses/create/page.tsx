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
import { DisbursementIProps, ExpensesIProps } from "@/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import TailwindEditor from "@/components/editor"


const formSchema = z.object({
    description: z.string(),
    amount: z.string(),
    date: z.date({
        required_error: "A date is required.",
    }),
});


function ExpensesCreate() {
    const router = useRouter();

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),

    });

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ date, amount, description }: ExpensesIProps) => {
            const response = await axios.post("/api/expenses", {
                date, amount, description
            });
            return response.data;
        },
    });

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        const previous = values.date;
        const fullTime = new Date(previous);
        fullTime.setDate(previous.getDate() + 1);
        const date = fullTime.toJSON().split('T')[0];
        const description = values.description;
        const amount = values.amount;
        // Donor /Lender Payment Created
        mutate({ date, description, amount }, {
            onSuccess: ({ message, result }: { message: string, result: ExpensesIProps }) => {
                if (result?.id) {
                    toast.success(message);
                } else {
                    toast.error(message);
                }
                router.push(`/dashboard/expenses`);
                router.refresh();
            },
            onError: (error: any) => {
                toast.error(error);
            }
        });
    };

    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-center text-xl">Donor Payment Create</h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <div className=" grid grid-cols-2 items-center gap-3">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col mt-3">
                                    <FormLabel>Date</FormLabel>
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
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="amount" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="">
                                <FormLabel>Description</FormLabel>
                                <FormControl className="">
                                    <TailwindEditor description={field.name} onChange={field.onChange} value={field.value} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    {isPending ? <Button disabled >Loading...</Button> : <Button type="submit">Submit</Button>}
                </form>
            </Form>
        </div>
    )
}

export default ExpensesCreate;