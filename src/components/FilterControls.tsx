'use client';

import React, { useCallback, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';

// Simple debounce function (replace lodash if not available)
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

interface LocationOptions {
    districts: string[];
    policeStations: { policeStation: string; district: string; }[];
}

interface FilterControlsProps {
    locationOptions: LocationOptions;
}

export default function FilterControls({ locationOptions }: FilterControlsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentDistrict = searchParams.get('district') || '';
    const currentPoliceStation = searchParams.get('policeStation') || '';
    const currentSearch = searchParams.get('search') || '';

    const [searchValue, setSearchValue] = useState(currentSearch);

    // Filter police stations based on selected district
    const filteredPoliceStations = useMemo(() => {
        if (!currentDistrict || currentDistrict === 'all') {
            return locationOptions.policeStations;
        }
        return locationOptions.policeStations.filter(
            ps => ps.district.toLowerCase().includes(currentDistrict.toLowerCase())
        );
    }, [currentDistrict, locationOptions.policeStations]);

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
        }, 300),
        [updateURL]
    );

    const handleSearchChange = useCallback((value: string) => {
        setSearchValue(value);
        debouncedSearch(value);
    }, [debouncedSearch]);

    const handleDistrictChange = useCallback((value: string) => {
        updateURL({
            district: value,
            policeStation: '' // Reset police station when district changes
        });
    }, [updateURL]);

    const handlePoliceStationChange = useCallback((value: string) => {
        updateURL({ policeStation: value });
    }, [updateURL]);

    const clearAllFilters = useCallback(() => {
        setSearchValue('');
        router.push(pathname);
    }, [pathname, router]);

    const hasActiveFilters = currentDistrict || currentPoliceStation || currentSearch;

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap gap-4 items-center">
                {/* District Filter */}
                <div className="min-w-[180px] relative">
                    <Select value={currentDistrict} onValueChange={handleDistrictChange}>
                        <SelectTrigger disabled={isPending} className={isPending ? 'opacity-50' : ''}>
                            <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Districts</SelectItem>
                            {locationOptions.districts.map((district) => (
                                <SelectItem key={district} value={district}>
                                    {district}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {isPending && (
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        </div>
                    )}
                </div>

                {/* Police Station Filter */}
                <div className="min-w-[180px] relative">
                    <Select
                        value={currentPoliceStation}
                        onValueChange={handlePoliceStationChange}
                        disabled={isPending}
                    >
                        <SelectTrigger className={isPending ? 'opacity-50' : ''}>
                            <SelectValue placeholder="Select Police Station" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Police Stations</SelectItem>
                            {filteredPoliceStations.map((ps, index) => (
                                <SelectItem key={`${ps.policeStation}-${index}`} value={ps.policeStation}>
                                    {ps.policeStation}
                                    {currentDistrict === 'all' || !currentDistrict ?
                                        ` (${ps.district})` : ''
                                    }
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {isPending && (
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        </div>
                    )}
                </div>

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

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        onClick={clearAllFilters}
                        disabled={isPending}
                        className="flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        Clear All
                    </Button>
                )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 text-sm">
                    <span className="text-gray-600">Active filters:</span>
                    {currentDistrict && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            District: {currentDistrict}
                        </span>
                    )}
                    {currentPoliceStation && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            Police Station: {currentPoliceStation}
                        </span>
                    )}
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
