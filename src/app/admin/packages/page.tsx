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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PlusCircle, MoreHorizontal, Loader2, Sparkles, Package, Star } from 'lucide-react';
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DashboardCard 
                title="Total Packages"
                count={packagesData?.length || 0}
                description="Number of travel packages available"
                icon={<Package className="h-4 w-4 text-muted-foreground" />}
            />
             <DashboardCard 
                title="Featured Packages"
                count={featuredPackagesCount}
                description="Number of packages on the homepage"
                icon={<Star className="h-4 w-4 text-muted-foreground" />}
            />
        </div>
        <Card>
        <CardHeader>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <CardTitle>Travel Packages</CardTitle>
                    <CardDescription>Manage your travel packages here. Add, edit, or remove them.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSeedData} variant="outline" disabled={isSeeding}>
                        {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Seed Data
                    </Button>
                    <Button asChild>
                        <Link href="/admin/packages/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Package
                        </Link>
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading packages...</TableCell>
                    </TableRow>
                )}
                {error && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-destructive">
                            Error loading packages: Insufficient permissions. Try seeding the data.
                        </TableCell>
                    </TableRow>
                )}
                {!isLoading && !error && packagesData?.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            <p>No packages found.</p>
                            <Button onClick={handleSeedData} variant="link" disabled={isSeeding}>Seed the database to get started.</Button>
                        </TableCell>
                    </TableRow>
                )}
                {packagesData?.map((pkg) => {
                const image = getPlaceholder(pkg.imageIds?.[0] || 'package-alps');
                const minPrice = pkg.pricing?.[0]?.rates?.[0]?.price || 0;
                return (
                <TableRow key={pkg.id}>
                    <TableCell className="hidden sm:table-cell">
                    {image && 
                        <Image
                        alt={pkg.title}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={image?.imageUrl || ''}
                        width="64"
                        data-ai-hint={image?.imageHint}
                        />
                    }
                    </TableCell>
                    <TableCell className="font-medium">{pkg.title}</TableCell>
                    <TableCell>
                    <Badge variant={pkg.featured ? "default" : "secondary"}>
                        {pkg.featured ? "Featured" : "Standard"}
                    </Badge>
                    </TableCell>
                    <TableCell>₹{minPrice.toLocaleString('en-IN')}</TableCell>
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
                )})}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    </div>
  )
}
