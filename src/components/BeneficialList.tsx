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
    <TableRow className="hover:bg-gray-50 transition-colors">
        <TableCell className="font-medium p-4">
            <div className="flex items-start gap-4">
                {/* Image */}
                <div className="flex-shrink-0">
                    <Image
                        src={item.photoUrl.at(0) as string}
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
                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        {/* Address section with better formatting */}
                        <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">🏠</span>
                                <span className="font-medium text-gray-700">{item.village}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span>📮 Post: {item.postoffice}</span>
                                <span>🏛️ {item.district}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span>🚔 PS: {item.policeStation}</span>
                                <span>💼 {item.occupation}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TableCell>

        <TableCell className="font-medium p-4">
            <div className="flex flex-col items-start gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatus(item) === 'Active'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                    {getStatus(item) === 'Active' ? '✅' : '⚠️'}
                    {getStatus(item)}
                </span>
                {getStatus(item) === 'Inactive' && (
                    <div className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                        🎯 Priority: Needs Donor
                    </div>
                )}
            </div>
        </TableCell>

        <TableCell className="font-medium p-4">
            {item.beneficialDonorId ? (
                <Button className="bg-green-600 hover:bg-green-700 text-white w-full" variant="default" size="sm" asChild>
                    <Link href={`/dashboard/beneficial/donor/${item.beneficialDonor?.username}`}>
                        💝 Donor Details
                    </Link>
                </Button>
            ) : (
                <div className="text-center p-2 bg-gray-50 rounded border-2 border-dashed border-gray-300">
                    <span className="text-gray-500 text-sm block">❌ No donor</span>
                    <span className="text-xs text-gray-400">assigned yet</span>
                </div>
            )}
        </TableCell>

        <TableCell className="font-medium p-4">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white w-full" variant="default" size="sm" asChild>
                <Link href={`/dashboard/beneficial/${item.username}`}>
                    <ClipboardPenLine className="h-4 w-4 mr-1" />
                    Edit
                </Link>
            </Button>
        </TableCell>

        <TableCell className="font-medium p-4">
            <div className="w-full">
                <DeleteButton type="beneficial" username={item.username} />
            </div>
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