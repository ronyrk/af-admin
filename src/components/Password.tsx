"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const formSchema = z.object({
    password: z.string(),

});


export function PasswordChange({ admin }: { admin: any }) {
    // console.log({ admin })
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: admin?.password,
        }
    });

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ password }: { password: string }) => {
            const response = await axios.patch("/api/abdullaalmamun", {
                password
            });
            return response.data;
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const password = values.password;

        mutate({ password }, {
            onSuccess: (data: any) => {
                toast.success("Successfully Updated");
                router.push(`/dashboard`);
            },
            onError: (error) => {
                toast.error("Updated Failed");
            }
        });

    }
    return (
        <Form {...form}>
            <Card className="w-[350px]">
                <CardHeader className="p-2">
                    <CardTitle>Admin Password Change</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input defaultValue={admin.password} placeholder="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        {isPending ? <Button disabled >Loading...</Button> : <Button type="submit">Submit</Button>}
                    </form>
                </CardContent>
            </Card>
        </Form>
    )
}
