'use client';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import BlogCardSkeleton from '@/components/BlogCardSkeleton';

const getPlaceholder = (id: string) => PlaceHolderImages.find(p => p.id === id);

export default function BlogPage() {
  const { firestore } = useFirebase();

  const blogPostsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'blogPosts'),
            where('status', '==', 'Published')
          )
        : null,
    [firestore]
  );
  
  const { data: blogPosts, isLoading } = useCollection(blogPostsQuery);

  return (
    <div className="container py-12">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Blog</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Travel Blog</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Get inspired with our latest travel stories, tips, and guides from around the globe.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)
        ) : (
          blogPosts?.map(post => {
            const img = getPlaceholder(post.imageId || 'blog-1');
            return (
              <Card key={post.id} className="overflow-hidden group flex flex-col bg-background shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Link href={`/blog/${post.id}`} className="block">
                  <div className="overflow-hidden rounded-t-lg">
                    <Image src={img?.imageUrl || ''} alt={post.title} width={400} height={220} className="w-full h-[220px] object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" data-ai-hint={img?.imageHint} />
                  </div>
                </Link>
                <CardContent className="p-6 flex flex-col flex-grow">
                  <p className="text-sm text-muted-foreground mb-2">{post.publishDate ? new Date(post.publishDate).toLocaleDateString() : 'N/A'} &bull; by {post.author}</p>
                  <h3 className="font-headline text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="text-muted-foreground text-sm flex-grow mb-4">{post.excerpt}</p>
                  <Button variant="link" asChild className="p-0 h-auto justify-start font-bold text-primary">
                    <Link href={`/blog/${post.id}`}>Read More &rarr;</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
       {!isLoading && blogPosts?.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
            <h2 className="text-2xl font-semibold">No Blog Posts Yet</h2>
            <p>Check back soon for travel stories and inspiration!</p>
        </div>
      )}
    </div>
  );
}
