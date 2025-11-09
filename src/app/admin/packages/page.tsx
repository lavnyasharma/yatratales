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
import { PlusCircle, MoreHorizontal, Loader2, Sparkles, Package, Star, MapPin, IndianRupee, Search, Filter, Download, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
    <div className="space-y-8 p-6 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Travel Packages
          </h2>
          <p className="text-muted-foreground text-lg">Manage your travel packages and experiences</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search packages..." 
              className="pl-10 w-64 bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard 
          title="Total Packages"
          count={totalPackagesCount}
          description="Active travel packages"
          icon={<Package className="h-6 w-6 text-primary" />}
          trend={{ value: 8.5, isPositive: true }}
        />
        <DashboardCard 
          title="Featured Packages"
          count={featuredPackagesCount}
          description="Packages on homepage"
          icon={<Star className="h-6 w-6 text-primary" />}
          trend={{ value: 12.3, isPositive: true }}
        />
        <DashboardCard 
          title="Destinations"
          count={new Set(packagesData?.map(p => p.location)).size || 0}
          description="Unique travel destinations"
          icon={<MapPin className="h-6 w-6 text-primary" />}
          trend={{ value: 5.2, isPositive: true }}
        />
      </div>
      
      {/* Packages Table */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Package Management
            </CardTitle>
            <p className="text-sm text-muted-foreground">Add, edit, or remove travel packages</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSeedData} variant="outline" disabled={isSeeding} size="sm" className="gap-2">
              {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Seed Data
            </Button>
            <Button asChild size="sm" className="gap-2">
              <Link href="/admin/packages/new">
                <PlusCircle className="h-4 w-4" />
                Add Package
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary/20 border-r-primary align-[-0.125em]"></div>
                  <div className="absolute inset-0 inline-block h-12 w-12 animate-ping rounded-full border-4 border-primary/10"></div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Loading packages...</p>
                  <p className="text-sm text-muted-foreground">Please wait while we fetch your data</p>
                </div>
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
            <div className="text-center py-16">
              <div className="relative">
                <div className="mx-auto h-20 w-20 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="absolute inset-0 mx-auto h-20 w-20 bg-primary/5 rounded-full animate-pulse"></div>
              </div>
              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-semibold text-foreground">No packages found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">Get started by adding a new travel package or seed some sample data.</p>
              </div>
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
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-gradient-to-r from-muted/80 to-muted/40">
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="font-semibold text-foreground/90 py-4 hidden w-[100px] sm:table-cell">Image</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Package</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Location</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Status</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">Price</TableHead>
                    <TableHead className="font-semibold text-foreground/90 w-12">Actions</TableHead>
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
                      <TableRow key={pkg.id} className="hover:bg-gradient-to-r hover:from-primary/[0.02] hover:to-transparent transition-all duration-200 border-border/30">
                        <TableCell className="hidden sm:table-cell py-4">
                          {image ? (
                            <div className="relative h-14 w-14 overflow-hidden rounded-xl shadow-sm">
                              <Image
                                alt={pkg.title}
                                className="object-cover"
                                fill
                                src={image.imageUrl || ''}
                                data-ai-hint={image.imageHint}
                              />
                            </div>
                          ) : (
                            <div className="bg-gradient-to-br from-muted to-muted/50 border rounded-xl h-14 w-14 flex items-center justify-center shadow-sm">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="font-semibold text-foreground">{pkg.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {pkg.duration}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="font-medium">{pkg.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={pkg.featured ? "default" : "secondary"} 
                            className={pkg.featured ? "bg-primary/10 text-primary border-primary/20" : ""}
                          >
                            <Star className={`w-3 h-3 mr-1 ${pkg.featured ? 'fill-current' : ''}`} />
                            {pkg.featured ? "Featured" : "Standard"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IndianRupee className="h-4 w-4 text-muted-foreground" />
                            <span className="font-bold text-lg text-foreground">
                              {minPrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild className="gap-2">
                                <Link href={`/admin/packages/edit/${pkg.id}`}>
                                  <Eye className="h-4 w-4" />
                                  Edit Package
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="gap-2">
                                <Link href={`/packages/${pkg.id}`} target="_blank">
                                  <Eye className="h-4 w-4" />
                                  View Live
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive gap-2" onClick={() => handleDelete(pkg.id)}>
                                <Download className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
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