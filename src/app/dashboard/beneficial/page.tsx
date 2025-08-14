import React, { Suspense } from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { BeneficialDonorIProps, BeneficialIProps, LoanIProps, PaymentIProps } from '@/types';
import { cookies } from 'next/headers';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/components/DeleteButton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { ClipboardPenLine } from 'lucide-react';
import PaginationPart from '@/components/Pagination';
import { getBorrowers } from '@/lib/getBorrowers';
import SearchBox from '@/components/SearchBox';
import { getSearchBorrowers } from '@/lib/SearchBorrowers';
import { unstable_noStore } from 'next/cache';
import Image from 'next/image';

function SearchBarFallback() {
    return <>placeholder</>
}



async function BeneficialList({ searchParams }: {
    searchParams?: {
        search?: string,
        page?: string,
    }
}) {
    unstable_noStore();
    const result = await prisma.beneficial.findMany({
        include: {
            beneficialDonor: true,
            beneficialTransaction: true,
        }
    }) as BeneficialIProps[];
    const query = searchParams?.search || "all";
    const page = searchParams?.page || "1";
    const borrowers = await getSearchBorrowers(query, page);
    const pageSize = 10; // Number of items per page
    const start = (Number(page) - 1) * pageSize;
    const end = start + pageSize;

    function getStatus(item: BeneficialIProps): string {
        if (item.beneficialDonorId) {
            return "Active";
        }
        return "Inactive";
    }



    return (
        <>
            <TableBody>
                {
                    result.map((item, index: number) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">
                                <Image src={item.photoUrl.at(0) as string} alt={item.name} width={100} height={100} priority />
                            </TableCell>
                            <TableCell className="font-medium uppercase">
                                <div className=' flex flex-col gap-1'>
                                    <span>{item.village}</span>
                                    <span>{item.postoffice}</span>
                                    <span>{item.district}</span>
                                    <span>{item.policeStation}</span>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium uppercase">
                                {getStatus(item)}
                            </TableCell>
                            <TableCell className="font-medium uppercase">
                                <Button className='bg-color-main' variant={"outline"} size={"sm"} asChild>
                                    <Link href={`/dashboard/beneficial/${item.username}`}>Details</Link>
                                </Button>
                            </TableCell>
                            <TableCell className="font-medium uppercase">
                                {
                                    item.beneficialDonorId ? (
                                        <Button className='bg-color-main' variant={"outline"} size={"sm"} asChild>
                                            <Link href={`/dashboard/beneficial/donor/${item.beneficialDonor?.username}`}>Details</Link>
                                        </Button>
                                    ) : " not available"

                                }
                            </TableCell>
                            <TableCell className="font-medium uppercase">
                                <Button className='bg-color-main' variant={"outline"} size={"sm"} asChild>
                                    <Link href={`${item.username}`}><ClipboardPenLine /></Link>
                                </Button>
                            </TableCell>
                            <TableCell className="font-medium uppercase">
                                <DeleteButton type='beneficial' username={item.username} />
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </>
    )
};



async function page(
    { searchParams }: {
        searchParams?: {
            search?: string,
            page?: string,
        }
    }
) {
    const query = searchParams?.search || "all";
    const pageNumber = await getBorrowers(query);
    const length = pageNumber?.length;
    return (
        <div className='flex flex-col'>

            <div className="flex flex-row justify-between p-2 ">
                <Button asChild>
                    <Link className=' bg-color-main hover:bg-color-sub' href={`borrowers/create`}>Borrowers Create</Link>
                </Button>
                <Suspense fallback={<SearchBarFallback />}>
                    <SearchBox />
                </Suspense>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Donor</TableHead>
                        <TableHead>UPDATED</TableHead>
                        <TableHead>DELETE</TableHead>
                    </TableRow>
                </TableHeader>
                <Suspense fallback={<h2 className='p-4 text-center '>Loading...</h2>} >
                    <BeneficialList searchParams={searchParams} />
                </Suspense>
            </Table>
            <div className="flex justify-center py-2">
                <PaginationPart item={10} data={length} />
            </div>

        </div>
    )
}

export default page