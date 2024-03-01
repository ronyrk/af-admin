'use client'

import { Button } from "@/components/ui/button"

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	return (
		<html>
			<body>
				<div className="flex items-center justify-center min-h-[100vh] flex-col gap-2">
					<div className="space-y-2 text-center">
						<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl">Oops! Something went wrong.</h1>
						<p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
							We apologize for the inconvenience.
						</p>
					</div>
					<Button
						className="inline-flex w-fit h-10 items-center justify-center rounded-md border border-gray-200 bg-color-main text-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-color-sub"
						onClick={() => reset()}
					>
						Refresh
					</Button>
				</div>
			</body>
		</html>
	)
}