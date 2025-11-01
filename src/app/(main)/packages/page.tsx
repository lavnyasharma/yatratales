'use client';
import PackageCard from '@/components/PackageCard';
import PackageCardSkeleton from '@/components/PackageCardSkeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';


export default function AllPackagesPage() {
  const { firestore } = useFirebase();

  const packagesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'travelPackages') : null),
    [firestore]
  );
  const { data: packagesData, isLoading } = useCollection(packagesQuery);

  return (
    <div className="container py-12">
        <Breadcrumb className="mb-8">
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage>All Packages</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Explore Our Packages</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Find your next adventure from our collection of expertly crafted travel experiences.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <PackageCardSkeleton key={i} />)
        ) : (
            packagesData?.map((pkg) => (
                <PackageCard key={pkg.id} packageData={pkg} />
            ))
        )}
      </div>
    </div>
  );
}

    
