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
import { BeneficialDonorIProps, BranchIProps } from "@/types"
import { UploadButton } from "@/lib/uploadthing"
import TailwindEditor from "@/components/editor"
import { Loader2, Phone } from "lucide-react"

const formSchema = z.object({
    name: z.string(),
    username: z.string(),
    live: z.string(),
    homeTown: z.string(),
    photoUrl: z.string(),
    about: z.string(),
    phone: z.string(),
});

function BeneficialDonorCreate() {

    // Function to handle username input change
    const handleUsernameChange = (value: string) => {
        // Replace spaces with hyphens
        const formattedValue = value.replace(/\s/g, '-');
        return formattedValue;
    };

    const router = useRouter();
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });
    // 2. Define a mutation.
    const { mutate, isPending } = useMutation({
        mutationFn: async ({ username, name, photoUrl, about, live, homeTown, phone }: BeneficialDonorIProps) => {
            const response = await axios.post("/api/beneficial/donor", {
                username, name, photoUrl, about, live, homeTown, phone
            });
            return response.data;
        },
    });

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        const { username, name, photoUrl, about, live, homeTown, phone } = values;
        mutate({ username, name, photoUrl, about, live, homeTown, phone }, {
            onSuccess: ({ message, result }: { message: string, result: BeneficialDonorIProps }) => {
                toast.success(message);
                console.log(result);

                // router.push(`/dashboard/beneficial/donor`);
                router.refresh();
            },
            onError: ({ message }: { message: any }) => {
                toast.error(message);
            }
        });
    };

    return (
        <div className="">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <div className=" flex flex-col gap-3">
                        <h2 className=" text-lg text-color-main font-medium">Branch Information</h2>
                        <div className=" grid grid-cols-3 gap-3 border-2 rounded p-3">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="username" {...field}
                                                onChange={(e) => {
                                                    const formattedValue = handleUsernameChange(e.target.value);
                                                    field.onChange(formattedValue);
                                                }}
                                            />
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
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="phone" {...field} />
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
                                        <FormLabel className=" flex justify-center">Profile Picture</FormLabel>
                                        <FormControl>
                                            <UploadButton
                                                className="ut-button:bg-color-sub  ut-button:ut-readying:bg-color-sub/80"
                                                endpoint="imageUploader"

                                                onClientUploadComplete={(res) => {
                                                    // Do something with the response
                                                    field.onChange(res[0].url)
                                                    toast.success("Image Upload successfully")
                                                }}
                                                onUploadError={(error: Error) => {
                                                    // Do something with the error.
                                                    toast.error(error.message);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
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
                    <Button type="submit" disabled={isPending} >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default BeneficialDonorCreate;