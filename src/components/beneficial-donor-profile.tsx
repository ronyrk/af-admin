"use client";

import { BeneficialDonorIProps, BeneficialDonorUpdatedIProps, BeneficialTransactionIProps, DonorIProps, DonorPaymentIProps } from '@/types';
import Image from 'next/image'
import React, { useState } from 'react'
import DonorTable from './DataTable';
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
    name: z.string(),
    live: z.string(),
    homeTown: z.string(),
    photoUrl: z.string(),
    about: z.string(),

});

function BeneficialDonorProfileEdit({ data }: { data: BeneficialDonorIProps }) {

    const { username, name, photoUrl, about, live, homeTown } = data;
    const [image, setImage] = useState<string>(data.photoUrl);

    const upload = image.length >= 1;

    function calculateTotal(data: BeneficialTransactionIProps[]) {
        return data.reduce((total, transaction) => {
            return total + (parseFloat(transaction.amount) || 0);
        }, 0);
    }



    const [editMode, setEditMode] = useState<Boolean>(false);
    const router = useRouter();

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name,
            photoUrl,
            about,
            live,
            homeTown

        }
    });

    // 2. Define a mutation.
    const { mutate, isPending } = useMutation({
        mutationFn: async ({ name, photoUrl, about, live, homeTown }: BeneficialDonorUpdatedIProps) => {
            const response = await axios.patch(`/api/beneficial/donor/${username}`, {
                username, name, photoUrl, about, live, homeTown
            });
            return response.data;
        },

    });
    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        const { name, photoUrl, about, live, homeTown } = values;

        // Branch Created
        mutate({ name, photoUrl, about, live, homeTown }, {
            onSuccess: ({ message, result }: { message: string, result: BeneficialDonorIProps }) => {
                if (result.id) {
                    toast.success(message);
                } else {
                    toast.error("Donor Updated Failed");
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
                            <Image sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className=' rounded-md object-cover' src={data.photoUrl} alt={data.name} width={300} height={140} />
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
                                                {editMode === true ? <Input className='text-xl w-fit'{...field} /> : <h2 className='text-xl'>{field.value}</h2>}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </h2>
                            <h2 className=" flex flex-row items-center font-normal text-[18px]  text-color-main"><span className="font-semibold mr-2">Home Town :</span>
                                <FormField
                                    control={form.control}
                                    name="homeTown"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                {editMode === true ? <Input className='text-xl w-fit'{...field} /> : <h2 className='text-xl'>{field.value}</h2>}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /></h2>
                            <h2 className=" flex flex-row items-center font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">Lives in :</span>
                                <FormField
                                    control={form.control}
                                    name="live"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                {editMode === true ? <Input className='text-xl w-fit'{...field} /> : <h2 className='text-xl'>{field.value}</h2>}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /></h2>
                            <h2 className='text-xl'>Total Donate Amount:- {calculateTotal(data.beneficialTransaction || [])}</h2>

                        </div>
                    </div>
                    <div className="p-2">
                        <FormField
                            control={form.control}
                            name="about"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        {editMode === true ? <UpdatedEditor content={about} description={field.name} onChange={field.onChange} value={field.value} /> : <div className='py-4' dangerouslySetInnerHTML={{ __html: about?.split("^")[0] }} />}

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

export default BeneficialDonorProfileEdit