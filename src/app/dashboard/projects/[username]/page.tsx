import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cookies } from 'next/headers';
import React, { Suspense } from 'react'
import prisma from '@/lib/prisma';
import moment from 'moment';
import DeleteButton from '@/components/DeleteButton';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

async function getDetails(id: string) {
    const data = await prisma.donate.findUnique({
        where: {
            id
        }
    });
    return (
        <div className="flex flex-col gap-2 justify-between p-1  rounded-md">
            <h2 className=" text-base font-normal">Date:- {`${moment(data?.createAt).format('DD/MM/YYYY')}`} </h2>
            <h2 className=" text-base font-normal">Phone or Email:- {data?.email} </h2>
            <h2 className=" text-base font-normal">Payment Method:- {data?.method} </h2>
            <h2 className=" text-base font-normal">Send Number:- {data?.sendNumber} </h2>
            <h2 className=" text-base font-normal">Transaction ID:- {data?.transaction} </h2>
            <div className=" flex flex-row gap-2 items-center">
                <h2 className=" text-lg font-medium">File:-</h2>
                <a href={data?.photoUrl as string} target="_blank" rel="noopener noreferrer">{data?.photoUrl}</a>
            </div>
            <p className=" text-base font-normal">Note:- {data?.about} </p>
        </div>
    )
}

async function DonateList({ username }: { username: string }) {
    cookies();
    const donateList = await prisma.donate.findMany({
        where: {
            projectName: username,
        }, orderBy: {
            createAt: "desc"
        }
    });

    return (
        <TableBody>
            {
                donateList.map((item, index: number) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{`${moment(item?.createAt).format('DD/MM/YYYY')}`}</TableCell>
                        <TableCell>
                            <Accordion type="single" collapsible className="w-full border-[1px] rounded-md">
                                <AccordionItem className=' border-none' value={`item-${index}`}>
                                    <AccordionTrigger><span className=" font-medium uppercase px-2">{item.name}</span></AccordionTrigger>
                                    <AccordionContent className=''>
                                        {getDetails(item.id)}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </TableCell>
                        <TableCell className="font-medium uppercase">{item.amount}</TableCell>
                        <TableCell className="font-medium uppercase">{item.type}</TableCell>
                        <TableCell className="font-medium uppercase">
                            <DeleteButton type='donate' username={item?.id} />
                        </TableCell>
                    </TableRow>
                ))
            }
        </TableBody>
    )
};

function page({ params }: {
    params: {
        username: string
    }
}) {
    return (
        <div className='flex flex-col'>
            <h2 className="text-center uppercase text-xl my-4">{params.username}  Project Donates List</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>DATE</TableHead>
                        <TableHead className='w-[500px] uppercase'>Title</TableHead>
                        <TableHead className=' uppercase'>Amount</TableHead>
                        <TableHead className=' uppercase'>Payment Type</TableHead>
                        <TableHead className=' uppercase'>Deleted</TableHead>
                    </TableRow>
                </TableHeader>
                <Suspense fallback={<h2 className=' text-center p-4'>Loading...</h2>} >
                    <DonateList username={params.username} />
                </Suspense>
            </Table>

        </div>
    )
}

export default page