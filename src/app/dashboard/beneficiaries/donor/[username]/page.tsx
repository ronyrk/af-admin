import { cookies } from 'next/headers'
import React, { Suspense } from 'react'
import { BeneficialDonorIProps, BeneficialIProps, BeneficialTransactionIProps, TotalsIProps } from '@/types';
import BeneficialDonorProfileEdit from '@/components/beneficial-donor-profile';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BeneficialDonorTransactionCreate } from '@/components/beneficial-donor-transaction';
import { BeneficialDonorSpendTransactionCreate } from '@/components/beneficial-donor-transaction-spend';
import { notFound, redirect } from 'next/navigation';
import BeneficialDonorTransactionList from '@/components/donor-transactions-list';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { LoadingFallback } from '@/components/FilterSkeleton';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, Shield, Briefcase, Users, DollarSign } from 'lucide-react';

// Memoized BeneficialList component with improved design
const BeneficialList = React.memo(({ data }: { data: BeneficialIProps[] }) => {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                <p>No beneficial records found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data.map((beneficial) => (
                <Card key={beneficial.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                            {/* Enhanced Image Section */}
                            <div className="flex-shrink-0 relative">
                                <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm">
                                    <Image
                                        src={beneficial.photoUrl?.at(0) || '/placeholder-avatar.png'}
                                        alt={`${beneficial.name}'s profile`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 96px) 100vw, 96px"
                                        priority
                                    />
                                </div>
                                <div className="absolute -top-1 -right-1">
                                    <Badge variant="secondary" className="text-xs px-2 py-1">
                                        Active
                                    </Badge>
                                </div>
                            </div>

                            {/* Enhanced Details Section */}
                            <div className="flex-1 min-w-0 space-y-3">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                        {beneficial.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                                        <Briefcase className="h-4 w-4" />
                                        <span>{beneficial.occupation}</span>
                                    </div>
                                </div>

                                {/* Location Information Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="h-4 w-4 text-green-500" />
                                        <span className="font-medium">{beneficial.village}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Building2 className="h-4 w-4 text-blue-500" />
                                        <span>{beneficial.district}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2">
                                        <Shield className="h-4 w-4 text-red-500" />
                                        <span>Police Station: {beneficial.policeStation}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Action Button */}
                            <div className="flex-shrink-0">
                                <Button
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                    size="lg"
                                    asChild
                                >
                                    <Link href={`/dashboard/beneficial/${beneficial.username}`} className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        View Details
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
});

BeneficialList.displayName = "BeneficialList";

// Enhanced Loading Skeleton
const TransactionsListSkeleton = React.memo(() => {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-4">
                            <div className="animate-pulse bg-gray-200 h-4 w-24 rounded" />
                            <div className="animate-pulse bg-gray-200 h-4 w-32 rounded" />
                            <div className="animate-pulse bg-gray-200 h-4 w-20 rounded" />
                            <div className="animate-pulse bg-gray-200 h-4 w-16 rounded" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
});

TransactionsListSkeleton.displayName = "TransactionsListSkeleton";

// Optimized calculation functions with error handling
const calculateTotal = (transactions: BeneficialTransactionIProps[], field: string): number => {
    if (!transactions || !Array.isArray(transactions)) return 0;

    return transactions
        .filter((item) => item?.paymentType === field)
        .reduce((total, item) => {
            const amount = parseFloat(item.amount || "0") || 0;
            return total + amount;
        }, 0);
};

const calculateTotals = (transactions: BeneficialTransactionIProps[]): TotalsIProps => {
    const totalDonate = calculateTotal(transactions, 'donate');
    const totalSpend = calculateTotal(transactions, 'spend');
    const totalBalance = totalDonate - totalSpend;
    return { totalDonate, totalSpend, totalBalance };
};

// Enhanced data fetching with better error handling
async function fetchBeneficialDonor(username: string): Promise<BeneficialDonorIProps | null> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/beneficial/donor/${username}`,
            {
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching beneficial donor:', error);
        return null;
    }
}

export default async function BeneficialDonorPage({
    params
}: {
    params: Promise<{ username: string }>
}) {
    // Force fresh data on each request
    cookies();

    const { username } = await params;

    // // Validate username parameter
    // if (!username || typeof username !== 'string') {
    //     redirect('/dashboard/beneficial');
    // }

    const beneficialDonor = await fetchBeneficialDonor(username);

    if (!beneficialDonor) {
        notFound();
    }

    const totals = calculateTotals(beneficialDonor.beneficialTransaction || []);

    return (
        <div className="container mx-auto px-4 py-6 space-y-8">
            {/* Enhanced Profile Section */}
            <Card className="shadow-lg">
                <BeneficialDonorProfileEdit data={beneficialDonor} totals={totals} />
            </Card>

            {/* Enhanced Beneficial List Section */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Beneficial Recipients
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="beneficial-list" className="border-0">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                        {beneficialDonor.beneficial?.length || 0} Recipients
                                    </Badge>
                                    <span>View All Recipients</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4">
                                <Suspense fallback={<LoadingFallback />}>
                                    <BeneficialList data={beneficialDonor.beneficial || []} />
                                </Suspense>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            {/* Enhanced Transaction Actions */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Transaction Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="">
                            <BeneficialDonorTransactionCreate
                                beneficialDonorId={beneficialDonor.id as string}
                            />
                        </div>
                        <div className="">
                            <BeneficialDonorSpendTransactionCreate
                                beneficialDonorId={beneficialDonor.id as string}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced Transactions List */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<TransactionsListSkeleton />}>
                        <BeneficialDonorTransactionList
                            data={beneficialDonor.beneficialTransaction || []}
                        />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}

// Add metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    return {
        title: `Beneficial Donor - ${username}`,
        description: `View and manage beneficial donor ${username}'s profile and transactions`,
    };
}