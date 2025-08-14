import { TableBody, TableCell, TableRow } from "@/components/ui/table";

function TableRowSkeleton() {
    return (
        <TableRow>
            <TableCell className="font-medium">
                <div className="w-[100px] h-[100px] bg-gray-200 animate-pulse rounded-lg"></div>
            </TableCell>
            <TableCell className="font-medium">
                <div className="flex flex-col gap-2">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div>
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-24"></div>
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-28"></div>
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-20"></div>
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-24"></div>
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-20"></div>
                </div>
            </TableCell>
            <TableCell className="font-medium">
                <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full"></div>
            </TableCell>
            <TableCell className="font-medium">
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            </TableCell>
            <TableCell className="font-medium">
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
            </TableCell>
            <TableCell className="font-medium">
                <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
            </TableCell>
            <TableCell className="font-medium">
                <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
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