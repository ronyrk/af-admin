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
import { Label } from "@/components/ui/label"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { OwnerIProps } from "@/types"
import { useState } from "react"
import { UploadButton } from "@/lib/uploadthing"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TailwindEditor from "@/components/editor"

const formSchema = z.object({
    username: z.string().min(2).max(50),
    email: z.string(),
    about: z.string(),
    name: z.string(),
    facebook: z.string(),
    linkedin: z.string(),
    phone: z.string(),
    type: z.enum(["OWNER", "FOUNDER", "ADVISOR"])
});

function OwnerCreate() {
    const [image, setImage] = useState<string>("");
    const router = useRouter();
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema)
    });

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ username, name, email, photos, facebook, linkedin, phone, about, type }: OwnerIProps) => {
            const response = await axios.post("/api/owner", {
                username, name, email, photos, facebook, linkedin, phone, about, type
            });
            return response.data;
        },
    });

    const upload = image.length >= 1;

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        const photos = image;
        const username = values.username;
        const email = values.email;
        const name = values.name;
        const about = values.about;
        const facebook = values.facebook;
        const linkedin = values.linkedin;
        const phone = values.phone;
        const type = values.type;

        // Donor Created
        if (upload === true) {
            mutate({ username, name, email, photos, facebook, linkedin, phone, about, type }, {
                onSuccess: ({ data, message }: { data: OwnerIProps, message: string }) => {
                    if (data?.id) {
                        toast.success(message);
                    } else {
                        throw new Error(message)
                    }
                    // router.push(`/dashboard/owner`);
                    router.refresh();
                },
                onError: ({ message }: { message: any }) => {
                    toast.error(message);
                }
            });
        } else {
            toast.error("Upload Photo Failed");
        }
    };

    return (
        <div className="">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <div className=" grid grid-cols-3 items-center gap-3">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a verified type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="OWNER">OWNER</SelectItem>
                                                <SelectItem value="FOUNDER">FOUNDER</SelectItem>
                                                <SelectItem value="ADVISOR">ADVISOR</SelectItem>

                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
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
                                        <Input placeholder="Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="facebook"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Facebook</FormLabel>
                                    <FormControl>
                                        <Input type="url" placeholder="Profile link" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="linkedin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Linkedin</FormLabel>
                                    <FormControl>
                                        <Input type="url" placeholder="Profile link" {...field} />
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
                                    <FormLabel>Mobile</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="Phone Number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-col justify-center items-center p-0">
                            <Label className="pb-1">Photos</Label>
                            <UploadButton
                                className="ut-button:bg-color-sub mb-[-40px] ut-button:ut-readying:bg-color-sub/80"
                                endpoint="imageUploader"
                                onClientUploadComplete={(res) => {
                                    setImage(res[0].url)
                                    toast.success("Image Upload successfully")
                                }}
                                onUploadError={(error: Error) => {
                                    // Do something with the error.
                                    toast.error(error.message);
                                }}
                            />
                        </div>
                    </div>
                    <div className="my-3">
                        <FormField
                            control={form.control}
                            name="about"
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
                    </div>
                    {isPending ? <Button disabled >Loading...</Button> : <Button disabled={upload === false} type="submit">Submit</Button>}
                </form>
            </Form>
        </div>
    )
}

export default OwnerCreate;