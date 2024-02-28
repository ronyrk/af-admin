import Link from 'next/link'

export default function NotFound() {
	return (
		<div className="flex items-center justify-center min-h-[400px] px-4 text-center md:px-6">
			<div className="space-y-4">
				<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-color-main">4<span className=' text-color-sub'>0</span>4: Page Not Found</h1>
				<p className="max-w-[600px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
					Sorry, we couldn’t find the page you’re looking for.
				</p>
				<Link
					className="inline-flex h-10 items-center justify-center rounded-md border  border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
					href="/dashboard"
				>
					Return to website
				</Link>
			</div>
		</div>
	)
}