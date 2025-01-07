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
import { OwnerIProps } from '@/types';
import { cookies } from 'next/headers';
import DeleteButton from '@/components/DeleteButton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ClipboardPenLine } from 'lucide-react';
import prisma from '@/lib/prisma';
import SearchBox from '@/components/SearchBox';
import PaginationPart from '@/components/Pagination';
import { getSearchMember } from '@/lib/getSearchMember';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

async function htmlConvert(data: string) {
    const jsonAndHtml = data.split("^");
    const html = jsonAndHtml[0];

    return (
        <div className="py-2">
            <p dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
}









async function MemberList({ searchParams }: {
    searchParams?: {
        search?: string,
        page?: string,
    }
}) {
    cookies();
    const query = searchParams?.search || "all";
    const page = searchParams?.page || "1";

    const owner = await getSearchMember(query, page) as OwnerIProps[];




    return (
        <>
            <TableBody>
                {
                    owner.map((item, index: number) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="font-medium uppercase">{item.name}</TableCell>
                            <TableCell className="font-medium uppercase">{item.type}</TableCell>
                            <TableCell className="font-medium uppercase">

                                <Dialog>
                                    <DialogTrigger>
                                        <Button className=' bg-color-main' variant={"outline"} size={"sm"} asChild>
                                            <ClipboardPenLine />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader className='p-4'>
                                            {htmlConvert(item.description)}
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>

                            </TableCell>
                            <TableCell className="font-medium uppercase">
                                <DeleteButton type='owner' username={item.id || " "} />
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </>
    )
};



async function page({ searchParams }: {
    searchParams?: {
        search?: string,
        page?: string,
    }
}) {
    const length = (await prisma.owner.findMany()).length;
    return (
        <div className='flex flex-col'>
            <h2 className="text-xl text-center">Member List</h2>
            <div className="flex justify-between p-2 ">
                <Button asChild>
                    <Link className=' bg-color-main hover:bg-color-sub' href={`owner/create`}>Member Create</Link>
                </Button>
                <SearchBox />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>INDEX</TableHead>
                        <TableHead className='w-[200px]'>NAME</TableHead>
                        <TableHead>TYPE</TableHead>
                        <TableHead>UPDATED</TableHead>
                        <TableHead>DELETED</TableHead>
                    </TableRow>
                </TableHeader>
                <Suspense fallback={<h2 className='p-4 text-center '>Loading...</h2>} >
                    <MemberList searchParams={searchParams} />
                </Suspense>
            </Table>

            <div className="flex justify-center py-4">
                <PaginationPart item={10} data={length} />
            </div>
        </div>
    )
}

export default page