import { TableSkeleton } from "./TableSkeleton";

export function FilterSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
            <div className="flex flex-wrap gap-4 items-center">
                {/* District Filter Skeleton */}
                <div className="min-w-[180px]">
                    <div className="h-10 bg-gray-200 rounded border"></div>
                </div>

                {/* Police Station Filter Skeleton */}
                <div className="min-w-[180px]">
                    <div className="h-10 bg-gray-200 rounded border"></div>
                </div>

                {/* Search Input Skeleton */}
                <div className="flex-1 min-w-[250px]">
                    <div className="h-10 bg-gray-200 rounded border"></div>
                </div>

                {/* Clear Button Skeleton */}
                <div className="h-10 w-20 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
}

// Enhanced Loading Components
export function LoadingFallback() {
    return (
        <>
            <TableSkeleton />
            <div className="flex justify-center py-4">
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
                </div>
            </div>
        </>
    );
}

export function PageLoadingSkeleton() {
    return (
        <div className="flex flex-col space-y-4">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center p-4">
                <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>

            {/* Filter Skeleton */}
            <FilterSkeleton />

            {/* Table Skeleton */}
            <div className="border rounded-md">
                <div className="h-12 bg-gray-100 border-b flex items-center px-4">
                    <div className="grid grid-cols-7 gap-4 w-full">
                        <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                </div>
                <TableSkeleton />
            </div>
        </div>
    );
}