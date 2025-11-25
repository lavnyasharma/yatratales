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
  ThumbsUp,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import type { Testimonial, TravelPackage } from '@/lib/types';

export default function ReviewsAdminPage() {
  const { firestore } = useFirebase();

  const testimonialsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'testimonials') : null),
    [firestore]
  );
  const { data: reviews, isLoading } = useCollection<Testimonial>(testimonialsQuery);

  // Fetch packages to show package names
  const packagesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'travelPackages') : null),
    [firestore]
  );
  const { data: packages } = useCollection<TravelPackage>(packagesQuery);

  // Create a map of package ID to package name
  const packageMap = new Map(packages?.map(pkg => [pkg.id, pkg.title]) || []);

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
    <div className="space-y-8 p-6 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Customer Reviews
          </h2>
          <p className="text-muted-foreground text-lg">Manage and moderate customer feedback</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search reviews..."
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Reviews"
          count={totalReviewsCount}
          description="All customer reviews"
          icon={<MessageSquareQuote className="h-6 w-6 text-primary" />}
          trend={{ value: 15.2, isPositive: true }}
        />
        <DashboardCard
          title="Pending Reviews"
          count={pendingReviewsCount}
          description="Awaiting approval"
          icon={<Clock className="h-6 w-6 text-primary" />}
          trend={{ value: 8.7, isPositive: false }}
        />
        <DashboardCard
          title="Approved Reviews"
          count={approvedReviewsCount}
          description="Published reviews"
          icon={<CheckCircle className="h-6 w-6 text-primary" />}
          trend={{ value: 22.1, isPositive: true }}
        />
        <DashboardCard
          title="Avg. Rating"
          count={reviews && reviews.length > 0
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
            : '0.0'
          }
          description="Average customer rating"
          icon={<ThumbsUp className="h-6 w-6 text-primary" />}
          trend={{ value: 4.2, isPositive: true }}
        />
      </div>

      {/* Reviews Table */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Review Management
            </CardTitle>
            <p className="text-sm text-muted-foreground">Approve or delete customer testimonials</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-medium">
              {reviews?.length || 0} Total
            </Badge>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              View All
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
                  <p className="font-medium text-foreground">Loading reviews...</p>
                  <p className="text-sm text-muted-foreground">Please wait while we fetch your data</p>
                </div>
              </div>
            </div>
          ) : !reviews || reviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative">
                <div className="mx-auto h-20 w-20 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
                  <MessageSquareQuote className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="absolute inset-0 mx-auto h-20 w-20 bg-primary/5 rounded-full animate-pulse"></div>
              </div>
              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-semibold text-foreground">No reviews found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">There are no customer reviews to display yet. New reviews will appear here once customers start leaving feedback.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-gradient-to-r from-muted/80 to-muted/40">
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="font-semibold text-foreground/90 py-4 w-[200px]">Customer</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Review</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-center">Rating</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Status</TableHead>
                    <TableHead className="font-semibold text-foreground/90 w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow
                      key={review.id}
                      className={`hover:bg-gradient-to-r hover:from-primary/[0.02] hover:to-transparent transition-all duration-200 border-border/30 ${review.status === 'Pending' ? 'bg-amber-50/50' : ''}`}
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={review.image} alt={review.name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
                              {review.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-foreground">{review.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {packageMap.get(review.packageId) || 'Unknown Package'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md py-4">
                        <p className="line-clamp-2 text-foreground/80 leading-relaxed">{review.comment}</p>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-foreground">{review.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={review.status === 'Approved' ? "default" : "secondary"}
                          className={review.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200'
                            : review.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : ''
                          }
                        >
                          {review.status === 'Approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {review.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                          {review.status}
                        </Badge>
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
                            {review.status === 'Pending' && (
                              <DropdownMenuItem onClick={() => handleApprove(review.id)} className="gap-2">
                                <Check className="h-4 w-4 text-green-500" /> Approve Review
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive gap-2" onClick={() => handleDelete(review.id)}>
                              <Trash className="h-4 w-4" /> Delete Review
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