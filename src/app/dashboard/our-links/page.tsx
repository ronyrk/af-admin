import React, { Suspense } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AllLinkIProps, DonorIProps, DonorPaymentIProps } from '@/types';
import { cookies } from 'next/headers';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/components/DeleteButton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import moment from 'moment';
import { ClipboardPenLine } from 'lucide-react';




async function LinkList() {
    cookies();
    let res = await fetch('https://af-admin.vercel.app/api/all-links');
    if (!res.ok) {
        throw new Error("Failed to fetch data");
    };
    const links: AllLinkIProps[] = await res.json();


    return (
        <TableBody>
            {
                links.map((item, index: number) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium uppercase">{item.name}</TableCell>
                        <TableCell className="font-medium uppercase">{item.type}</TableCell>
                        <TableCell className="font-medium uppercase">
                            <DeleteButton type='our-links' username={item.id as string} />
                        </TableCell>
                    </TableRow>
                ))
            }
        </TableBody>
    )
};



async function page() {
    return (
        <div className='flex flex-col'>
            <h2 className="text-xl text-center">Our Links</h2>
            <div className="flex justify-between p-2 ">
                <Button asChild>
                    <Link className=' bg-color-main hover:bg-color-sub' href={`our-links/create`}> Create</Link>
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Index</TableHead>
                        <TableHead className='w-[200px]'>NAME</TableHead>
                        <TableHead>TYPE</TableHead>
                        <TableHead>DELETED</TableHead>
                    </TableRow>
                </TableHeader>
                <Suspense fallback={<h2 className='p-4 text-center '>Loading...</h2>} >
                    <LinkList />
                </Suspense>
            </Table>

        </div>
    )
}

export default page