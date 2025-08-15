'use client';

import React, { useCallback, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search, X, Loader2 } from 'lucide-react';

// Simple debounce function (replace lodash if not available)
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}





export default function FilterControlsDonor() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentDistrict = searchParams.get('district') || '';
    const currentPoliceStation = searchParams.get('policeStation') || '';
    const currentSearch = searchParams.get('search') || '';

    const [searchValue, setSearchValue] = useState(currentSearch);


    const updateURL = useCallback((updates: Record<string, string>) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== 'all' && value.trim() !== '') {
                current.set(key, value);
            } else {
                current.delete(key);
            }
        });

        // Reset to page 1 when filters change
        if (Object.keys(updates).some(key => key !== 'page')) {
            current.delete('page');
        }

        const search = current.toString();
        const query = search ? `?${search}` : '';

        startTransition(() => {
            router.push(`${pathname}${query}`);
        });
    }, [searchParams, pathname, router]);

    // Debounced search function
    const debouncedSearch = useMemo(
        () => debounce((value: string) => {
            updateURL({ search: value });
        }, 3000),
        [updateURL]
    );

    const handleSearchChange = useCallback((value: string) => {
        setSearchValue(value);
        debouncedSearch(value);
    }, [debouncedSearch]);

    const hasActiveFilters = currentDistrict || currentPoliceStation || currentSearch;

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap gap-4 items-center">

                {/* Search Input */}
                <div className="flex-1 min-w-[250px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search by name, phone, village, post office..."
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className={`pl-10 ${isPending ? 'opacity-50' : ''}`}
                        disabled={isPending}
                    />
                    {isPending && searchValue && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        </div>
                    )}
                </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 text-sm">
                    <span className="text-gray-600">Active filters:</span>
                    {currentSearch && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                            Search: &quot;{currentSearch}&quot;
                        </span>
                    )}
                </div>
            )}

            {isPending && (
                <div className="flex items-center gap-2 text-sm text-blue-600 animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Filtering results...
                </div>
            )}
        </div>
    );
}
