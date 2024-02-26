import CreateFAQ from '@/components/CreateFAQ'
import React from 'react'

const page = () => {
	return (
		<div>
			<div className=" flex flex-col gap-2">
				<h2 className=" text-xl text-color-main text-center">FAQ</h2>
				<CreateFAQ />
			</div>
		</div>
	)
}

export default page