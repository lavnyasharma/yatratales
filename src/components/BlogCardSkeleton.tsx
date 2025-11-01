import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function BlogCardSkeleton() {
    return (
        <Card className="overflow-hidden group flex flex-col bg-background shadow-lg">
            <Skeleton className="w-full h-[220px]" />
            <CardContent className="p-6 flex flex-col flex-grow space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-24 mt-2" />
            </CardContent>
        </Card>
    );
}
