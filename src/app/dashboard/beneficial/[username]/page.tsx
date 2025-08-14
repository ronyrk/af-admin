import React from 'react'
import prisma from '@/lib/prisma';
import BeneficialProfileEdit from '@/components/beneficial-profile';
import { BeneficialIProps, BeneficialTransactionIProps } from '@/types';
import BeneficialTransactionList from '@/components/transaction-list';




export default async function Beneficial({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const data = await prisma.beneficial.findUnique({
        where: {
            username,
        },
        include: {
            beneficialDonor: true,
            beneficialTransaction: true,
        }
    }) as BeneficialIProps;

    return (
        <div>
            <BeneficialProfileEdit data={data} />
            <BeneficialTransactionList data={data.beneficialTransaction as BeneficialTransactionIProps[]} />

        </div>
    )
}
