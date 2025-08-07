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
import { PlusCircle } from "lucide-react";



const formSchema = z.object({
    name: z.string(),
});

export function PoliceStationCreate({ districtId }: { districtId: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ name, districtId }: { name: string, districtId: string }) => {
            const response = await axios.post("/api/police-station", {
                name,
                districtId
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
            mutate({ name, districtId }, {
                onSuccess: ({ message, result }) => {
                    router.refresh();
                },
                onError: (error) => {
                }
            });
            toast.success("police-station created successfully!");
            setOpen(false);
            form.reset({
                name: '',
            });
        } catch (error) {
            toast.error("Failed to create police-station");
        }
        // Here you would typically send the data to your API
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <form>
                <DialogTrigger asChild>
                    <Button className="bg-blue-500"><PlusCircle className="text-white" /></Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Police Station Name</FormLabel>
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
