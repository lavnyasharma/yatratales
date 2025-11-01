'use client';

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
import { Check, MoreHorizontal, Star, Trash, MessageSquareQuote, CheckCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection, useFirebase, useMemoFirebase, errorEmitter } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import DashboardCard from '@/components/admin/DashboardCard';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Testimonial } from '@/lib/types';

export default function ReviewsAdminPage() {
    const { firestore } = useFirebase();

    const testimonialsQuery = useMemoFirebase(
      () => (firestore ? collection(firestore, 'testimonials') : null),
      [firestore]
    );
    const { data: reviews, isLoading } = useCollection<Testimonial>(testimonialsQuery);

    const pendingReviewsCount = reviews?.filter(r => r.status === 'Pending').length || 0;
    const approvedReviewsCount = reviews?.filter(r => r.status === 'Approved').length || 0;

    const handleApprove = async (id: string) => {
        if (!firestore) return;
        const reviewDoc = doc(firestore, 'testimonials', id);
        try {
            await updateDoc(reviewDoc, { status: 'Approved' });
            toast({ title: 'Review Approved' });
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
    };

    const handleDelete = (id: string) => {
        if (!firestore) return;
        if (!confirm('Are you sure you want to delete this review?')) return;
        const reviewDoc = doc(firestore, 'testimonials', id);
        deleteDoc(reviewDoc)
          .then(() => {
            toast({ title: 'Review Deleted' });
          })
          .catch((e: any) => {
            errorEmitter.emit(
              'permission-error',
              new FirestorePermissionError({
                path: reviewDoc.path,
                operation: 'delete',
              })
            );
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
          });
    }


  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <DashboardCard 
                title="Pending Reviews"
                count={pendingReviewsCount}
                description="Reviews awaiting approval"
                icon={<MessageSquareQuote className="h-4 w-4 text-muted-foreground" />}
            />
             <DashboardCard 
                title="Approved Reviews"
                count={approvedReviewsCount}
                description="Total approved reviews"
                icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
            />
        </div>
        <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Customer Reviews</CardTitle>
                    <CardDescription>Manage customer feedback and reviews for your packages.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {isLoading && <p>Loading reviews...</p>}
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[200px]">Author</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {reviews?.map((review) => (
                <TableRow key={review.id} className={review.status === 'Pending' ? 'bg-secondary/50' : ''}>
                    <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar>
                        <AvatarImage src={review.image} alt={review.name} />
                        <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{review.name}</span>
                    </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-sm">
                        <p className="line-clamp-2">{review.comment}</p>
                    </TableCell>
                    <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                            {review.rating} <Star className="ml-1 h-4 w-4 text-yellow-500 fill-current" />
                        </div>
                    </TableCell>
                    <TableCell>
                    <Badge variant={review.status === 'Approved' ? "default" : "secondary"}>
                        {review.status}
                    </Badge>
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
                        {review.status === 'Pending' && (
                            <DropdownMenuItem onClick={() => handleApprove(review.id)}>
                                <Check className="mr-2 h-4 w-4 text-green-500"/> Approve
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(review.id)}>
                            <Trash className="mr-2 h-4 w-4"/> Delete
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
            {!isLoading && reviews?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No reviews found.</p>
            )}
        </CardContent>
        </Card>
    </div>
  )
}

    