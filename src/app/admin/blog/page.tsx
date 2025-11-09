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
import { PlusCircle, MoreHorizontal, FileText, CheckCircle, Sparkles, Loader2, Search, Filter, Download, Eye, Edit, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DashboardCard from '@/components/admin/DashboardCard';
import { useCollection, useFirebase, useMemoFirebase, errorEmitter } from '@/firebase';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { useState } from 'react';
import { seedDataAction } from '../packages/actions';

const getPlaceholder = (id: string) => PlaceHolderImages.find(p => p.id === id);

export default function BlogAdminPage() {
  const { firestore } = useFirebase();
  const [isSeeding, setIsSeeding] = useState(false);

  const postsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'blogPosts') : null),
    [firestore]
  );
  const { data: blogPosts, isLoading, refetch } = useCollection(postsQuery);

  const publishedCount = blogPosts?.filter(p => p.status === 'Published').length || 0;
  const draftCount = blogPosts?.filter(p => p.status === 'Draft').length || 0;

  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    const docRef = doc(firestore, 'blogPosts', id);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: 'Post Deleted', description: 'The blog post has been successfully deleted.'});
      })
      .catch((error) => {
         errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
          })
        );
        toast({ title: 'Error deleting post', description: error.message, variant: 'destructive' });
      });
  }

  const handleSeedData = async () => {
    setIsSeeding(true);
    const result = await seedDataAction();
    if (result.success) {
        toast({
            title: 'Database Seeded!',
            description: 'Your Firestore database has been populated with sample data.',
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
            Blog Posts
          </h2>
          <p className="text-muted-foreground text-lg">Create and manage your travel blog articles</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search blog posts..." 
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
          title="Published Posts"
          count={publishedCount}
          description="Total live blog posts"
          icon={<CheckCircle className="h-6 w-6 text-primary" />}
          trend={{ value: 14.8, isPositive: true }}
        />
        <DashboardCard 
          title="Draft Posts"
          count={draftCount}
          description="Posts saved as drafts"
          icon={<FileText className="h-6 w-6 text-primary" />}
          trend={{ value: 7.2, isPositive: false }}
        />
        <DashboardCard 
          title="Total Posts"
          count={(blogPosts?.length || 0)}
          description="All blog posts"
          icon={<Edit className="h-6 w-6 text-primary" />}
          trend={{ value: 9.5, isPositive: true }}
        />
      </div>
      {/* Blog Posts Table */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Blog Management
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Create and manage your travel blog articles
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-medium">
              {blogPosts?.length || 0} Total
            </Badge>
            <Button onClick={handleSeedData} variant="outline" disabled={isSeeding} size="sm" className="gap-2">
              {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Seed Data
            </Button>
            <Button asChild size="sm" className="gap-2">
              <Link href="/admin/blog/new">
                <PlusCircle className="h-4 w-4" />
                New Post
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
                  <p className="font-medium text-foreground">Loading blog posts...</p>
                  <p className="text-sm text-muted-foreground">Please wait while we fetch your data</p>
                </div>
              </div>
            </div>
          ) : !blogPosts || blogPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative">
                <div className="mx-auto h-20 w-20 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="absolute inset-0 mx-auto h-20 w-20 bg-primary/5 rounded-full animate-pulse"></div>
              </div>
              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-semibold text-foreground">No blog posts found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">Get started by creating a new blog post or seed some sample data.</p>
              </div>
              <div className="mt-6">
                <Button onClick={handleSeedData} variant="outline" disabled={isSeeding}>
                  {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Seed Data
                </Button>
                <Button asChild className="ml-2">
                  <Link href="/admin/blog/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Post
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
                    <TableHead className="font-semibold text-foreground/90">Title</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Status</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Publish Date</TableHead>
                    <TableHead className="font-semibold text-foreground/90 w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogPosts?.map((post) => {
                    const image = getPlaceholder(post.imageId || 'blog-1');
                    return (
                      <TableRow key={post.id} className="hover:bg-gradient-to-r hover:from-primary/[0.02] hover:to-transparent transition-all duration-200 border-border/30">
                        <TableCell className="hidden sm:table-cell py-4">
                          <div className="relative h-14 w-14 overflow-hidden rounded-xl shadow-sm">
                            <Image
                              alt={post.title}
                              className="object-cover"
                              fill
                              src={image?.imageUrl || ''}
                              data-ai-hint={image?.imageHint}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="font-semibold text-foreground">{post.title}</div>
                            <div className="text-sm text-muted-foreground">Blog Article</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={post.status === 'Published' ? "default" : "secondary"}
                            className={post.status === 'Published' 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                            }
                          >
                            {post.status === 'Published' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {post.status === 'Draft' && <Edit className="w-3 h-3 mr-1" />}
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">
                              {post.publishDate ? new Date(post.publishDate).toLocaleDateString() : 'N/A'}
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
                                <Link href={`/admin/blog/edit/${post.id}`}>
                                  <Edit className="h-4 w-4" />
                                  Edit Post
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="gap-2">
                                <Link href={`/blog/${post.id}`} target="_blank">
                                  <Eye className="h-4 w-4" />
                                  View Live
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive gap-2" onClick={() => handleDelete(post.id)}>
                                <Download className="h-4 w-4" />
                                Delete Post
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
