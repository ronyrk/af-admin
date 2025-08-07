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



const formSchema = z.object({
    name: z.string(),
});

export function DistrictCreate() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ name }: { name: string }) => {
            const response = await axios.post("/api/district", {
                name
            });
            return response.data;
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const name = values.name;
        if (name.length < 2) {
            toast.error("Name must be at least 2 characters long");
            return;
        }
        try {
            mutate({ name }, {
                onSuccess: ({ message, result }) => {
                    router.refresh();
                },
                onError: (error) => {
                }
            });
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
                    <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </DialogContent>
            </form>
        </Dialog >
    )
}
