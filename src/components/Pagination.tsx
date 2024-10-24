"use client";
import React from 'react'
import { Button } from "@/components/ui/button";
import { useSearchParams, usePathname, useRouter } from 'next/navigation'


function PaginationPart({ data, item }: { data: number, item: number }) {
	const totalPage = Math.ceil(data / item);
	const pathname = usePathname();
	const { replace } = useRouter();
	const searchParams = useSearchParams();

	const handlePage = (term: string) => {
		const params = new URLSearchParams(searchParams as any);
		if (term) {
			params.set("page", term);
		} else {
			params.delete("page");
		}
		replace(`${pathname}?${params?.toString()}`);
	};
	const page = searchParams.get('page');
	const pageNumber = Number(page) || 1;

	return (
		<div className=' flex flex-row gap-2'>
			{
				Array.from({ length: totalPage })?.map((i: any, index) => (
					<Button variant="outline" aria-disabled={pageNumber === index + 1} className={`text-black ${pageNumber === index + 1 ? "bg-color-sub" : ""}`} key={index}
						onClick={() => handlePage(`${index + 1}`)}
					>
						{1 + index}
					</Button>

				))
			}
		</div >
	)
}

export default PaginationPart