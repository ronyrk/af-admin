"use client";
import React from 'react'
import { Input } from '@/components/ui/input';
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useDebouncedCallback } from "use-debounce"

function SearchBox() {
	const pathname = usePathname();
	const { replace } = useRouter();
	const searchParams = useSearchParams();
	const handleSearch = useDebouncedCallback((term: string) => {
		const params = new URLSearchParams(searchParams as any);
		if (term) {
			params.set("search", term);
		} else {
			params.delete("search");
		}
		replace(`${pathname}?${params.toString()}`);
	}, 300);
	const search = searchParams.get('search');
	return (
		<div className="px-4 pb-3 flex justify-end">
			<div className="flex flex-col">
				<Input className='w-64 bg-white' id='search' onChange={(e) => {
					handleSearch(e.target.value);
				}}
					defaultValue={searchParams.get("search")?.toString()}
					type="text" placeholder="Search" />
			</div>
		</div>
	)
}

export default SearchBox