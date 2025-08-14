import { FaqProps } from '@/types';
import { cookies } from 'next/headers';
import React, { Suspense } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteButtonFAQ from '@/components/DeletedFAQ';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function Question() {
  cookies();
  let res = await fetch('https://af-admin.vercel.app/api/beneficial/faq');
  if (!res.ok) {
    throw new Error("Failed to fetch data list");
  };
  const data: FaqProps[] = await res.json();
  return (
    <TableBody>
      {
        data.map((item, index: number) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell className="font-medium uppercase">
              <Button className=' bg-color-main h-6' variant={"outline"} asChild>
                <Link href={`question/${item.id}`}>Updated</Link>
              </Button>
            </TableCell>
            <TableCell className="font-medium uppercase">
              <DeleteButtonFAQ path='beneficial/faq' id={item.id} />
            </TableCell>
          </TableRow>
        ))
      }
    </TableBody>
  )
}

function page() {
  return (
    <div className=" flex flex-col gap-4">
      <div className="">
        <h2 className=" text-xl text-color-main text-center">FAQ</h2>
      </div>
      <div className="flex justify-start gap-2">
        <Button className=' w-fit' size={"sm"} asChild>
          <Link href="/dashboard/beneficial/question/create">Create FAQ</Link>
        </Button>
      </div>
      <div className="p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TITLE</TableHead>
              <TableHead>UPDATED</TableHead>
              <TableHead>DELETE</TableHead>
            </TableRow>
          </TableHeader>
          <Suspense fallback={<h2 className=' text-center p-4'>Loading...</h2>} >
            <Question />
          </Suspense>
        </Table>
      </div>
    </div>
  )
}

export default page