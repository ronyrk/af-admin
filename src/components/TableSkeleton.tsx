import { TableBody, TableCell, TableRow } from "@/components/ui/table";

function TableRowSkeleton() {
    return (
        <TableRow>
            <TableCell className="font-medium p-4">
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
            </TableCell>
            <TableCell className="font-medium p-4">
                <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full"></div>
            </TableCell>
            <TableCell className="font-medium p-4">
                <div className="h-8 w-full bg-gray-200 animate-pulse rounded"></div>
            </TableCell>
            <TableCell className="font-medium p-4">
                <div className="h-8 w-full bg-gray-200 animate-pulse rounded"></div>
            </TableCell>
            <TableCell className="font-medium p-4">
                <div className="h-8 w-full bg-gray-200 animate-pulse rounded"></div>
            </TableCell>
            <TableCell className="font-medium p-4">
                <div className="h-8 w-full bg-gray-200 animate-pulse rounded"></div>
            </TableCell>
        </TableRow>
    );
}

export function TableSkeleton() {
    return (
        <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
                <TableRowSkeleton key={index} />
            ))}
        </TableBody>
    );
}