import CreateFAQ from '@/components/CreateFAQ'
import React from 'react'

function page() {
  return (
    <div className=" flex flex-col gap-4">
      <h2 className=" text-xl text-color-main text-center">FAQ</h2>
      <CreateFAQ />
      <div className="p-2">

      </div>
    </div>
  )
}

export default page