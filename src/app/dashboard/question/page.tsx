import CreateFAQ from '@/components/CreateFAQ'
import { FaqProps } from '@/types';
import { unstable_noStore } from 'next/cache';
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
import DeleteButtonFAQ from '@/components/DeletedFAQ';

async function Question() {
  unstable_noStore();
  let res = await fetch('https://af-admin.vercel.app/api/faq');
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
              <DeleteButtonFAQ id={item.id} />
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
      <h2 className=" text-xl text-color-main text-center">FAQ</h2>
      <CreateFAQ />
      <div className="p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TITLE</TableHead>
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