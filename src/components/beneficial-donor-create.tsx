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
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";
import TailwindEditor from "./editor";



const formSchema = z.object({
    name: z.string(),
    username: z.string(),
    live: z.string(),
    homeTown: z.string(),
    photoUrl: z.string(),
    about: z.string(),
});

export function BeneficialDonorCreate() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    // const { mutate, isPending } = useMutation({
    //     mutationFn: async ({ name }: { name: string }) => {
    //         const response = await axios.post("/api/district", {
    //             name
    //         });
    //         return response.data;
    //     },
    // });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const name = values.name;
        // if (name.length < 2) {
        //     toast.error("Name must be at least 2 characters long");
        //     return;
        // }
        try {
            // mutate({ name }, {
            //     onSuccess: ({ message, result }) => {
            //         router.refresh();
            //     },
            //     onError: (error) => {
            //     }
            // });
            toast.success("District created successfully!");
            setOpen(false);
            form.reset({
                name: '',
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
                <DialogContent className="w-[1200px]">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="username" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                name="live"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Live</FormLabel>
                                        <FormControl>
                                            <Input placeholder="live" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="homeTown"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Home Town</FormLabel>
                                        <FormControl>
                                            <Input placeholder="home town" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="photoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Photo Upload</FormLabel>
                                        <FormControl>
                                            <UploadButton
                                                endpoint="imageUploader"
                                                onClientUploadComplete={(res) => {
                                                    form.setValue("photoUrl", res[0].url);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="about"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>About</FormLabel>
                                        <FormControl>
                                            <TailwindEditor description={field.name} onChange={field.onChange} value={field.value} />
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
