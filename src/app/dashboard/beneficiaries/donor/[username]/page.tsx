import { cookies } from 'next/headers'
import React, { Suspense } from 'react'
import { BeneficialDonorIProps, BeneficialIProps, BeneficialTransactionIProps, TotalsIProps } from '@/types';
import BeneficialDonorProfileEdit from '@/components/beneficial-donor-profile';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Briefcase, DollarSign, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { LoadingFallback } from '@/components/FilterSkeleton';
import Link from 'next/link';
import BeneficialDonorTransactionList from '@/components/donor-transactions-list';
import { BeneficialDonorTransactionCreate } from '@/components/beneficial-donor-transaction';
import { BeneficialDonorSpendTransactionCreate } from '@/components/beneficial-donor-transaction-spend';

// Format currency with proper localization - cached formatter
const currencyFormatter = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
});

const formatCurrency = (amount: number): string => currencyFormatter.format(amount);

// Optimized calculation functions with early returns and Map for O(1) lookups
const calculateTotals = (transactions: BeneficialTransactionIProps[]): TotalsIProps => {
    if (!transactions?.length) return { totalDonate: 0, totalSpend: 0, totalBalance: 0 };

    let totalDonate = 0;
    let totalSpend = 0;

    // Single pass through transactions
    for (const transaction of transactions) {
        const amount = Number(transaction.amount) || 0;
        if (transaction.paymentType === 'donate') {
            totalDonate += amount;
        } else if (transaction.paymentType === 'spend') {
            totalSpend += amount;
        }
    }

    return {
        totalDonate,
        totalSpend,
        totalBalance: totalDonate - totalSpend
    };
};

// Pre-calculate spending amounts for all beneficiaries in one pass
const calculateBeneficiarySpending = (transactions: BeneficialTransactionIProps[]): Map<string, number> => {
    const spendingMap = new Map<string, number>();

    if (!transactions?.length) return spendingMap;

    for (const transaction of transactions) {
        if (transaction.paymentType === 'spend' && transaction.beneficialId) {
            const currentAmount = spendingMap.get(transaction.beneficialId) || 0;
            const transactionAmount = Number(transaction.amount) || 0;
            spendingMap.set(transaction.beneficialId, currentAmount + transactionAmount);
        }
    }

    return spendingMap;
};

// Memoized BeneficialList component with pre-calculated spending
const BeneficialList = React.memo(({
    data,
    spendingMap
}: {
    data: BeneficialIProps[],
    spendingMap: Map<string, number>
}) => {
    if (!data?.length) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                <p>No beneficial records found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data.map((beneficial) => {
                const spending = spendingMap.get(beneficial.id) || 0;
                const photoUrl = beneficial.photoUrl?.[0] || '/placeholder-avatar.png';

                return (
                    <Card key={beneficial.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-6">
                                {/* Enhanced Image Section */}
                                <div className="flex-shrink-0 relative">
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm">
                                        <Image
                                            src={photoUrl}
                                            alt={`${beneficial.name}'s profile`}
                                            fill
                                            className="object-cover"
                                            sizes="96px"
                                            priority={false}
                                        />
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

                                        <div className="flex items-center gap-2 text-xl font-medium text-gray-600 md:col-span-2">
                                            <span>Total Spend:-</span>
                                            <span>{formatCurrency(spending)}</span>
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
                                        <Link href={`/beneficiary/${beneficial.username}`} className="flex items-center gap-2">
                                            Details
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
});

BeneficialList.displayName = "BeneficialList";

// Optimized database query with selective field loading

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


async function page({ params }: { params: Promise<{ username: string }> }) {
    // Move cookies call after data fetching for better caching
    const { username } = await params;


    const beneficialDonor = await fetchBeneficialDonor(username);

    if (!beneficialDonor) {
        notFound();
    }

    cookies(); // Only call after we know data exists

    // Pre-calculate all spending amounts in one pass
    const spendingMap = calculateBeneficiarySpending(beneficialDonor.beneficialTransaction || []);
    const totals = calculateTotals(beneficialDonor.beneficialTransaction || []);
    const beneficiaryCount = beneficialDonor.beneficial?.length || 0;

    return (
        <div>
            <BeneficialDonorProfileEdit data={beneficialDonor} totals={totals} />

            {/* Enhanced Beneficial List Section */}
            <Card className="shadow-lg my-4">
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
                                        {beneficiaryCount} Recipients
                                    </Badge>
                                    <span>View All Recipients</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4">
                                <Suspense fallback={<LoadingFallback />}>
                                    <BeneficialList
                                        data={beneficialDonor.beneficial || []}
                                        spendingMap={spendingMap}
                                    />
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

                    <BeneficialDonorTransactionList
                        data={beneficialDonor.beneficialTransaction || []}
                    />

                </CardContent>
            </Card>
        </div>
    );
}

export default page;