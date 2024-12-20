"use client";

import { DonorIProps, OwnerIProps, OwnerUpdateIProps } from '@/types';
import Image from 'next/image'
import React, { useState } from 'react'
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
import { BranchIProps, DonorIUpdatedProps } from "@/types"
import { UploadButton } from "@/lib/uploadthing"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { SquarePen } from 'lucide-react';
import Link from 'next/link';
import UpdatedEditor from './UpdatedEditor';

const formSchema = z.object({
    about: z.string(),
    type: z.string(),
    name: z.string(),
    phone: z.string(),
    facebook: z.string(),
    linkedin: z.string(),

});

async function htmlConvert(data: string) {
    const jsonAndHtml = data.split("^");
    const html = jsonAndHtml[0];

    return (
        <div className="py-2">
            <p dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
}

function MemberProfileEdit({ data }: { data: OwnerIProps }) {

    const [image, setImage] = useState<string>(data.photos);

    const upload = image.length >= 1;

    const [editMode, setEditMode] = useState<Boolean>(false);
    const router = useRouter();

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            about: data.about,
            type: data.type,
            name: data.name,
            phone: data.phone,
            facebook: data.facebook,
            linkedin: data.linkedin,
        }
    });

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ name, photos, facebook, linkedin, phone, about, type, }: OwnerUpdateIProps) => {
            const response = await axios.patch(`/api/owner/${data.username}`, {
                name, photos, facebook, linkedin, phone, about, type
            });
            return response.data;
        },
    });
    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        const photos = image;
        const name = values.name;
        const type = values.type;
        const phone = values.phone;
        const about = values.about;
        const facebook = values.facebook;
        const linkedin = values.linkedin;

        // Branch Created
        mutate({ name, photos, facebook, linkedin, phone, about, type }, {
            onSuccess: ({ message, result }: { message: string, result: DonorIProps }) => {
                if (result.id) {
                    toast.success(message);
                } else {
                    throw new Error("Donor Updated Failed");
                }
                setEditMode(false);
                router.refresh();
            },
            onError: (error) => {
                toast.error("Donor Updated Failed");
            }
        });
    };
    return (
        <div className='flex flex-col gap-3 relative'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex md:flex-row flex-col justify-between gap-3 px-2 relative">
                        <div className=" absolute flex flex-row gap-2 top-2 right-4">
                            {editMode === true && <div>
                                {isPending ? <Button disabled >Loading...</Button> : <Button disabled={upload === false} type="submit">Submit</Button>}
                            </div>}
                            <Button type="button" onClick={() => setEditMode(!editMode)} className=' cursor-pointer bg-inherit' variant={"secondary"}>
                                <SquarePen />
                            </Button>
                        </div>

                        <div className=" basis-4/12 border-[2px] p-2 flex justify-around relative rounded">
                            <Image sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className=' rounded-md object-cover' src={data.photos} alt={data.name} width={300} height={140} />
                            <span className=" absolute top-3 bg-white left-2 border-[2px] text-[13px] lowercase font-normal p-[1px] rounded">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={data.type}>
                                                    <FormControl>
                                                        <SelectTrigger disabled={editMode === false}>
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
                            </span>
                            {
                                editMode === true ? <span className=" absolute top-3 bg-white right-0 border-[2px] text-[13px] lowercase font-normal p-[1px] rounded">
                                    <UploadButton
                                        className="ut-button:bg-color-sub ut-button:ut-readying:bg-color-sub/80"
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
                                </span> : <span>.</span>
                            }
                        </div>
                        <div className="basis-8/12 border-[2px] rounded p-1 px-2 flex flex-col justify-around">
                            <h2 className=" font-semibold text-xl py-1  text-color-main">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                {editMode === true ? <Input className='text-xl w-fit'{...field} /> : <Input readOnly className='text-xl w-fit border-none bg-inherit'{...field} />}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </h2>

                            <h2 className=" flex flex-row items-center font-normal text-[18px]  text-color-main"><span className="font-semibold mr-2">UserName:</span>{data.username}</h2>
                            <h2 className=" flex flex-row items-center font-normal text-[18px]  text-color-main"><span className="font-semibold mr-2">Email:</span>{data.email}</h2>
                            <h2 className=" flex flex-row items-center font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">Mobile :</span>
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                {editMode === true ? <Input className='text-xl w-fit'{...field} /> : <Input readOnly className='text-xl w-fit border-none bg-inherit'{...field} />}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </h2>
                            <h2 className=" flex flex-row items-center font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">Social media Url :</span>
                                <FormField
                                    control={form.control}
                                    name="facebook"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                {editMode === true ? <Input className='text-xl w-fit'{...field} /> : <Link href={data.facebook as string}>{data.facebook}</Link>}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </h2>
                            <h2 className=" flex flex-row items-center font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">Social media Url :</span>
                                <FormField
                                    control={form.control}
                                    name="linkedin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                {editMode === true ? <Input className='text-xl w-fit'{...field} /> : <Link href={data.linkedin as string}>{data.linkedin}</Link>}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </h2>

                        </div>
                    </div>
                    <div className="p-2">
                        <FormField
                            control={form.control}
                            name="about"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        {editMode === true ? <FormField
                                            control={form.control}
                                            name="about"
                                            render={({ field }) => (
                                                <FormItem className="">
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl className="">
                                                        <UpdatedEditor content={data.about} description={field.name} onChange={field.onChange} value={field.value} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        /> : <div className='p-4 border-[2px] rounded'>
                                            {htmlConvert(data.about)}
                                        </div>
                                        }

                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                </form>
            </Form>
        </div>
    )
}

export default MemberProfileEdit