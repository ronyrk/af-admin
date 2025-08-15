'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export default function Pagination({ currentPage, totalPages, hasNext, hasPrev }: PaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const goToPage = (page: number) => {
        router.push(createPageURL(page));
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center space-x-2">
            <Button
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={!hasPrev}
                className="flex items-center gap-1"
            >
                <ChevronLeft className="h-4 w-4" />
                Previous
            </Button>

            <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber: number;
                    if (totalPages <= 5) {
                        pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                    } else {
                        pageNumber = currentPage - 2 + i;
                    }

                    return (
                        <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "secondary"}
                            size="sm"
                            onClick={() => goToPage(pageNumber)}
                            className="min-w-[2rem]"
                        >
                            {pageNumber}
                        </Button>
                    );
                })}
            </div>

            <Button

                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={!hasNext}
                className="flex items-center gap-1"
            >
                Next
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}