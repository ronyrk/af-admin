"use client";
import { useUser } from '@/components/ContextProvider'
import { SingInForm } from '@/components/SingInForm'
import { redirect } from 'next/navigation'
import React, { useEffect } from 'react'

function Home() {
  // const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (user?.email) {
      redirect('/dashboard');
    }
  }, [user?.email]);
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 bg-slate-50 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {/* <Image className="mx-auto h-10 w-auto" src="https://i.ibb.co/QHXFhC6/20b60157-086a-486e-906e-4b551176d1c2-removebg-preview.png" alt="" width={100} height={100} /> */}
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to Admin account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <SingInForm />
      </div>
    </div>
  )
}

export default Home