'use client';

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
import { Check, MoreHorizontal, Star, Trash, X, MessageSquareQuote, Users, CheckCircle, Clock, ThumbsUp, Search, Filter, Download, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DashboardCard from '@/components/admin/DashboardCard';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';


const getPlaceholder = (id: string) => PlaceHolderImages.find(p => p.id === id);


export default function TestimonialsAdminPage() {
  const { firestore } = useFirebase();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const testimonialsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'testimonials'),
            orderBy('createdAt', 'desc')
          )
        : null,
    [firestore]
  );

  const { data: testimonials, isLoading } = useCollection(testimonialsQuery);

  const handleApprove = async (testimonialId: string) => {
    if (!firestore) return;
    
    setIsUpdating(testimonialId);
    try {
      await updateDoc(doc(firestore, 'testimonials', testimonialId), {
        status: 'Approved'
      });
      toast({
        title: 'Success',
        description: 'Testimonial approved successfully',
      });
    } catch (error) {
      console.error('Error approving testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve testimonial',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (testimonialId: string) => {
    if (!firestore) return;
    
    setIsUpdating(testimonialId);
    try {
      await deleteDoc(doc(firestore, 'testimonials', testimonialId));
      toast({
        title: 'Success',
        description: 'Testimonial deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete testimonial',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const totalTestimonialsCount = testimonials?.length || 0;
  const pendingTestimonialsCount = testimonials?.filter(r => r.status === 'Pending').length || 0;
  const approvedTestimonialsCount = testimonials?.filter(r => r.status === 'Approved').length || 0;
  const avgRating = testimonials && testimonials.length > 0 
    ? (testimonials.reduce((sum, review) => sum + review.rating, 0) / testimonials.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Customer Testimonials
          </h2>
          <p className="text-muted-foreground text-lg">Manage customer feedback and testimonials for your packages</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search testimonials..." 
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
          title="Total Testimonials"
          count={totalTestimonialsCount}
          description="All customer testimonials"
          icon={<MessageSquareQuote className="h-6 w-6 text-primary" />}
          trend={{ value: 18.5, isPositive: true }}
        />
        <DashboardCard 
          title="Pending Testimonials"
          count={pendingTestimonialsCount}
          description="Awaiting approval"
          icon={<Clock className="h-6 w-6 text-primary" />}
          trend={{ value: 12.3, isPositive: false }}
        />
        <DashboardCard 
          title="Approved Testimonials"
          count={approvedTestimonialsCount}
          description="Published testimonials"
          icon={<CheckCircle className="h-6 w-6 text-primary" />}
          trend={{ value: 25.7, isPositive: true }}
        />
        <DashboardCard 
          title="Avg. Rating"
          count={avgRating}
          description="Average customer rating"
          icon={<ThumbsUp className="h-6 w-6 text-primary" />}
          trend={{ value: 3.8, isPositive: true }}
        />
      </div>
      
      {/* Testimonials Table */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Testimonial Management
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Manage customer feedback and testimonials for your packages
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-medium">
              {totalTestimonialsCount} Total
            </Badge>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-muted/80 to-muted/40">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground/90 py-4 w-[200px]">Author</TableHead>
                  <TableHead className="font-semibold text-foreground/90">Comment</TableHead>
                  <TableHead className="font-semibold text-foreground/90">Package</TableHead>
                  <TableHead className="font-semibold text-foreground/90 text-center">Rating</TableHead>
                  <TableHead className="font-semibold text-foreground/90">Status</TableHead>
                  <TableHead className="font-semibold text-foreground/90 w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : testimonials?.map((review) => {
                  const image = getPlaceholder('testimonial-1');
                  return (
                    <TableRow 
                      key={review.id} 
                      className={`hover:bg-gradient-to-r hover:from-primary/[0.02] hover:to-transparent transition-all duration-200 border-border/30 ${review.status === 'Pending' ? 'bg-amber-50/50' : ''}`}
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={image?.imageUrl} alt={review.name} data-ai-hint={image?.imageHint} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
                              {review.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-foreground">{review.name}</div>
                            <div className="text-sm text-muted-foreground">{review.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md py-4">
                        <p className="line-clamp-2 text-foreground/80 leading-relaxed">{review.comment}</p>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="font-medium text-foreground">{review.packageName}</div>
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
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-primary/10"
                              disabled={isUpdating === review.id}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {review.status === 'Pending' && (
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => handleApprove(review.id)}
                                disabled={isUpdating === review.id}
                              >
                                <Check className="h-4 w-4 text-green-500"/> Approve Testimonial
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive gap-2"
                              onClick={() => handleDelete(review.id)}
                              disabled={isUpdating === review.id}
                            >
                              <Trash className="h-4 w-4"/> Delete Testimonial
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
        </CardContent>
      </Card>
    </div>
  );
}

    