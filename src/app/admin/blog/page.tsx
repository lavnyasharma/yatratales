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
import { PlusCircle, MoreHorizontal, FileText, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
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
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <DashboardCard 
                title="Published Posts"
                count={publishedCount}
                description="Total live blog posts"
                icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
            />
             <DashboardCard 
                title="Draft Posts"
                count={draftCount}
                description="Posts saved as drafts"
                icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            />
        </div>
        <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Blog Posts</CardTitle>
                    <CardDescription>Create and manage your travel blog articles.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSeedData} variant="outline" disabled={isSeeding}>
                        {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Seed Data
                    </Button>
                    <Button asChild>
                        <Link href="/admin/blog/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Post
                        </Link>
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {isLoading && <p className="text-center py-4">Loading posts...</p>}
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Publish Date</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {blogPosts?.map((post) => {
                const image = getPlaceholder(post.imageId || 'blog-1');
                return (
                <TableRow key={post.id}>
                    <TableCell className="hidden sm:table-cell">
                    <Image
                        alt={post.title}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={image?.imageUrl || ''}
                        width="64"
                        data-ai-hint={image?.imageHint}
                    />
                    </TableCell>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                    <Badge variant={post.status === 'Published' ? "default" : "secondary"}>
                        {post.status}
                    </Badge>
                    </TableCell>
                    <TableCell>{post.publishDate ? new Date(post.publishDate).toLocaleDateString() : 'N/A'}</TableCell>
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
                        <DropdownMenuItem asChild><Link href={`/admin/blog/edit/${post.id}`}>Edit</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href={`/blog/${post.id}`} target="_blank">View</Link></DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(post.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                )})}
            </TableBody>
            </Table>
             {!isLoading && blogPosts?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No blog posts found.</p>
             )}
        </CardContent>
        </Card>
    </div>
  )
}
