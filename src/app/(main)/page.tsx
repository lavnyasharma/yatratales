
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Star, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { TravelPackage } from '@/lib/types';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TravelPackage[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { firestore } = useFirebase();

  const packagesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'travelPackages') : null),
    [firestore]
  );
  const { data: allPackages } = useCollection<TravelPackage>(packagesQuery);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 0 && allPackages) {
      setIsSearching(true);
      const filtered = allPackages.filter(pkg => 
        pkg.title.toLowerCase().includes(query.toLowerCase()) ||
        pkg.location.toLowerCase().includes(query.toLowerCase()) ||
        pkg.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5); // Limit to 5 results
      
      setSearchResults(filtered);
      setShowResults(true);
      setIsSearching(false);
    } else {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/packages?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
    }
  };

  // Handle package selection
  const handlePackageSelect = (packageId: string) => {
    router.push(`/packages/${packageId}`);
    setShowResults(false);
    setSearchQuery('');
  };

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className="relative w-full bg-background overflow-hidden">
      <div className="container px-4 pt-24 pb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 text-foreground leading-tight">Tours and Trip packages, Globally</h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">Search, compare and book 15,000+ multiday tours all over the world.</p>
        
        <div className="max-w-2xl mx-auto relative" ref={searchRef}>
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for destinations, packages..."
                className="w-full h-14 pl-12 pr-28 rounded-full shadow-lg bg-white/95 backdrop-blur-sm"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery && setShowResults(true)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowResults(false);
                  }}
                  className="absolute right-20 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 flex items-center justify-center transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-full px-6"
                disabled={isSearching}
              >
                <Search className="h-5 w-5 mr-2" /> Search
              </Button>
            </div>
          </form>
          
          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-border/50 overflow-hidden z-50 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="p-3 border-b border-border/50 bg-muted/30">
                    <p className="text-sm font-medium text-muted-foreground">Found {searchResults.length} packages</p>
                  </div>
                  {searchResults.map((pkg) => {
                    const image = pkg.imageUrls?.[0] || getPlaceholder(pkg.imageIds?.[0] || 'package-alps')?.imageUrl;
                    const minPrice = pkg.pricing?.[0]?.rates?.[0]?.price || 0;
                    
                    return (
                      <button
                        key={pkg.id}
                        onClick={() => handlePackageSelect(pkg.id)}
                        className="w-full p-4 hover:bg-muted/50 transition-colors text-left border-b border-border/30 last:border-b-0 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {image ? (
                              <Image
                                src={image}
                                alt={pkg.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {pkg.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{pkg.location}</span>
                              <span className="text-sm text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">{pkg.duration}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-primary">₹{minPrice.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">per person</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {searchResults.length === 5 && (
                    <button
                      onClick={() => {
                        router.push(`/packages?search=${encodeURIComponent(searchQuery)}`);
                        setShowResults(false);
                      }}
                      className="w-full p-4 text-center text-primary hover:bg-primary/5 transition-colors font-medium border-t border-border/50"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  )}
                </>
              ) : (
                <div className="p-6 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">No packages found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try searching for destinations like "Switzerland", "Bali", or "Japan"</p>
                </div>
              )}
            </div>
          )}
        </div>
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
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonialsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'testimonials'),
            where('status', '==', 'Approved'),
            limit(5)
          )
        : null,
    [firestore]
  );
  const { data: testimonials, isLoading } = useCollection(testimonialsQuery);

  const nextTestimonial = () => {
    if (testimonials && testimonials.length > 0) {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }
  };

  const prevTestimonial = () => {
    if (testimonials && testimonials.length > 0) {
      setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  if (isLoading) {
    return (
      <section className="relative py-16 lg:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center text-white mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simply the best and most relevant way to travel</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-12 w-24 mx-auto mb-2" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const currentTestimonialData = testimonials[currentTestimonial];

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={getPlaceholder('hero-bg')?.imageUrl || '/api/placeholder/1200/600'}
          alt="Background"
          fill
          className="object-cover"
          data-ai-hint={getPlaceholder('hero-bg')?.imageHint}
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="text-center text-white mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simply the best and most relevant way to travel</h2>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">2154<span className="text-2xl">+</span></div>
              <div className="text-sm text-white/80">Locations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">109<span className="text-2xl">+</span></div>
              <div className="text-sm text-white/80">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">720<span className="text-2xl">+</span></div>
              <div className="text-sm text-white/80">Guides</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">25,214<span className="text-2xl">+</span></div>
              <div className="text-sm text-white/80">Reviews</div>
            </div>
          </div>
          
          {/* Average Rating Badge */}
          <div className="absolute top-8 right-8 bg-green-500 text-white rounded-full p-4 text-center hidden md:block">
            <div className="text-xs mb-1">AVERAGE RATING</div>
            <div className="text-2xl font-bold">4.8</div>
            <div className="flex justify-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-white fill-current" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-8 md:p-12 text-center">
              {/* Star Rating */}
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-primary fill-current" />
                ))}
              </div>
              
              {/* Testimonial Text */}
              <blockquote className="text-xl md:text-2xl text-foreground mb-8 leading-relaxed italic">
                "{currentTestimonialData.comment}"
              </blockquote>
              
              {/* Author */}
              <div className="text-muted-foreground">
                <p className="font-semibold">{currentTestimonialData.name}</p>
                <p className="text-sm">{currentTestimonialData.location || 'New York, USA'}</p>
              </div>
              
              {/* Navigation */}
              <div className="flex justify-center items-center mt-8 gap-4">
                <button
                  onClick={prevTestimonial}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* Dots */}
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentTestimonial ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={nextTestimonial}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </CardContent>
          </Card>
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
              limit(4)
            )
          : null,
      [firestore]
    );

    const { data: blogPosts, isLoading } = useCollection(blogPostsQuery);

    if (isLoading) {
        return (
            <section className="py-16 lg:py-24 bg-background">
                <div className="container">
                    <div className="mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-2">Latest Travel Guides</h2>
                        <p className="text-muted-foreground">View our travel guides giving you travel insights, ideas, and tips across the world.</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Skeleton className="w-full h-80 rounded-lg" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                        <div className="space-y-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="w-24 h-20 rounded-lg flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!blogPosts || blogPosts.length === 0) {
        return null;
    }

    const [featuredPost, ...otherPosts] = blogPosts;

    return (
        <section className="py-16 lg:py-24 bg-background">
            <div className="container">
                <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">Latest Travel Guides</h2>
                    <p className="text-muted-foreground">View our travel guides giving you travel insights, ideas, and tips across the world.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Featured Post - Left Side */}
                    <div className="group">
                        <Link href={`/blog/${featuredPost.id}`} className="block">
                            <div className="relative overflow-hidden rounded-lg mb-6">
                                {featuredPost.imageId && (
                                    <Image 
                                        src={getPlaceholder(featuredPost.imageId)?.imageUrl || ''} 
                                        alt={featuredPost.title}
                                        width={600}
                                        height={400}
                                        className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                                        data-ai-hint={getPlaceholder(featuredPost.imageId)?.imageHint}
                                    />
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                                        COMPANY INSIGHT
                                    </span>
                                </div>
                            </div>
                        </Link>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{featuredPost.publishDate ? new Date(featuredPost.publishDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '9 Nov, 2020'}</span>
                                <span>•</span>
                                <span>By {featuredPost.author || 'admin'}</span>
                            </div>
                            
                            <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                                <Link href={`/blog/${featuredPost.id}`}>{featuredPost.title}</Link>
                            </h3>
                            
                            <p className="text-muted-foreground leading-relaxed">
                                {featuredPost.excerpt || 'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I...'}
                            </p>
                            
                            <Link 
                                href={`/blog/${featuredPost.id}`}
                                className="inline-flex items-center text-primary font-medium hover:underline"
                            >
                                Read More
                            </Link>
                        </div>
                    </div>
                    
                    {/* Other Posts - Right Side */}
                    <div className="space-y-6">
                        {otherPosts.slice(0, 3).map((post, index) => {
                            const img = getPlaceholder(post.imageId || 'blog-1');
                            return (
                                <div key={post.id} className="flex gap-4 group">
                                    <Link href={`/blog/${post.id}`} className="flex-shrink-0">
                                        <div className="w-24 h-20 rounded-lg overflow-hidden">
                                            <Image 
                                                src={img?.imageUrl || ''} 
                                                alt={post.title}
                                                width={96}
                                                height={80}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                data-ai-hint={img?.imageHint}
                                            />
                                        </div>
                                    </Link>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                            <span>{post.publishDate ? new Date(post.publishDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '9 Nov, 2020'}</span>
                                            <span>•</span>
                                            <span>By {post.author || 'admin'}</span>
                                        </div>
                                        
                                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                                            <Link href={`/blog/${post.id}`}>{post.title}</Link>
                                        </h4>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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
