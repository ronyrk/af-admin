import React, { memo, useMemo } from 'react';
import {
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ClipboardPenLine, MapPin, Home, Users, DollarSign, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import DeleteButton from '@/components/DeleteButton';
import Image from 'next/image';
import { BeneficialDonorIProps, BeneficialTransactionIProps } from '@/types';
import { Badge } from '@/components/ui/badge';
import { tree } from 'next/dist/build/templates/app-page';

interface BeneficialListProps {
    data: BeneficialDonorIProps[];
    currentPage: number;
    pageSize: number;
}

// Separate calculation functions for different transaction types
const calculateDonationTotal = (data: BeneficialTransactionIProps[]): number => {
    if (!data || !Array.isArray(data)) return 0;
    return data
        .filter(tx => tx?.paymentType === 'donate')
        .reduce((total, transaction) => {
            const amount = parseFloat(transaction?.amount || '0') || 0;
            return total + amount;
        }, 0);
};

const calculateSpendingTotal = (data: BeneficialTransactionIProps[]): number => {
    if (!data || !Array.isArray(data)) return 0;
    return data
        .filter(tx => tx?.paymentType === 'spend')
        .reduce((total, transaction) => {
            const amount = parseFloat(transaction?.amount || '0') || 0;
            return total + amount;
        }, 0);
};

// Format currency with proper localization
const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
};

// Get status based on amount and type
const getAmountStatus = (amount: number, type: 'donation' | 'spending' | 'balance') => {
    if (type === 'balance') {
        if (amount > 0) return { color: 'text-green-600', icon: TrendingUp, bgColor: 'bg-green-50' };
        if (amount < 0) return { color: 'text-red-600', icon: TrendingDown, bgColor: 'bg-red-50' };
        return { color: 'text-gray-600', icon: Minus, bgColor: 'bg-gray-50' };
    }

    if (amount === 0) return { color: 'text-gray-500', icon: Minus, bgColor: 'bg-gray-50' };
    if (amount < 10000) return { color: 'text-yellow-600', icon: TrendingUp, bgColor: 'bg-yellow-50' };
    if (amount < 50000) return { color: 'text-blue-600', icon: TrendingUp, bgColor: 'bg-blue-50' };
    return { color: 'text-green-600', icon: TrendingUp, bgColor: 'bg-green-50' };
};

// Enhanced empty state component
const EmptyState = memo(() => (
    <TableRow>
        <TableCell colSpan={6} className="py-20">
            <div className="flex flex-col items-center justify-center space-y-8">
                <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
                        <Users className="w-16 h-16 text-gray-400" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center shadow-sm">
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-4 max-w-md">
                    <h3 className="text-2xl font-bold text-gray-900">
                        No Donors Found
                    </h3>
                    <div className="space-y-2">
                        <p className="text-gray-600 text-lg">
                            There are currently no beneficial donors in the system.
                        </p>
                        <p className="text-sm text-gray-500">
                            Start by adding your first donor to begin tracking donations and spending.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => window.location.reload()}
                        className="min-w-[140px]"
                    >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Refresh Page
                    </Button>
                    <Button
                        variant="default"
                        size="lg"
                        asChild
                        className="min-w-[140px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                        <Link href="/dashboard/beneficial/create">
                            <Users className="w-4 h-4 mr-2" />
                            Add First Donor
                        </Link>
                    </Button>
                </div>
            </div>
        </TableCell>
    </TableRow>
));

EmptyState.displayName = 'EmptyState';

// Enhanced donor row component with proper calculations
const BeneficialDonorRow = memo(({ item, index }: { item: BeneficialDonorIProps; index: number }) => {
    // Memoize all calculations
    const financialData = useMemo(() => {
        const donations = calculateDonationTotal(item.beneficialTransaction || []);
        const spending = calculateSpendingTotal(item.beneficialTransaction || []);
        const balance = donations - spending;

        return {
            donations,
            spending,
            balance,
            formattedDonations: formatCurrency(donations),
            formattedSpending: formatCurrency(spending),
            formattedBalance: formatCurrency(balance)
        };
    }, [item.beneficialTransaction]);


    return (
        <TableRow className="hover:bg-gray-50 hover:shadow-lg transition-shadow duration-200 my-4">
            <TableCell className="font-medium py-2 text-center">
                <div className="flex items-center justify-start min-h-[80px]">
                    <span className="text-base text-gray-700 bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                        {index}
                    </span>
                </div>
            </TableCell>
            {/* Profile Section */}
            <TableCell className="p-3">
                <div className="flex items-start gap-4">
                    {/* Enhanced Image Section */}
                    <div className="relative flex-shrink-0">
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <Image
                                src={item.photoUrl || '/placeholder-avatar.png'}
                                alt={`${item.name}'s profile`}
                                fill
                                className="object-cover"
                                sizes="64px"
                                priority
                            />
                        </div>
                    </div>

                    {/* Enhanced Details Section */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                                {item.name || 'Unnamed Donor'}
                            </h3>
                        </div>

                        {/* Location Information */}
                        <div className="space-y-1">
                            {item.live && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <span className="truncate">
                                        <span className="font-medium">Lives in:</span> {item.live}
                                    </span>
                                </div>
                            )}

                            {item.homeTown && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Home className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                    <span className="truncate">
                                        <span className="font-medium">From:</span> {item.homeTown}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </TableCell>

            {/* Donations Column */}
            <TableCell className="p-1 font-semibold">
                {financialData.formattedDonations}
            </TableCell>

            {/* Spending Column */}
            <TableCell className="p-1 font-semibold">
                {financialData.formattedSpending}
            </TableCell>


            {/* Balance Column */}
            <TableCell className="p-1 font-semibold">
                {financialData.formattedBalance}
            </TableCell>

            {/* Actions Column */}
            <TableCell className="p-2">
                <div className="flex flex-col gap-2">
                    <Button
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 group-hover:scale-[1.02] w-full"
                        variant="default"
                        size="sm"
                        asChild
                    >
                        <Link
                            href={`/dashboard/beneficiaries/donor/${item.username || item.id}`}
                            className="flex items-center justify-center gap-2"
                        >
                            <ClipboardPenLine className="h-4 w-4" />
                            View Profile
                        </Link>
                    </Button>

                    <div className="w-full">
                        <DeleteButton
                            type="beneficial/donor"
                            username={item.username as string}
                        />
                    </div>
                </div>
            </TableCell>
        </TableRow>
    );
});

BeneficialDonorRow.displayName = 'BeneficialDonorRow';

// Main component with enhanced error handling
const BeneficialDonorList = memo(({ data, currentPage, pageSize }: BeneficialListProps) => {
    const startIndex = (currentPage - 1) * pageSize + 1;
    // Validate and sanitize data
    const validData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return data.filter(item => item && typeof item === 'object' && item.id);
    }, [data]);

    return (
        <>
            {validData.length === 0 ? (
                <EmptyState />
            ) : (
                validData.map((item, arrayIndex) => (
                    <BeneficialDonorRow key={item.id || item.username} item={item} index={startIndex + arrayIndex} />
                ))
            )}
        </>
    );
});

BeneficialDonorList.displayName = 'BeneficialDonorList';

export default BeneficialDonorList;