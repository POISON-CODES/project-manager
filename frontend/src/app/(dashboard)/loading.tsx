import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header Skeleton */}
            <div className="flex flex-col gap-2 mb-8">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* Content Area Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <div className="space-y-3">
                            <Skeleton className="h-32 w-full rounded-xl" />
                            <Skeleton className="h-32 w-full rounded-xl" />
                            <Skeleton className="h-32 w-full rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
