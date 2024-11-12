"use client";

import { DonorIProps, DonorPaymentIProps } from '@/types';
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

const formSchema = z.object({
    password: z.string(),
    about: z.string(),
    lives: z.string(),
    hometown: z.string(),
    status: z.string(),
    name: z.string(),
    facebook: z.string(),
    mobile: z.string(),
    linkedin: z.string(),
});
async function getStatus(status: string) {
    if (status === "LEADER") {
        return "LENDER"
    } else {
        return status
    }
};

function ProfileEdit({ data, paymentList }: { data: DonorIProps, paymentList: DonorPaymentIProps[] }) {

    const [image, setImage] = useState<string>(data.photoUrl);

    const upload = image.length >= 1;

    const TotalAmount = async () => {
        if (data.status === "LEADER") {
            const returnArray = paymentList.filter((item) => item.type === "return");
            let returnStringArray: string[] = [];
            returnArray.forEach((item) => returnStringArray.push(item.loanPayment));
            const returnNumberArray = returnStringArray.map(Number);
            const totalReturn = returnNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

            const increaseArray = paymentList.filter((item) => item.type === "increase");
            let increaseStringArray: string[] = [];
            increaseArray.forEach((item) => increaseStringArray.push(item.amount));
            const increaseNumberArray = increaseStringArray.map(Number);
            const totalIncrease = increaseNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
            return totalIncrease - totalReturn;
        } else {
            let amountStringArray: string[] = [];
            const Create = paymentList.forEach((item) => amountStringArray.push(item.amount));
            // Convert String Array to Number Array
            let AmountArray = amountStringArray.map(Number);
            const totalAmount = AmountArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            // console.log(totalAmount, 'number array');
            return `${totalAmount}`
        }

    }

    const [editMode, setEditMode] = useState<Boolean>(false);
    const router = useRouter();

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: data.password,
            about: data.about,
            lives: data.lives,
            hometown: data.hometown,
            status: data.status,
            name: data.name,
            facebook: data.facebook,
            mobile: data.mobile,
            linkedin: data.linkedin,
        }
    });

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ password, name, photoUrl, about, lives, hometown, status, facebook, mobile, linkedin }: DonorIUpdatedProps) => {
            const response = await axios.patch(`/api/donor/${data.username}`, {
                password, name, photoUrl, about, lives, hometown, status, facebook, mobile, linkedin
            });
            return response.data;
        },
    });
    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        const photoUrl = image;
        const password = values.password;
        const name = values.name;
        const status = values.status;
        const hometown = values.hometown;
        const lives = values.lives;
        const about = values.about;
        const facebook = values.facebook;
        const mobile = values.linkedin;
        const linkedin = values.linkedin;

        // Branch Created
        mutate({ password, name, photoUrl, about, lives, hometown, status, facebook, linkedin, mobile }, {
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
                            <Image sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className=' rounded-md object-cover' src={data.photoUrl} alt={data.name} width={300} height={140} />
                            <span className=" absolute top-3 bg-white left-2 border-[2px] text-[13px] lowercase font-normal p-[1px] rounded">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={data.status}>
                                                    <FormControl>
                                                        <SelectTrigger disabled={editMode === false}>
                                                            <SelectValue placeholder="Select a verified type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="LEADER">lender</SelectItem>
                                                        <SelectItem value="DONOR">donor</SelectItem>
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
                            <h2 className=" flex flex-row items-center font-normal text-[18px]  text-color-main"><span className="font-semibold mr-2">Code:</span>{data.code}</h2>
                            <h2 className=" flex flex-row items-center font-normal text-[18px]  text-color-main"><span className="font-semibold mr-2">UserName:</span>{data.username}</h2>
                            <h2 className=" flex flex-row items-center font-normal text-[18px]  text-color-main"><span className="font-semibold mr-2">Email:</span>{data.email}</h2>
                            <h2 className=" flex flex-row items-center font-normal text-[18px]  text-color-main"><span className="font-semibold mr-2">Password :</span>
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                {editMode === true ? <Input className='text-xl w-fit'{...field} /> : <Input readOnly className='text-xl w-fit border-none bg-inherit'{...field} />}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /></h2>
                            <h2 className=" flex flex-row items-center font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">Lives in :</span>
                                <FormField
                                    control={form.control}
                                    name="lives"
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
                            <h2 className=" flex flex-row items-center font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">Mobile :</span>
                                <FormField
                                    control={form.control}
                                    name="mobile"
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
                            <h2 className=" flex flex-row items-center font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">Facebook Url :</span>
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
                            <h2 className=" flex flex-row items-center font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">Linkedin Url :</span>
                                <FormField
                                    control={form.control}
                                    name="facebook"
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
                            <h2 className=" flex flex-row items-center font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">Home town:</span>
                                <FormField
                                    control={form.control}
                                    name="hometown"
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
                            <h2 className=" font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">{data.status === "LEADER" ? "Total Lending" : "Total Donation"} :- </span>{TotalAmount()}</h2>
                        </div>
                    </div>
                    <div className="p-2">
                        <FormField
                            control={form.control}
                            name="about"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        {editMode === true ? <Textarea rows={6} placeholder="Type your message here." {...field} /> : <Textarea rows={6} readOnly className='text-xl border-none bg-inherit' placeholder="Type your message here." {...field} />}

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

export default ProfileEdit