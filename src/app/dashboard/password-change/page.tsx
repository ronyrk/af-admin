"use server";
import { PasswordChange } from '@/components/Password'
import React from 'react'
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

async function page() {
    cookies();
    const admin = await (await prisma.admin.findMany({
        where: {
            username: "abdullaalmamun"
        }
    }))
    return (
        <div className='mx-auto p-2'>
            <PasswordChange admin={admin.at(0)} />
        </div>
    )
}

export default page