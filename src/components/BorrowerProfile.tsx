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
import { LoanIProps, LoanIUpdatedProps, PaymentIProps } from "@/types"
import { Suspense, useState } from "react"
import { UploadButton } from "@/lib/uploadthing"
import { Textarea } from "@/components/ui/textarea"
import { SquarePen, View } from "lucide-react"
import Image from "next/image"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "./ui/label"

const formSchema = z.object({
    about: z.optional(z.string()),
    phone: z.string(),
    occupation: z.string(),
    address: z.string(),
    name: z.string(),
    code: z.string(),
});

function BorrowerProfile({ data, paymentList }: { data: LoanIProps, paymentList: PaymentIProps[] }) {
    const [image, setImage] = useState<string>(data.photosUrl);
    const [nidFont, setNidFont] = useState<string>(data.nidfont);
    const [nidBack, setNidBack] = useState<string>(data.nidback);
    const [Form1, setForm1] = useState<string>(data.form1);
    const [Form2, setForm2] = useState<string>(data.form2);
    const [editMode, setEditMode] = useState<Boolean>(false);

    const totalBalance = async () => {
        let indexPaymentString: string[] = ["0"];
        const result = paymentList.forEach((item) => indexPaymentString.push(item.loanAmount));
        let indexPayment = indexPaymentString.map(Number);
        const loanSumAmount = indexPayment.reduce((accumulator, currentValue) => accumulator + currentValue, Number(data.balance));
        return `${loanSumAmount}`;
    }

    const duePayment = async () => {
        let indexPaymentString2: string[] = ["0"];
        paymentList.forEach((item) => indexPaymentString2.push(item.loanAmount));
        let indexPayment2 = indexPaymentString2.map(Number);
        const totalBalance = indexPayment2.reduce((accumulator, currentValue) => accumulator + currentValue, Number(data.balance));

        let indexPaymentString: string[] = ["0"];
        const result = paymentList.forEach((item) => indexPaymentString.push(item.amount));
        let indexPayment = indexPaymentString.map(Number);
        const loanSumAmount = indexPayment.reduce((accumulator, currentValue) => accumulator - currentValue, totalBalance);
        return `${loanSumAmount}`;
    }

    const allPayment = async () => {
        let indexPaymentString: string[] = ["0"];
        const result = paymentList.forEach((item) => indexPaymentString.push(item.amount));
        let indexPayment = indexPaymentString.map(Number);
        const Amount = indexPayment.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        return `${Amount}`;
    }

    const router = useRouter();
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: data.code,
            name: data.name,
            occupation: data.occupation,
            phone: data.phone,
            about: data.about,
            address: data.address,
        },
    });
    const { mutate, isPending } = useMutation({
        mutationFn: async ({ name, address, about, form1, form2, nidback, nidfont, occupation, phone, photosUrl, code }: LoanIUpdatedProps) => {
            const response = await axios.patch(`/api/loan/${data.username}`, {
                name, address, about, form1, form2, nidback, nidfont, occupation, phone, photosUrl, code
            });
            return response.data;
        },
    });

    const upload = image.length >= 1 && nidBack.length >= 1 && nidFont.length >= 1 && Form1.length >= 1 && Form2.length >= 1;

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        const photosUrl = image;
        const form1 = Form1;
        const form2 = Form2;
        const nidfont = nidFont;
        const nidback = nidBack;
        const address = values.address;
        const name = values.name;
        const occupation = values.occupation;
        const phone = values.phone;
        const about = values.about;
        const code = values.code;

        // Branch Created
        mutate({ name, address, code, about, form1, form2, nidback, nidfont, occupation, phone, photosUrl }, {
            onSuccess: ({ message, result }: { message: string, result: LoanIProps }) => {
                if (result?.id) {
                    toast.success(message);
                } else {
                    throw new Error("Borrowers Updated  Failed")
                }
                setEditMode(false);
                router.refresh();
            },
            onError: (error) => {
                toast.error("Borrowers Updated  Failed");
            }
        });
    };
    return (
        <div className='flex flex-col'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    {/* Hello */}
                    <div className="flex md:flex-row flex-col justify-between gap-1 relative">
                        <div className=" absolute flex flex-row gap-2 top-2 right-4">
                            {editMode === true && <div>
                                {isPending ? <Button disabled >Loading...</Button> : <Button disabled={upload === false} type="submit">Submit</Button>}
                            </div>}
                            <Button type="button" onClick={() => setEditMode(!editMode)} className=' cursor-pointer bg-inherit' variant={"secondary"}>
                                <SquarePen />
                            </Button>
                        </div>
                        <div className=" basis-3/12 border-[2px] p-1 flex  relative rounded">
                            <Image sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className=' rounded-md object-cover' src={data.photosUrl} alt={data.name} width={300} height={140} />
                            {
                                editMode === true ? <span className=" absolute top-0 bg-white right-0 border-[2px] text-[13px] lowercase font-normal p-[1px] rounded">
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
                        <div className="basis-5/12 border-[2px] p-2 rounded flex flex-col justify-around gap-1">
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
                            <h2 className=" flex flex-row items-center font-normal text-[15px]  text-color-main"><span className="font-semibold">code :</span>
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                {editMode === true ? <Input className='text-lg '{...field} /> : <Input readOnly className='text-lg  border-none bg-inherit'{...field} />}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /></h2>
                            <h2 className=" flex flex-row items-center font-normal text-[15px]  text-color-main"><span className="font-semibold">Lives in :</span>
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                {editMode === true ? <Input className='text-lg '{...field} /> : <Input readOnly className='text-lg  border-none bg-inherit'{...field} />}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /></h2>
                            <h2 className=" flex flex-row items-center font-normal text-[18px]  text-color-main"><span className="font-semibold mr-2">Occupation :</span>
                                <FormField
                                    control={form.control}
                                    name="occupation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                {editMode === true ? <Input className='text-lg w-fit'{...field} /> : <Input readOnly className='text-lg w-fit border-none bg-inherit'{...field} />}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /></h2>

                            <h2 className=" flex flex-row items-center font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">Phone:</span>
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
                            <h2 className=" flex flex-row items-center font-normal text-[18px]  text-color-main"><span className="font-semibold mr-2">Code:</span>{data.code}</h2>
                            <h2 className=" flex flex-row items-center font-normal text-[18px]  text-color-main"><span className="font-semibold mr-2">UserName:</span>{data.username}</h2>
                            <h2 className=" flex flex-row items-center font-normal text-[18px]  text-color-main"><span className="font-semibold mr-2">Branch:</span>{data.branch}</h2>


                            <h2 className=" font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">মোট ঋণ:</span>{totalBalance()}</h2>


                            <h2 className=" font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">মোট পরিশোধিত ঋণ:</span>{allPayment()}</h2>
                            <h2 className=" font-normal text-[15px]  text-color-main"><span className="font-semibold mr-2">বকেয়া ঋণ:</span>{duePayment()}</h2>
                        </div>
                        <div className=" basis-4/12 border-[2px] rounded px-3 text-center pt-3 flex flex-col justify-around">
                            <h2 className=" font-semibold text-xl mt-4 text-color-main">Borrowers Documents</h2>
                            <div className="px-4">
                                <div className=" flex flex-row justify-between items-center">
                                    <h2 className=" font-semibold text-[15px] py-2 text-color-main">Application Form 1 </h2>

                                    {
                                        editMode === true ? <div className="flex flex-col items-center justify-center p-0">
                                            <UploadButton
                                                className="ut-button:bg-color-sub ut-button:ut-readying:bg-color-sub/80"
                                                endpoint="imageUploader"
                                                onClientUploadComplete={(res) => {
                                                    setForm1(res[0].url)
                                                    toast.success("Image Upload successfully")
                                                }}
                                                onUploadError={(error: Error) => {
                                                    // Do something with the error.
                                                    toast.error(error.message);
                                                }}
                                            />
                                        </div> : <Dialog>
                                            <DialogTrigger><View /></DialogTrigger>
                                            <DialogContent>
                                                <Suspense fallback={<h2 className='text-center'>Loading...</h2>}>
                                                    <Image sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" src={data.form1} alt="application from" className='rounded ' width={450} height={200} />
                                                </Suspense>
                                            </DialogContent>

                                        </Dialog>
                                    }
                                </div>
                                <div className=" flex flex-row justify-between items-center">
                                    <h2 className=" font-semibold text-[15px] py-2 text-color-main">Application Form 2 </h2>
                                    {
                                        editMode === true ? <div className="flex flex-col items-center justify-center p-0">
                                            <UploadButton
                                                className="ut-button:bg-color-sub ut-button:ut-readying:bg-color-sub/80"
                                                endpoint="imageUploader"
                                                onClientUploadComplete={(res) => {
                                                    setForm2(res[0].url)
                                                    toast.success("Image Upload successfully")
                                                }}
                                                onUploadError={(error: Error) => {
                                                    // Do something with the error.
                                                    toast.error(error.message);
                                                }}
                                            />
                                        </div> : <Dialog>
                                            <DialogTrigger><View /></DialogTrigger>
                                            <DialogContent>
                                                <Suspense fallback={<h2 className='text-center'>Loading...</h2>}>
                                                    <Image sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" src={data.form2} alt="application from" className='rounded ' width={450} height={200} />
                                                </Suspense>
                                            </DialogContent>

                                        </Dialog>
                                    }
                                </div>
                                <div className="flex flex-row justify-between items-center">
                                    <h2 className=" font-semibold text-[15px] py-2 text-color-main">NID Font</h2>
                                    {
                                        editMode === true ? <div className="flex flex-col items-center justify-center p-0">
                                            <UploadButton
                                                className="ut-button:bg-color-sub ut-button:ut-readying:bg-color-sub/80"
                                                endpoint="imageUploader"
                                                onClientUploadComplete={(res) => {
                                                    setNidFont(res[0].url)
                                                    toast.success("Image Upload successfully")
                                                }}
                                                onUploadError={(error: Error) => {
                                                    // Do something with the error.
                                                    toast.error(error.message);
                                                }}
                                            />
                                        </div> : <Dialog>
                                            <DialogTrigger><View /></DialogTrigger>
                                            <DialogContent>
                                                <Suspense fallback={<h2 className='text-center'>Loading...</h2>}>
                                                    <Image sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" src={data.nidfont} alt="application from" className='rounded ' width={450} height={200} />
                                                </Suspense>
                                            </DialogContent>

                                        </Dialog>
                                    }
                                </div>
                                <div className="flex flex-row justify-between items-center">
                                    <h2 className=" font-semibold text-[15px] py-2 text-color-main">NID Back</h2>
                                    {
                                        editMode === true ? <div className="flex flex-col items-center justify-center p-0">
                                            <UploadButton
                                                className="ut-button:bg-color-sub ut-button:ut-readying:bg-color-sub/80"
                                                endpoint="imageUploader"
                                                onClientUploadComplete={(res) => {
                                                    setNidBack(res[0].url)
                                                    toast.success("Image Upload successfully")
                                                }}
                                                onUploadError={(error: Error) => {
                                                    // Do something with the error.
                                                    toast.error(error.message);
                                                }}
                                            />
                                        </div> : <Dialog>
                                            <DialogTrigger><View /></DialogTrigger>
                                            <DialogContent>
                                                <Suspense fallback={<h2 className='text-center'>Loading...</h2>}>
                                                    <Image sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" src={data.nidback} alt="application from" className='rounded ' width={450} height={200} />
                                                </Suspense>
                                            </DialogContent>

                                        </Dialog>
                                    }
                                </div>
                            </div>
                        </div >
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

export default BorrowerProfile