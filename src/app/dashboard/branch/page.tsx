import React, { Suspense } from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button"
import Link from 'next/link';
import { BranchIProps } from '@/types';
import { cookies } from 'next/headers';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/components/DeleteButton';

async function BranchList() {
    cookies();
    let res = await fetch('https://af-admin.vercel.app/api/branch');
    if (!res.ok) {
        throw new Error("Failed to fetch data");
    };
    let branches: BranchIProps[] = await res.json();

    return (
        <TableBody>
            {
                branches.map((item, index: number) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell className="font-medium uppercase">{item.branchName}</TableCell>
                        <TableCell className="font-medium " >{item.email}</TableCell>
                        <TableCell className="font-medium ">{item.password}</TableCell>
                        <TableCell className="font-medium ">
                            <Button className=' bg-color-main' variant={"outline"} size={"sm"} asChild>
                                <Link href={`/dashboard/branch/${item.username}`}>Updated</Link>
                            </Button>
                        </TableCell>
                        <TableCell className="font-medium uppercase">
                            <Suspense fallback={<h2>Loading...</h2>}>
                                <DeleteButton type="branch" username={item.username} />
                            </Suspense>
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
            <div className="p-2 flex justify-between ">
                <Button asChild>
                    <Link className=' bg-color-main hover:bg-color-sub' href={`dashboard/branch/branch_create`}>Branch Create</Link>
                </Button>
                <Input className='w-64' type="text" placeholder="Search" />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>CODE</TableHead>
                        <TableHead className='md:w-[300px]'>BRANCH</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Password</TableHead>
                        <TableHead>Update</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <Suspense fallback={<h2 className=' text-center p-4'>Loading...</h2>} >
                    <BranchList />
                </Suspense>
            </Table>

        </div>
    )
}

export default page