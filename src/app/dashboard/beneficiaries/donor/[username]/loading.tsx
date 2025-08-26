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

const BeneficialDonorProfileEditSkeleton = () => {
    return (
        <div className="flex flex-col gap-3 relative">
            {/* Custom shimmer keyframes - add this to your global CSS */}

            <div className="flex md:flex-row flex-col justify-between gap-3 px-2 relative">
                {/* Top Action Button Skeleton */}
                <div className="absolute flex flex-row gap-2 top-2 right-4 z-10">
                    <Skeleton className="w-10 h-10 rounded" />
                </div>

                {/* Profile Image Section */}
                <div className="basis-4/12 border-2 p-2 flex justify-around relative rounded bg-white">
                    <ShimmerSkeleton className="w-full h-36 md:h-40 rounded-md" />

                    {/* Upload button area skeleton */}
                    <div className="absolute top-3 right-0">
                        <Skeleton className="w-20 h-8 rounded" />
                    </div>
                </div>

                {/* Profile Info Section */}
                <div className="basis-8/12 border-2 rounded p-1 px-2 flex flex-col justify-around bg-white">
                    {/* Name field skeleton */}
                    <div className="py-1">
                        <ShimmerSkeleton className="w-3/4 h-8" />
                    </div>

                    {/* Home Town field skeleton */}
                    <div className="flex flex-row items-center py-2">
                        <Skeleton className="w-24 h-5 mr-2" /> {/* "Home Town :" label */}
                        <ShimmerSkeleton className="w-40 h-6" />
                    </div>

                    {/* Lives in field skeleton */}
                    <div className="flex flex-row items-center py-2">
                        <Skeleton className="w-20 h-5 mr-2" /> {/* "Lives in :" label */}
                        <ShimmerSkeleton className="w-32 h-6" />
                    </div>
                </div>
            </div>

            {/* About Section Skeleton */}
            <div className="p-2">
                <div className="space-y-3 py-4">
                    {/* Multiple lines to simulate rich text content */}
                    <ShimmerSkeleton className="w-full h-4" />
                    <ShimmerSkeleton className="w-11/12 h-4" />
                    <ShimmerSkeleton className="w-4/5 h-4" />
                    <ShimmerSkeleton className="w-full h-4" />
                    <ShimmerSkeleton className="w-3/4 h-4" />
                    <ShimmerSkeleton className="w-5/6 h-4" />
                    <ShimmerSkeleton className="w-2/3 h-4" />
                </div>
            </div>
        </div>
    );
};

export default BeneficialDonorProfileEditSkeleton;