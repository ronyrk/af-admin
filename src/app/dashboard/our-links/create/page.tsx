"use client";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { AllLinkIProps, CategoryIProps, GalleryIProps, GalleryProps } from "@/types"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { UploadButton } from "@/lib/uploadthing"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"





const formSchema = z.object({
    type: z.string(),
    path: z.string(),
    name: z.string(),
});

function LinkCreate() {
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });
    const { mutate, isPending } = useMutation({
        mutationFn: async ({ type, name, path }: AllLinkIProps) => {
            const response = await axios.post("/api/all-links", {
                type, name, path
            });
            return response.data;
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const type = values.type;
        const name = values.name;
        const path = values.path


        mutate({ type, name, path }, {
            onSuccess: (data: AllLinkIProps) => {
                if (data?.id) {
                    toast.success("Create Successfully");
                } else {
                    throw new Error("Created Failed")
                }
                router.refresh();
                router.push(`/dashboard/our-links`);
                router.refresh();
            },
            onError: (error) => {
                toast.error("Created Failed");
            }
        });
    }
    return (
        <div>
            <div className="p-2">
                <h2 className="text-center py-2 text-color-main">Create Link</h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="path"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>path</FormLabel>
                                    <FormControl>
                                        <Input placeholder="path" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="">
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a verified Category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="website">Website Link</SelectItem>
                                                <SelectItem value="media">Social Media</SelectItem>
                                                <SelectItem value="application">Application</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {isPending ? <Button disabled >Loading...</Button> : <Button type="submit">Submit</Button>}
                    </form>
                </Form>

            </div>
        </div>
    )
}

export default LinkCreate