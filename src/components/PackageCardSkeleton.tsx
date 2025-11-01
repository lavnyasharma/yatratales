import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function PackageCardSkeleton() {
    return (
        <Card className="flex flex-col overflow-hidden shadow-md rounded-lg">
            <Skeleton className="h-56 w-full" />
            <CardHeader className="p-4">
                <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="p-4 flex-grow space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-secondary/30 p-4">
                <div className="flex flex-col space-y-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-10 w-24" />
            </CardFooter>
        </Card>
    );
}
