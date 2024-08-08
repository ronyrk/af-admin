import ExpensesUpdated from '@/components/ExpensesUpdated';
import { cookies } from 'next/headers';
import React from 'react'

async function page({ params }: {
    params: {
        id: string
    }
}) {
    cookies();
    let res = await fetch(`https://af-admin.vercel.app/api/expenses/${params.id}`);
    if (!res.ok) {
        throw new Error("Failed to fetch data list");
    };
    const data = await res.json();
    return (
        <div>
            <ExpensesUpdated data={data} />
        </div>
    )
}

export default page