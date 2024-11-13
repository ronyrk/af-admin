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
import { DonorPaymentIProps, DonorPaymentIPropsSend } from "@/types"
import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "./ui/alert-dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"



const formSchema = z.object({
    loanPayment: z.string(),
    type: z.string(),
});


function DonorDonationPayment({ id, username }: { id: string, username: string }) {
    const router = useRouter();

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            loanPayment: "0"
        }
    });

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ loanPayment, type, donorUsername }: DonorPaymentIPropsSend) => {
            const response = await axios.patch(`/api/donor_payment/${id}`, {
                loanPayment, type, donorUsername
            });
            return response.data;
        },
    });

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        const loanPayment = values.loanPayment;
        const type = values.type;
        const donorUsername = username;

        // Donor /Lender Payment Created
        mutate({ loanPayment, type, donorUsername }, {
            onSuccess: (data: DonorPaymentIProps) => {
                if (data?.id) {
                    toast.success("Donor Payment Create Successfully");
                } else {
                    throw new Error("Donor Payment Created Failed")
                }
                router.refresh();
            },
            onError: (error) => {
                toast.error("Donor payment Request Created Failed");
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
                            name="loanPayment"
                            render={({ field }) => (
                                <FormItem className="">
                                    <FormLabel>Loan Payment</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Loan Amount Payment" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type Method</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a verified method" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent >
                                            <SelectItem className=" text-black" defaultChecked value="payment">payment</SelectItem>
                                            <SelectItem className=" text-black" value="donate">Donate</SelectItem>
                                        </SelectContent>
                                    </Select>
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

export default DonorDonationPayment;