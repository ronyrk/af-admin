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
import { BeneficialIProps } from '@/types';

interface BeneficialListProps {
    data: BeneficialIProps[];
}

function getStatus(item: BeneficialIProps): string {
    return item.beneficialDonorId ? "Active" : "Inactive";
}

const BeneficialRow = memo(({ item }: { item: BeneficialIProps }) => (
    <TableRow>
        <TableCell className="font-medium">
            <Image
                src={item.photoUrl.at(0) as string}
                alt={item.name}
                width={100}
                height={100}
                priority
                className="rounded-lg object-cover"
            />
        </TableCell>
        <TableCell className="font-medium">
            <div className="flex flex-col gap-1">
                <span className="font-semibold text-lg">{item.name}</span>
                <span className="text-sm text-blue-600 font-medium">{item.phone}</span>
                <span className="text-sm text-gray-600">Village: {item.village}</span>
                <span className="text-sm text-gray-600">Post: {item.postoffice}</span>
                <span className="text-sm font-medium">District: {item.district}</span>
                <span className="text-sm font-medium">PS: {item.policeStation}</span>
                <span className="text-sm text-gray-600">Occupation: {item.occupation}</span>
            </div>
        </TableCell>
        <TableCell className="font-medium">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatus(item) === 'Active'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                {getStatus(item)}
            </span>
            {getStatus(item) === 'Inactive' && (
                <div className="text-xs text-red-600 mt-1 font-medium">
                    Priority: Needs Donor
                </div>
            )}
        </TableCell>
        <TableCell className="font-medium">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" variant="default" size="sm" asChild>
                <Link href={`/dashboard/beneficial/${item.username}`}>View Details</Link>
            </Button>
        </TableCell>
        <TableCell className="font-medium">
            {item.beneficialDonorId ? (
                <Button className="bg-green-600 hover:bg-green-700 text-white" variant="default" size="sm" asChild>
                    <Link href={`/dashboard/beneficial/donor/${item.beneficialDonor?.username}`}>
                        Donor Details
                    </Link>
                </Button>
            ) : (
                <span className="text-gray-500 text-sm">No donor assigned</span>
            )}
        </TableCell>
        <TableCell className="font-medium">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" variant="default" size="sm" asChild>
                <Link href={`${item.username}/edit`}>
                    <ClipboardPenLine className="h-4 w-4" />
                </Link>
            </Button>
        </TableCell>
        <TableCell className="font-medium">
            <DeleteButton type="beneficial" username={item.username} />
        </TableCell>
    </TableRow>
));

BeneficialRow.displayName = 'BeneficialRow';

const BeneficialList = memo(({ data }: BeneficialListProps) => (
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
                            <p className="text-gray-500 text-lg font-medium">No beneficiaries found</p>
                            <p className="text-gray-400 text-sm">Try adjusting your search criteria or clear all filters</p>
                        </div>
                    </div>
                </TableCell>
            </TableRow>
        ) : (
            data.map((item) => (
                <BeneficialRow key={item.id} item={item} />
            ))
        )}
    </TableBody>
));

BeneficialList.displayName = 'BeneficialList';

export default BeneficialList;
