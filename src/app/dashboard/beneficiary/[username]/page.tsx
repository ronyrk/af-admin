import React from 'react'
import prisma from '@/lib/prisma';
import BeneficialProfileEdit from '@/components/beneficial-profile';
import { BeneficialDonorIProps, BeneficialIProps, BeneficialTransactionIProps } from '@/types';
import BeneficialTransactionList from '@/components/transaction-list';
import { notFound } from 'next/navigation';


async function fetchBeneficial(username: string): Promise<BeneficialIProps | null> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/beneficial/${username}`,
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


export default async function Beneficial({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    const data = await fetchBeneficial(username);


    if (!data) {
        notFound();
    }

    return (
        <div>
            <BeneficialProfileEdit data={data} />
            <BeneficialTransactionList data={data.beneficialTransaction as BeneficialTransactionIProps[]} />

        </div>
    )
}
