
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PackageCard from '@/components/PackageCard';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import PackageCardSkeleton from '@/components/PackageCardSkeleton';
import BlogCardSkeleton from '@/components/BlogCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

const getPlaceholder = (id: string) => PlaceHolderImages.find(p => p.id === id);

function HeroSection() {
  const heroIllustration = getPlaceholder('hero-illustration');
  return (
    <section className="relative w-full bg-background overflow-hidden">
      <div className="container px-4 pt-24 pb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 text-foreground leading-tight">Tours and Trip packages, Globally</h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">Search, compare and book 15,000+ multiday tours all over the world.</p>
        
        <form className="max-w-2xl mx-auto">
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for a destination..."
              className="w-full h-14 pl-12 pr-28 rounded-full shadow-lg"
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-full px-6"
            >
              <Search className="h-5 w-5 mr-2" /> Search
            </Button>
          </div>
        </form>
      </div>
      <div className="relative mt-8 h-64 md:h-96">
        {heroIllustration && (
            <Image 
                src={heroIllustration.imageUrl} 
                alt={heroIllustration.description}
                fill
                className="object-contain object-bottom"
                data-ai-hint={heroIllustration.imageHint}
            />
        )}
      </div>
    </section>
  );
}


function FeaturedPackagesSection() {
    const { firestore } = useFirebase();

    const featuredPackagesQuery = useMemoFirebase(
      () =>
        firestore
          ? query(
              collection(firestore, 'travelPackages'),
              where('featured', '==', true),
              limit(3)
            )
          : null,
      [firestore]
    );
    const { data: featuredPackages, isLoading } = useCollection(featuredPackagesQuery);

    return (
        <section className="py-16 lg:py-24 bg-background">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold">Featured Packages</h2>
                    <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Explore our handpicked selection of featured travel packages, designed to give you an unforgettable experience.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <PackageCardSkeleton key={i} />)
                    ) : (
                        featuredPackages?.map((pkg: any) => (
                            <PackageCard key={pkg.id} packageData={pkg} />
                        ))
                    )}
                </div>
                <div className="text-center mt-12">
                    <Button asChild size="lg" variant="outline">
                        <Link href="/packages">View All Packages</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}

function TestimonialsSection() {
  const { firestore } = useFirebase();

  const testimonialsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'testimonials'),
            where('status', '==', 'Approved'),
            limit(2)
          )
        : null,
    [firestore]
  );
  const { data: testimonials, isLoading } = useCollection(testimonialsQuery);

  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">What Our Customers Say</h2>
          <p className="text-muted-foreground mt-2">Real stories from our happy travelers.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {isLoading ? (
             Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="overflow-hidden bg-secondary border-none shadow-lg">
                <CardContent className="p-8 text-center flex flex-col items-center">
                    <Skeleton className="h-20 w-20 rounded-full mb-4" />
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-5 w-32 mb-4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))
          ) : (
            testimonials?.map((testimonial) => {
              const img = getPlaceholder('testimonial-1'); // Using a generic one for now
              return (
                <Card key={testimonial.id} className="overflow-hidden bg-secondary border-none shadow-lg">
                  <CardContent className="p-8 text-center">
                      <Avatar className="h-20 w-20 ring-4 ring-background mx-auto mb-4">
                        <AvatarImage src={testimonial.image || img?.imageUrl} alt={testimonial.name} data-ai-hint={img?.imageHint} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold text-foreground text-lg">{testimonial.name}</p>
                      <div className="flex justify-center items-center my-2">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                          ))}
                      </div>
                      <blockquote className="text-foreground/80 italic text-md mt-4">"{testimonial.comment}"</blockquote>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

function BlogPreviewSection() {
    const { firestore } = useFirebase();

    const blogPostsQuery = useMemoFirebase(
      () =>
        firestore
          ? query(
              collection(firestore, 'blogPosts'),
              where('status', '==', 'Published'),
              limit(3)
            )
          : null,
      [firestore]
    );

    const { data: blogPosts, isLoading } = useCollection(blogPostsQuery);

    return (
        <section className="py-16 lg:py-24 bg-secondary">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold">Travel Blog</h2>
                    <p className="text-muted-foreground mt-2">Get inspired with our latest travel stories, tips, and guides.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <BlogCardSkeleton key={i} />)
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
                                      <p className="text-sm text-muted-foreground mb-2">{post.publishDate ? new Date(post.publishDate).toLocaleDateString() : ''} &bull; by {post.author}</p>
                                      <h3 className="font-headline text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                        <Link href={`/blog/${post.id}`}>{post.title}</Link>
                                      </h3>
                                      <p className="text-muted-foreground text-sm flex-grow line-clamp-2">{post.excerpt}</p>
                                      <Button variant="link" asChild className="p-0 h-auto justify-start mt-4 font-bold text-primary">
                                          <Link href={`/blog/${post.id}`}>Read More &rarr;</Link>
                                      </Button>
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </div>
                 <div className="text-center mt-12">
                    <Button asChild size="lg" variant="outline">
                        <Link href="/blog">Read More Articles</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedPackagesSection />
      <TestimonialsSection />
      <BlogPreviewSection />
    </>
  );
}
