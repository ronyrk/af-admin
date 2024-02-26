import CreateFAQ from '@/components/CreateFAQ'
import React from 'react'

function page() {
  return (
    <div className=" flex flex-col gap-2">
      <h2 className=" text-xl text-color-main text-center">FAQ</h2>
      <CreateFAQ />
    </div>
  )
}

export default page