import React from 'react'
import prisma from '@/lib/prisma';
import MemberProfileEdit from '@/components/MemberProfile';
import { OwnerIProps } from '@/types';

async function page({ params }: {
    params: {
        username: string
    }
}) {
    const { username } = params;

    const member = await prisma.owner.findUnique({
        where: {
            username
        }
    }) as OwnerIProps;

    return (
        <div>
            <MemberProfileEdit data={member} />
        </div>
    )
}

export default page