import React, { Suspense } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DistrictIProps } from '@/types';
import { cookies } from 'next/headers';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/components/DeleteButton';
import { DistrictCreate } from '@/components/DistrictCreate';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { PlusCircle } from 'lucide-react';
import { PoliceStationCreate } from '@/components/PoliceStationCreate';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


async function BeneficialDonor() {
    cookies();
    const res = await fetch('https://af-admin.vercel.app/api/district');
    if (!res.ok) {
        throw new Error("Failed to fetch data");
    };
    const districts: DistrictIProps[] = await res.json();

    return (
        <TableBody>
            {
                districts.map((item: DistrictIProps, index: number) => (
                    <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium uppercase text-blue-800">
                            <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                            >
                                <AccordionItem value={`item-${index}`}>
                                    <AccordionTrigger> {item.name}</AccordionTrigger>
                                    <AccordionContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Index</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {
                                                    item.policeStations.map((station, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{index + 1}</TableCell>
                                                            <TableCell>{station.name}</TableCell>
                                                            <TableCell>
                                                                <DeleteButton type='police-station' username={station.id} />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                }
                                            </TableBody>
                                        </Table>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </TableCell>
                        <TableCell className="font-medium uppercase">
                            <PoliceStationCreate districtId={item.id} />
                        </TableCell>
                        <TableCell className="font-medium uppercase">
                            <DeleteButton type='district' username={item.id} />
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
                    <Link href="/dashboard/beneficial/donor/create">Create Donor</Link>
                </Button>
                <Input className='w-64' type="text" placeholder="Search" />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Index</TableHead>
                        <TableHead className='w-[500px]'>NAME</TableHead>
                        <TableHead>PS</TableHead>
                        <TableHead>DELETE</TableHead>
                    </TableRow>
                </TableHeader>
                <Suspense fallback={<h2 className=' text-center p-4'>Loading...</h2>} >

                </Suspense>
            </Table>

        </div>
    )
}

export default page