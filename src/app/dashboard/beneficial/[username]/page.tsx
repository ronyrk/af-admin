import React from 'react'
import prisma from '@/lib/prisma';
import BeneficialProfileEdit from '@/components/beneficial-profile';
import { BeneficialIProps } from '@/types';

export default async function Beneficial({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const data = await prisma.beneficial.findUnique({
        where: {
            username,
        },
        include: {
            beneficialDonor: true
        }
    }) as BeneficialIProps;

    return (
        <div>
            <BeneficialProfileEdit data={data} />
        </div>
    )
}
