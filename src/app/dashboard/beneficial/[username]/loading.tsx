import React from 'react';

// Skeleton component for individual elements
const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Shimmer effect for enhanced loading animation
const ShimmerSkeleton = ({ className = "" }: { className?: string }) => (
    <div className={`relative overflow-hidden bg-gray-200 rounded ${className}`}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
);

const Loading = () => {
    return (
        <div className="flex flex-col gap-6 relative">
            {/* Top Bar Actions Skeleton */}
            <div className="absolute flex flex-row gap-2 top-2 right-4 z-50">
                <Skeleton className="w-20 h-10" />
                <Skeleton className="w-24 h-10" />
            </div>

            <div className="flex md:flex-row flex-col gap-6 px-2">
                {/* Profile Images Skeleton */}
                <div className="basis-4/12 border rounded-lg p-4 flex flex-col items-center bg-white shadow">
                    <div className="w-full max-w-xs">
                        {/* Main image skeleton */}
                        <ShimmerSkeleton className="w-full h-64 mb-4" />

                        {/* Carousel controls skeleton */}
                        <div className="flex justify-between items-center">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex gap-1">
                                <Skeleton className="w-2 h-2 rounded-full" />
                                <Skeleton className="w-2 h-2 rounded-full" />
                                <Skeleton className="w-2 h-2 rounded-full" />
                            </div>
                            <Skeleton className="w-10 h-10 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Profile Info Skeleton */}
                <div className="basis-8/12 border rounded-lg p-4 flex flex-col gap-4 bg-white shadow">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <Skeleton className="w-16 h-4" />
                            <ShimmerSkeleton className="w-full h-12" />
                        </div>

                        {/* Village Field */}
                        <div className="space-y-2">
                            <Skeleton className="w-20 h-4" />
                            <ShimmerSkeleton className="w-full h-12" />
                        </div>

                        {/* Post Office Field */}
                        <div className="space-y-2">
                            <Skeleton className="w-16 h-4" />
                            <ShimmerSkeleton className="w-full h-12" />
                        </div>

                        {/* Occupation Field */}
                        <div className="space-y-2">
                            <Skeleton className="w-20 h-4" />
                            <ShimmerSkeleton className="w-full h-12" />
                        </div>

                        {/* Phone Field */}
                        <div className="space-y-2">
                            <Skeleton className="w-12 h-4" />
                            <ShimmerSkeleton className="w-full h-12" />
                        </div>

                        {/* District Field */}
                        <div className="space-y-2">
                            <Skeleton className="w-16 h-4" />
                            <ShimmerSkeleton className="w-full h-12" />
                        </div>

                        {/* Police Station Field */}
                        <div className="space-y-2">
                            <Skeleton className="w-24 h-4" />
                            <ShimmerSkeleton className="w-full h-12" />
                        </div>

                        {/* Beneficial Donor Field */}
                        <div className="space-y-2">
                            <Skeleton className="w-28 h-4" />
                            <ShimmerSkeleton className="w-full h-12" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Photo Management Section Skeleton */}
            <div className="border my-4 mx-2 rounded-lg p-4 bg-white shadow">
                {/* Accordion header */}
                <div className="flex justify-between items-center py-4 border-b">
                    <Skeleton className="w-48 h-6" />
                    <Skeleton className="w-6 h-6" />
                </div>

                {/* Collapsed state - just show the header */}
                <div className="mt-4 space-y-4">
                    {/* Instructions skeleton */}
                    <div className="bg-gray-50 border rounded-lg p-4">
                        <Skeleton className="w-32 h-4 mb-2" />
                        <div className="space-y-1">
                            <Skeleton className="w-full h-3" />
                            <Skeleton className="w-4/5 h-3" />
                            <Skeleton className="w-3/4 h-3" />
                        </div>
                    </div>

                    {/* Photo grid skeleton */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="relative group">
                                <ShimmerSkeleton className="w-full h-32 sm:h-40" />
                                {/* Position indicator */}
                                <Skeleton className="absolute top-1 left-1 w-6 h-4" />
                                {/* Delete button */}
                                <Skeleton className="absolute -top-2 -right-2 w-6 h-6 rounded-full" />
                            </div>
                        ))}
                    </div>

                    {/* Upload section skeleton */}
                    <div className="bg-gray-50 border rounded-lg p-3 mt-4">
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <Skeleton className="w-32 h-4" />
                                <Skeleton className="w-48 h-3" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="w-24 h-8" />
                                <Skeleton className="w-20 h-8" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section Skeleton */}
            <div className="p-4 mt-4 bg-white rounded-lg shadow mx-2">
                <div className="space-y-4">
                    <Skeleton className="w-12 h-4" />
                    <div className="space-y-2">
                        <ShimmerSkeleton className="w-full h-4" />
                        <ShimmerSkeleton className="w-5/6 h-4" />
                        <ShimmerSkeleton className="w-4/5 h-4" />
                        <ShimmerSkeleton className="w-3/4 h-4" />
                        <ShimmerSkeleton className="w-full h-4" />
                        <ShimmerSkeleton className="w-2/3 h-4" />
                    </div>
                </div>
            </div>

            {/* NID Section Skeleton */}
            <div className="border my-4 mx-2 rounded-lg p-4 bg-white shadow">
                <Skeleton className="w-28 h-6 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* NID Front */}
                    <div className="space-y-2">
                        <Skeleton className="w-20 h-4" />
                        <ShimmerSkeleton className="w-full h-32" />
                        <Skeleton className="w-32 h-10" />
                    </div>

                    {/* NID Back */}
                    <div className="space-y-2">
                        <Skeleton className="w-20 h-4" />
                        <ShimmerSkeleton className="w-full h-32" />
                        <Skeleton className="w-32 h-10" />
                    </div>
                </div>
            </div>

            {/* Transaction Section Skeleton */}
            <div className="border mx-2 rounded-lg p-4 bg-white shadow">
                <div className="space-y-4">
                    <Skeleton className="w-40 h-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="border rounded-lg p-3">
                                <ShimmerSkeleton className="w-full h-20 mb-2" />
                                <Skeleton className="w-3/4 h-4 mb-1" />
                                <Skeleton className="w-1/2 h-3" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Loading;