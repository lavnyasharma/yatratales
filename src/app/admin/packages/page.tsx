'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, MoreHorizontal, Loader2, Sparkles, Package, Star, MapPin, IndianRupee } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCollection, useFirebase, useMemoFirebase, errorEmitter } from '@/firebase';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import DashboardCard from '@/components/admin/DashboardCard';
import { seedDataAction } from './actions';
import { FirestorePermissionError } from '@/firebase/errors';
import type { TravelPackage } from '@/lib/types';


const getPlaceholder = (id: string) => PlaceHolderImages.find(p => p.id === id);

export default function PackagesAdminPage() {
    const { firestore } = useFirebase();
    const [isSeeding, setIsSeeding] = useState(false);

    const packagesQuery = useMemoFirebase(
      () => (firestore ? collection(firestore, 'travelPackages') : null),
      [firestore]
    );
    const { data: packagesData, isLoading, error, refetch } = useCollection<TravelPackage>(packagesQuery);
    
    const featuredPackagesCount = packagesData?.filter(p => p.featured).length || 0;
    const totalPackagesCount = packagesData?.length || 0;

    const handleDelete = async (id: string) => {
      if (!firestore) return;

      const docRef = doc(firestore, 'travelPackages', id);
      try {
        await deleteDoc(docRef);
        toast({
          title: 'Package Deleted',
          description: 'The travel package has been successfully deleted.',
        });
      } catch (error: any) {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
          })
        );
        toast({
          title: 'Error Deleting Package',
          description: error.message || 'Could not delete the package. Please check permissions.',
          variant: 'destructive',
        });
      }
    };

    const handleSeedData = async () => {
        setIsSeeding(true);
        const result = await seedDataAction();
        if (result.success) {
            toast({
                title: 'Database Seeded!',
                description: 'Your Firestore database has been populated with travel packages.',
            });
            refetch();
        } else {
            toast({
                title: 'Seeding Failed',
                description: result.error || 'An unknown error occurred.',
                variant: 'destructive',
            });
        }
        setIsSeeding(false);
    }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Travel Packages</h2>
        <p className="text-muted-foreground">Manage your travel packages and experiences</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard 
          title="Total Packages"
          count={totalPackagesCount}
          description="Active travel packages"
          icon={<Package className="h-6 w-6 text-primary" />}
          className="border-l-4 border-l-primary"
        />
        <DashboardCard 
          title="Featured Packages"
          count={featuredPackagesCount}
          description="Packages on homepage"
          icon={<Star className="h-6 w-6 text-primary" />}
          className="border-l-4 border-l-primary"
        />
        <DashboardCard 
          title="Destinations"
          count={new Set(packagesData?.map(p => p.location)).size || 0}
          description="Unique travel destinations"
          icon={<MapPin className="h-6 w-6 text-primary" />}
          className="border-l-4 border-l-primary"
        />
      </div>
      
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Package Management</CardTitle>
            <p className="text-sm text-muted-foreground">Add, edit, or remove travel packages</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSeedData} variant="outline" disabled={isSeeding} size="sm">
              {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Seed Data
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/packages/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Package
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2 text-muted-foreground">Loading packages...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-destructive">
                <p className="font-medium">Error loading packages</p>
                <p className="text-sm mt-1">Insufficient permissions. Try seeding the data.</p>
                <Button onClick={handleSeedData} variant="outline" className="mt-4" disabled={isSeeding}>
                  {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Seed Data
                </Button>
              </div>
            </div>
          ) : !packagesData || packagesData.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-medium">No packages found</h3>
              <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new travel package.</p>
              <div className="mt-6">
                <Button onClick={handleSeedData} variant="outline" disabled={isSeeding}>
                  {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Seed Data
                </Button>
                <Button asChild className="ml-2">
                  <Link href="/admin/packages/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Package
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-medium hidden w-[100px] sm:table-cell">Image</TableHead>
                    <TableHead className="font-medium">Package</TableHead>
                    <TableHead className="font-medium">Location</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium text-right">Price</TableHead>
                    <TableHead className="font-medium">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packagesData.map((pkg) => {
                    // Use imageUrls if available, otherwise fallback to imageIds
                    let image = null;
                    if (pkg.imageUrls && pkg.imageUrls.length > 0) {
                      image = {
                        id: '',
                        description: '',
                        imageUrl: pkg.imageUrls[0],
                        imageHint: ''
                      };
                    } else {
                      image = getPlaceholder(pkg.imageIds?.[0] || 'package-alps');
                    }
                    
                    const minPrice = pkg.pricing?.[0]?.rates?.[0]?.price || 0;
                    return (
                      <TableRow key={pkg.id} className="hover:bg-muted/50">
                        <TableCell className="hidden sm:table-cell">
                          {image ? (
                            <div className="relative h-12 w-12 overflow-hidden rounded-md">
                              <Image
                                alt={pkg.title}
                                className="object-cover"
                                fill
                                src={image.imageUrl || ''}
                                data-ai-hint={image.imageHint}
                              />
                            </div>
                          ) : (
                            <div className="bg-muted border rounded-md h-12 w-12 flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{pkg.title}</div>
                          <div className="text-sm text-muted-foreground md:hidden">
                            {pkg.duration}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{pkg.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={pkg.featured ? "default" : "secondary"}>
                            {pkg.featured ? "Featured" : "Standard"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          <div className="flex items-center justify-end">
                            <IndianRupee className="h-4 w-4" />
                            {minPrice.toLocaleString('en-IN')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/packages/edit/${pkg.id}`}>Edit</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/packages/${pkg.id}`} target="_blank">View</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(pkg.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}