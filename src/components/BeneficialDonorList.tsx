import React, { memo } from 'react';
import {
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ClipboardPenLine } from 'lucide-react';
import DeleteButton from '@/components/DeleteButton';
import Image from 'next/image';
import { BeneficialDonorIProps, BeneficialIProps, BeneficialTransactionIProps } from '@/types';

interface BeneficialListProps {
    data: BeneficialDonorIProps[];
}

function calculateTotal(data: BeneficialTransactionIProps[]) {
    return data.reduce((total, transaction) => {
        return total + (parseFloat(transaction.amount) || 0);
    }, 0);
}


const BeneficialDonorRow = memo(({ item }: { item: BeneficialDonorIProps }) => (
    <TableRow className="hover:bg-gray-50 transition-colors">
        <TableCell className="font-medium p-4">
            <div className="flex items-start gap-4">
                {/* Image */}
                <div className="flex-shrink-0">
                    <Image
                        src={item.photoUrl}
                        alt={item.name}
                        width={80}
                        height={80}
                        priority
                        className="rounded-lg object-cover border-2 border-gray-200"
                    />
                </div>

                {/* Personal Details right next to image */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1">
                        {/* Address section with better formatting */}
                        <div className="mt-2 space-y-1">
                            <div className="flex justify-start items-center gap-2 text-sm">
                                <span className="font-medium text-gray-700">{item.name}</span>
                            </div>
                            <div className="flex justify-start items-center gap-2 text-sm">
                                <span className="text-gray-500">🏠</span>
                                <span className="font-medium text-gray-700">{item.live}</span>
                            </div>
                            <div className="flex justify-start items-center gap-2 text-sm">
                                <span className="text-gray-500">🏠</span>
                                <span className="font-medium text-gray-700">{item.homeTown}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TableCell>
        <TableCell className="font-medium p-4">
            <div className="">
                <p className="text-gray-500 text-lg font-medium">{calculateTotal(item.beneficialTransaction || [])}</p>
            </div>
        </TableCell>
        <TableCell className="font-medium p-4">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white w-full" variant="default" size="sm" asChild>
                <Link href={`${item.username}`}>
                    <ClipboardPenLine className="h-4 w-4 mr-1" />
                    Edit
                </Link>
            </Button>
        </TableCell>

        <TableCell className="font-medium p-4">
            <div className="w-full">
                <DeleteButton type="beneficial/donor" username={item.username} />
            </div>
        </TableCell>
    </TableRow>
));

BeneficialDonorRow.displayName = 'BeneficialDonorRow';

const BeneficialDonorList = memo(({ data }: BeneficialListProps) => (
    <TableBody>
        {data.length === 0 ? (
            <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-gray-400">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.01-5.824-2.562M15 6.306A7.962 7.962 0 0112 5c-2.34 0-4.29 1.01-5.824 2.562" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 text-lg font-medium">No beneficial donors found</p>
                            <p className="text-gray-400 text-sm">Try adjusting your search criteria or clear all filters</p>
                        </div>
                    </div>
                </TableCell>
            </TableRow>
        ) : (
            data.map((item) => (
                <BeneficialDonorRow key={item.id} item={item} />
            ))
        )}
    </TableBody>
));

BeneficialDonorList.displayName = 'BeneficialDonorList';

export default BeneficialDonorList;