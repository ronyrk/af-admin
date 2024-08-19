import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cookies } from 'next/headers';
import React, { Suspense } from 'react'
import prisma from '@/lib/prisma';
import moment from 'moment';
import DeleteButton from '@/components/DeleteButton';

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
                        <TableCell className="font-medium uppercase">
                            {item.name}
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
                        <TableHead className='w-[300px] uppercase'>Title</TableHead>
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