'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { use } from 'react';


const getPlaceholder = (id: string) => PlaceHolderImages.find(p => p.id === id);

function BlogPostSkeleton() {
  return (
    <div className="bg-secondary/30">
        <div className="container py-12">
             <Skeleton className="h-6 w-1/2" />
        </div>
      <Skeleton className="h-[400px] w-full" />
      <div className="container -mt-48 relative z-10">
        <Card>
          <CardContent className="p-8 md:p-12 space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <div className="flex items-center gap-6">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
                 <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-4 mt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const { firestore } = useFirebase();

  const postRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'blogPosts', id);
  }, [firestore, id]);

  const { data: post, isLoading } = useDoc(postRef);

  if (isLoading) {
    return <BlogPostSkeleton />;
  }

  if (!post) {
    return <div>Post not found.</div>;
  }

  const image = getPlaceholder(post.imageId || 'blog-1');
  const authorImage = getPlaceholder('testimonial-1'); // Generic author image

  return (
    <div className="bg-secondary/30">
        <div className="container py-12">
             <Breadcrumb className="mb-8">
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbLink href="/blog">Blog</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>{post.title}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>

      <div className="relative h-[400px] w-full">
        {image && <Image src={image.imageUrl} alt={post.title} fill className="object-cover" data-ai-hint={image.imageHint} />}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="container -mt-48 relative z-10">
        <Card>
          <CardContent className="p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-headline font-bold mb-6">{post.title}</h1>
            <div className="flex items-center gap-6 text-muted-foreground mb-8">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={authorImage?.imageUrl} alt={post.author} data-ai-hint={authorImage?.imageHint} />
                  <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-foreground">{post.author}</p>
                    <p className="text-sm">Author</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{post.publishDate ? new Date(post.publishDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            
            <div
              className="prose prose-lg max-w-none text-foreground/80 prose-headings:text-foreground prose-headings:font-headline prose-a:text-primary hover:prose-a:underline prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
