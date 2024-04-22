import React from 'react'

function page({ params }: {
	params: {
		username: string;
	}
}) {
	return (
		<div>page-{params.username}</div>
	)
}

export default page