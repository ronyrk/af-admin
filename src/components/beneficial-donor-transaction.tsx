"use client";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { date, z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { DateTimePicker } from "./ui/custom-calender";



const formSchema = z.object({
    amount: z.string().min(1, "Amount is required"),
    date: z.date({
        required_error: "Date is required",
        invalid_type_error: "Date must be a valid date"
    })
});

export function BeneficialDonorTransactionCreate({ beneficialDonorId, paymentType = "donate" }: { beneficialDonorId: string, paymentType?: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ amount, date }: z.infer<typeof formSchema>) => {
            const response = await axios.post("/api/beneficial/transaction", {
                beneficialDonorId,
                amount,
                paymentType,
                date
            });
            return response.data;
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const { amount, date } = values;

        const previous = values?.date as any;
        const createAt = new Date(previous);
        createAt?.setDate(previous?.getDate() + 1);


        try {
            mutate({ amount, date }, {
                onSuccess: ({ message, result }) => {
                    router.refresh();
                },
                onError: (error) => {
                }
            });
            toast.success("District created successfully!");
            setOpen(false);
            form.reset({
            });
        } catch (error) {
            toast.error("Failed to create district");
        }
        // Here you would typically send the data to your API
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <form>
                <DialogTrigger asChild>
                    <Button>Create District</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input placeholder="amount" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </DialogContent>
            </form>
        </Dialog >
    )
}
