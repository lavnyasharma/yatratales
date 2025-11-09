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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Check, 
  MoreHorizontal, 
  Star, 
  Trash, 
  MessageSquareQuote, 
  CheckCircle, 
  Clock,
  ThumbsUp
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
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
    const totalReviewsCount = reviews?.length || 0;

    const handleApprove = async (id: string) => {
        if (!firestore) return;
        const reviewDoc = doc(firestore, 'testimonials', id);
        try {
            await updateDoc(reviewDoc, { status: 'Approved' });
            toast({ 
              title: 'Review Approved',
              description: 'The customer review has been approved and is now visible.'
            });
        } catch (e: any) {
            toast({ 
              title: 'Error', 
              description: e.message, 
              variant: 'destructive' 
            });
        }
    };

    const handleDelete = (id: string) => {
        if (!firestore) return;
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
        const reviewDoc = doc(firestore, 'testimonials', id);
        deleteDoc(reviewDoc)
          .then(() => {
            toast({ 
              title: 'Review Deleted',
              description: 'The customer review has been permanently removed.'
            });
          })
          .catch((e: any) => {
            errorEmitter.emit(
              'permission-error',
              new FirestorePermissionError({
                path: reviewDoc.path,
                operation: 'delete',
              })
            );
            toast({ 
              title: 'Error', 
              description: e.message, 
              variant: 'destructive' 
            });
          });
    }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Customer Reviews</h2>
        <p className="text-muted-foreground">Manage and moderate customer feedback</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Total Reviews"
          count={totalReviewsCount}
          description="All customer reviews"
          icon={<MessageSquareQuote className="h-6 w-6 text-primary" />}
          className="border-l-4 border-l-primary"
        />
        <DashboardCard 
          title="Pending Reviews"
          count={pendingReviewsCount}
          description="Awaiting approval"
          icon={<Clock className="h-6 w-6 text-primary" />}
          className="border-l-4 border-l-primary"
        />
        <DashboardCard 
          title="Approved Reviews"
          count={approvedReviewsCount}
          description="Published reviews"
          icon={<CheckCircle className="h-6 w-6 text-primary" />}
          className="border-l-4 border-l-primary"
        />
        <DashboardCard 
          title="Avg. Rating"
          count={reviews && reviews.length > 0 
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) 
            : '0.0'
          }
          description="Average customer rating"
          icon={<ThumbsUp className="h-6 w-6 text-primary" />}
          className="border-l-4 border-l-primary"
        />
      </div>
      
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Review Management</CardTitle>
            <p className="text-sm text-muted-foreground">Approve or delete customer testimonials</p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2 text-muted-foreground">Loading reviews...</p>
              </div>
            </div>
          ) : !reviews || reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquareQuote className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-medium">No reviews found</h3>
              <p className="mt-1 text-sm text-muted-foreground">There are no customer reviews to display yet.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-medium w-[200px]">Customer</TableHead>
                    <TableHead className="font-medium">Review</TableHead>
                    <TableHead className="font-medium text-center">Rating</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow 
                      key={review.id} 
                      className={`hover:bg-muted/50 ${review.status === 'Pending' ? 'bg-secondary/30' : ''}`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={review.image} alt={review.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {review.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{review.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {review.packageId || 'No package'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="line-clamp-2 text-muted-foreground">{review.comment}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} 
                              />
                            ))}
                          </div>
                          <span className="ml-2 font-medium">{review.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={review.status === 'Approved' ? "default" : "secondary"}
                          className={review.status === 'Pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}
                        >
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
                          <DropdownMenuContent align="end" className="w-48">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}