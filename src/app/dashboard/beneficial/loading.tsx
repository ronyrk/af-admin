// app/dashboard/beneficial/loading.tsx
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

// Individual skeleton components
function TableRowSkeleton() {
    return (
        <tr className="border-b hover:bg-gray-50 transition-colors">
            <td className="font-medium p-4">
                <div className="flex items-start gap-4">
                    {/* Image skeleton */}
                    <div className="flex-shrink-0">
                        <div className="w-[80px] h-[80px] bg-gray-200 animate-pulse rounded-lg border-2"></div>
                    </div>
                    {/* Details skeleton */}
                    <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 animate-pulse rounded w-32"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-28"></div>
                        <div className="space-y-1">
                            <div className="h-3 bg-gray-200 animate-pulse rounded w-24"></div>
                            <div className="h-3 bg-gray-200 animate-pulse rounded w-36"></div>
                            <div className="h-3 bg-gray-200 animate-pulse rounded w-32"></div>
                        </div>
                    </div>
                </div>
            </td>
            <td className="font-medium p-4">
                <div className="flex flex-col gap-2">
                    <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full"></div>
                    <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                </div>
            </td>
            <td className="font-medium p-4">
                <div className="h-8 w-full bg-gray-200 animate-pulse rounded"></div>
            </td>
            <td className="font-medium p-4">
                <div className="h-16 w-full bg-gray-200 animate-pulse rounded"></div>
            </td>
            <td className="font-medium p-4">
                <div className="h-8 w-full bg-gray-200 animate-pulse rounded"></div>
            </td>
            <td className="font-medium p-4">
                <div className="h-8 w-full bg-gray-200 animate-pulse rounded"></div>
            </td>
        </tr>
    );
}

function FilterSkeleton() {
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

            {/* Active filters skeleton */}
            <div className="flex gap-2">
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full"></div>
                <div className="h-6 w-28 bg-gray-200 animate-pulse rounded-full"></div>
            </div>
        </div>
    );
}

function PaginationSkeleton() {
    return (
        <div className="flex justify-between items-center py-4 px-4">
            {/* Results count skeleton */}
            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>

            {/* Pagination controls skeleton */}
            <div className="flex items-center space-x-2">
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
                <div className="flex space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
                    ))}
                </div>
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
            </div>
        </div>
    );
}

// Main loading component for Next.js App Router
export default function Loading() {
    return (
        <div className="flex flex-col space-y-6 p-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-8 w-64 bg-gray-200 animate-pulse rounded mb-2"></div>
                    <div className="h-4 w-48 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="h-10 w-40 bg-gray-200 animate-pulse rounded"></div>
            </div>

            {/* Filter Controls Skeleton */}
            <FilterSkeleton />

            {/* Table Skeleton */}
            <div className="bg-white rounded-lg shadow">
                <table className="w-full">
                    {/* Table Header */}
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="font-semibold p-4 text-left">
                                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                            </th>
                            <th className="font-semibold p-4 text-left w-32">
                                <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                            </th>
                            <th className="font-semibold p-4 text-left w-32">
                                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                            </th>
                            <th className="font-semibold p-4 text-left w-32">
                                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                            </th>
                            <th className="font-semibold p-4 text-left w-24">
                                <div className="h-4 w-12 bg-gray-200 animate-pulse rounded"></div>
                            </th>
                            <th className="font-semibold p-4 text-left w-24">
                                <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                            </th>
                        </tr>
                    </thead>

                    {/* Table Body with skeleton rows */}
                    <tbody>
                        {Array.from({ length: 10 }).map((_, index) => (
                            <TableRowSkeleton key={index} />
                        ))}
                    </tbody>
                </table>

                {/* Pagination Skeleton */}
                <PaginationSkeleton />
            </div>

            {/* Loading indicator */}
            <div className="flex justify-center items-center py-4">
                <div className="flex items-center gap-3 text-gray-500">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Loading beneficial data...</span>
                </div>
            </div>
        </div>
    );
}

// Alternative: If you want to use it as a component in other places
export function BeneficialTableSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow">
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="font-semibold p-4 text-left">
                            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                        </th>
                        <th className="font-semibold p-4 text-left w-32">
                            <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                        </th>
                        <th className="font-semibold p-4 text-left w-32">
                            <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                        </th>
                        <th className="font-semibold p-4 text-left w-32">
                            <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                        </th>
                        <th className="font-semibold p-4 text-left w-24">
                            <div className="h-4 w-12 bg-gray-200 animate-pulse rounded"></div>
                        </th>
                        <th className="font-semibold p-4 text-left w-24">
                            <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 10 }).map((_, index) => (
                        <TableRowSkeleton key={index} />
                    ))}
                </tbody>
            </table>
            <PaginationSkeleton />
        </div>
    );
}

// Export individual components for reuse
export { FilterSkeleton, PaginationSkeleton, TableRowSkeleton };