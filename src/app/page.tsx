import { SingInForm } from '@/components/SingInForm'
import Logo from "../../public/arafat-logo.png"
import Image from 'next/image'

function Home() {

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 bg-slate-50 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image className="mx-auto h-10 w-auto" src={Logo} alt="logo" width={500} height={500} placeholder='blur' />
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