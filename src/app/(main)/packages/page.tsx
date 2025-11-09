'use client';
import PackageCard from '@/components/PackageCard';
import PackageCardSkeleton from '@/components/PackageCardSkeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Search, X, MapPin } from 'lucide-react';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { TravelPackage } from '@/lib/types';

function PackagesContent() {
  const { firestore } = useFirebase();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const packagesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'travelPackages') : null),
    [firestore]
  );
  const { data: allPackages, isLoading } = useCollection<TravelPackage>(packagesQuery);
  
  // Initialize search query from URL params
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);
  
  // Filter packages based on search query
  const filteredPackages = useMemo(() => {
    if (!allPackages || !searchQuery.trim()) {
      return allPackages || [];
    }
    
    const query = searchQuery.toLowerCase();
    return allPackages.filter(pkg => 
      pkg.title.toLowerCase().includes(query) ||
      pkg.location.toLowerCase().includes(query) ||
      pkg.description.toLowerCase().includes(query)
    );
  }, [allPackages, searchQuery]);
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/packages?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/packages');
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    router.push('/packages');
  };

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
        <h1 className="text-4xl md:text-5xl font-headline font-bold">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Explore Our Packages'}
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          {searchQuery 
            ? `Found ${filteredPackages.length} packages matching your search`
            : 'Find your next adventure from our collection of expertly crafted travel experiences.'
          }
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for destinations, packages..."
              className="w-full h-12 pl-12 pr-20 rounded-full shadow-sm bg-white/95 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-16 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 flex items-center justify-center transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 rounded-full px-4"
            >
              Search
            </Button>
          </div>
        </form>
      </div>
      
      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => <PackageCardSkeleton key={i} />)}
        </div>
      ) : filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg) => (
            <PackageCard key={pkg.id} packageData={pkg} />
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-16">
          <div className="relative">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
              <MapPin className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="absolute inset-0 mx-auto h-20 w-20 bg-primary/5 rounded-full animate-pulse"></div>
          </div>
          <div className="mt-6 space-y-2">
            <h3 className="text-lg font-semibold text-foreground">No packages found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              We couldn't find any packages matching "{searchQuery}". Try searching for different destinations or keywords.
            </p>
          </div>
          <div className="mt-6">
            <Button onClick={clearSearch} variant="outline">
              Clear Search
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="relative">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
              <MapPin className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="absolute inset-0 mx-auto h-20 w-20 bg-primary/5 rounded-full animate-pulse"></div>
          </div>
          <div className="mt-6 space-y-2">
            <h3 className="text-lg font-semibold text-foreground">No packages available</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              There are no travel packages available at the moment. Please check back later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AllPackagesPage() {
  return (
    <Suspense fallback={
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => <PackageCardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <PackagesContent />
    </Suspense>
  );
}

    
