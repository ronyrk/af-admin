import { BeneficialTransactionIProps } from '@/types'
import React, { Suspense, useMemo, useCallback } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import moment from 'moment';
import DeleteButton from './DeleteButton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from './ui/button';

function htmlConvert(data: string) {
    const jsonAndHtml = data.split("^");
    const html = jsonAndHtml[0];
    return (
        <div className="py-2">
            <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    );
}

// Pre-calculate all outstanding amounts efficiently
const calculateOutstandingAmounts = (paymentList: BeneficialTransactionIProps[], initialBalance: number): string[] => {
    let runningLoanTotal = initialBalance;
    let runningPaymentTotal = 0;

    return paymentList.map((payment) => {
        // Add to loan total if it's a donate (incoming money)
        if (payment.paymentType === 'donate') {
            runningLoanTotal += Number(payment.amount);
        }
        // Add to payment total if it's a spend (outgoing money)
        if (payment.paymentType === 'spend') {
            runningPaymentTotal += Number(payment.amount);
        }

        const outstanding = runningLoanTotal - runningPaymentTotal;
        return `BDT=${outstanding.toLocaleString('en-BD')}/=`;
    });
};

// Optimized amount formatting with memoization
const formatAmount = (item: BeneficialTransactionIProps, type: string): string => {
    if (item.paymentType !== type) return '';

    return Number(item.amount).toLocaleString('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0
    });
};

const TableRowItem = React.memo(({
    item,
    outstandingBalance
}: {
    item: BeneficialTransactionIProps;
    outstandingBalance: string;
}) => {
    const formatDate = useMemo(() =>
        moment(item.date).format('DD/MM/YYYY'),
        [item.date]
    );

    const donateAmount = useMemo(() =>
        formatAmount(item, 'donate'),
        [item.amount, item.paymentType]
    );

    const spendAmount = useMemo(() =>
        formatAmount(item, 'spend'),
        [item.amount, item.paymentType]
    );

    const hasDescription = Boolean(item.description);

    return (
        <TableRow>
            <TableCell className="font-medium">{formatDate}</TableCell>
            <TableCell className="font-medium">{donateAmount}</TableCell>
            <TableCell className="font-medium">{spendAmount}</TableCell>
            <TableCell className="font-medium">{outstandingBalance}</TableCell>
            <TableCell className="font-medium uppercase">
                {hasDescription && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className='bg-color-sub' size="sm">
                                Details
                            </Button>
                        </DialogTrigger>
                        <DialogContent className='p-8 bg-white max-w-2xl max-h-[80vh] overflow-y-auto'>
                            <DialogHeader>
                                <DialogDescription asChild>
                                    <div>
                                        {htmlConvert(item.description || '')}
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                )}
            </TableCell>
            <TableCell className="font-medium uppercase">
                <DeleteButton
                    type='beneficial/transaction'
                    username={item.id as string}
                />
            </TableCell>
        </TableRow>
    );
});

TableRowItem.displayName = "TableRowItem";

// Memoized TransactionsList component
const TransactionsList = React.memo(({
    data,
    outstandingAmounts
}: {
    data: BeneficialTransactionIProps[];
    outstandingAmounts: string[];
}) => {
    return (
        <TableBody>
            {data.map((item, index) => (
                <TableRowItem
                    key={item.id || `transaction-${item.date}-${item.amount}`}
                    item={item}
                    outstandingBalance={outstandingAmounts[index]}
                />
            ))}
        </TableBody>
    );
});

TransactionsList.displayName = "TransactionsList";

export default function BeneficialDonorTransactionList({
    data,
    initialBalance = 0
}: {
    data: BeneficialTransactionIProps[];
    initialBalance?: number;
}) {
    // Memoize the data to prevent unnecessary re-renders
    const memoizedData = useMemo(() => data, [data]);

    // Calculate outstanding amounts efficiently
    const outstandingAmounts = useMemo(() =>
        calculateOutstandingAmounts(memoizedData, initialBalance),
        [memoizedData, initialBalance]
    );

    // Show loading state or empty state
    if (!memoizedData || memoizedData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <p className="text-gray-500">No transactions found</p>
            </div>
        );
    }

    return (
        <div className='flex flex-col'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>DATE</TableHead>
                        <TableHead className='uppercase'>Donate</TableHead>
                        <TableHead className='uppercase'>Spend</TableHead>
                        <TableHead className='uppercase'>Outstanding</TableHead>
                        <TableHead className='uppercase'>Details</TableHead>
                        <TableHead className='uppercase'>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <Suspense fallback={
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                                Loading transactions...
                            </TableCell>
                        </TableRow>
                    </TableBody>
                }>
                    <TransactionsList
                        data={memoizedData}
                        outstandingAmounts={outstandingAmounts}
                    />
                </Suspense>
            </Table>
        </div>
    );
}