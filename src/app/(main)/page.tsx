'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Headphones, Wallet, Globe, Mail, ArrowRight, MapPin, Search, Star, X } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { TravelPackage } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PackageCard from '@/components/PackageCard';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import PackageCardSkeleton from '@/components/PackageCardSkeleton';
import BlogCardSkeleton from '@/components/BlogCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import LeadPopup from '@/components/LeadPopup';

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

  // Fetch reviews for the floating cards
  const testimonialsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'testimonials'),
            where('status', '==', 'Approved'),
            limit(10)
          )
        : null,
    [firestore]
  );
  const { data: testimonials } = useCollection(testimonialsQuery);

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

  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const heroImages = [
      "https://images.unsplash.com/photo-1549488346-6019316d9585?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Himachal/Mountain
      "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Another Mountain/Lake
      "https://images.unsplash.com/photo-1524486361537-8ad15938f1a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80", // Scenic
      "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"  // Rain/Mist
  ];

  useEffect(() => {
    const interval = setInterval(() => {
        setCurrentBgIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-[600px] lg:h-[700px] flex items-center justify-center overflow-hidden bg-black text-white">
      {/* Background Image Slideshow */}
      <div className="absolute inset-0 z-0 select-none">
         {heroImages.map((img, index) => (
             <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBgIndex ? 'opacity-70' : 'opacity-0'}`}
             >
                <Image
                    src={img}
                    alt={`Hero Background ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                />
             </div>
         ))}
         
         {/* Gradient Overlays for Readability */}
         <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
         <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="container relative z-10 px-4 pt-20 h-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
          
          {/* Left Content */}
          <div className="space-y-6 max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight animate-fade-in-up">
              Book Your <br />
              Trip to <span className="text-primary">Himachal</span>
            </h1>
            
            <div className="flex items-center gap-3 text-sm md:text-base font-medium tracking-wide text-white/90 uppercase animate-fade-in-up delay-100">
                <span className="text-primary">Wander</span> 
                <span className="w-1 h-1 rounded-full bg-white/50" />
                <span>Travel</span>
                <span className="w-1 h-1 rounded-full bg-white/50" /> 
                <span className="text-primary">Connect</span> 
                <span className="w-1 h-1 rounded-full bg-white/50" />
                <span>Repeat</span>
            </div>
            
            <p className="text-white/80 text-lg animate-fade-in-up delay-200">
                Where Adventure meets Community <br/>
                <span className="text-white/60 text-sm font-light">#wravelerforlife</span>
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mt-8 z-50 animate-fade-in-up delay-300">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center bg-white/95 backdrop-blur rounded-full p-2 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-primary/50">
                    <MapPin className="ml-4 h-5 w-5 text-gray-500" />
                    <Input
                        type="search"
                        placeholder="Type Location... (e.g. Manali, Spiti)"
                        className="flex-1 border-0 bg-transparent text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 h-12 text-base"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => searchQuery && setShowResults(true)}
                    />
                    <Button 
                        type="submit" 
                        className="rounded-full px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors shadow-lg"
                    >
                        Search
                    </Button>
                </div>
              </form>

              {/* Search Results Dropdown */}
              {showResults && (
                <div 
                    ref={searchRef}
                    className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden z-50 text-gray-900 max-h-80 overflow-y-auto border border-white/20"
                >
                  {isSearching ? (
                    <div className="p-8 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
                      <p className="mt-2 text-sm text-gray-500">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                        {searchResults.map((pkg) => (
                             <button
                                key={pkg.id}
                                onClick={() => handlePackageSelect(pkg.id)}
                                className="w-full px-4 py-3 hover:bg-primary/5 flex items-center gap-3 text-left transition-colors group"
                             >
                                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                    <MapPin className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-900">{pkg.title}</p>
                                    <p className="text-xs text-gray-500">{pkg.location}</p>
                                </div>
                             </button>
                        ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-sm text-gray-500">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Content - Floating Reviews */}
          <div className="hidden lg:flex flex-col gap-4 relative h-[500px] overflow-hidden mask-vertical-fade">
             
             {(!testimonials && !testimonialsQuery) ? (
                // LOADING STATE
                <div className="space-y-4">
                   {Array.from({length: 3}).map((_, i) => (
                      <div key={i} className="bg-white/5 backdrop-blur border border-white/10 p-4 max-w-sm ml-auto rounded-2xl h-32 animate-pulse">
                         <div className="flex gap-3">
                            <div className="h-10 w-10 rounded-full bg-white/10" />
                            <div className="flex-1 space-y-2">
                               <div className="h-3 w-20 bg-white/10 rounded" />
                               <div className="h-2 w-full bg-white/10 rounded" />
                               <div className="h-2 w-3/4 bg-white/10 rounded" />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             ) : (
                <div className="animate-vertical-scroll space-y-4 pb-4">
                     {/* 
                        Use a stable combined list for infinite scroll. 
                        We duplicate 4 times to ensure seamless looping with -50% translation.
                        -50% of 4 sets = 2 sets. So we scroll from Start of Set 1 to Start of Set 3.
                        Since Set 3 == Set 1, the loop is invisible.
                     */}
                     {((testimonials || []).length > 0 
                        ? [
                            ...(testimonials || []), 
                            ...(testimonials || []), 
                            ...(testimonials || []), 
                            ...(testimonials || [])
                          ] 
                        : [
                            { name: "Aditi R.", comment: "The best trip to Spiti ever! Highly recommended.", image: null },
                            { name: "Rahul S.", comment: "Seamless experience from booking to travel.", image: null },
                            { name: "Priya M.", comment: "Amazing handling of the group tour. Loved it!", image: null },
                            { name: "Aditi R.", comment: "The best trip to Spiti ever! Highly recommended.", image: null },
                            { name: "Rahul S.", comment: "Seamless experience from booking to travel.", image: null },
                            { name: "Priya M.", comment: "Amazing handling of the group tour. Loved it!", image: null },
                            { name: "Aditi R.", comment: "The best trip to Spiti ever! Highly recommended.", image: null },
                            { name: "Rahul S.", comment: "Seamless experience from booking to travel.", image: null },
                            { name: "Priya M.", comment: "Amazing handling of the group tour. Loved it!", image: null },
                            { name: "Aditi R.", comment: "The best trip to Spiti ever! Highly recommended.", image: null },
                            { name: "Rahul S.", comment: "Seamless experience from booking to travel.", image: null },
                            { name: "Priya M.", comment: "Amazing handling of the group tour. Loved it!", image: null },
                          ]
                     ).map((review: any, i) => (
                        <Card key={`${review.id || i}-${i}`} className="bg-white/10 backdrop-blur-md border-white/10 text-white p-4 max-w-sm ml-auto rounded-2xl hover:bg-white/20 transition-all hover:scale-105 cursor-pointer shadow-lg">
                            <div className="flex gap-3">
                                <Avatar className="h-10 w-10 border-2 border-primary/50">
                                    <AvatarImage src={review?.image || review?.userImage} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                        {review?.name?.[0] || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex text-yellow-400 mb-1">
                                        {[...Array(5)].map((_, starI) => (
                                            <Star key={starI} className="w-3 h-3 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed italic">
                                        "{review?.comment || "Absolutely amazing experience! The team took care of everything."}"
                                    </p>
                                    <p className="text-xs font-bold mt-2 text-primary flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" />
                                        {review?.name || "Happy Traveler"}
                                    </p>
                                </div>
                            </div>
                        </Card>
                     ))}
                </div>
             )}
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/60 backdrop-blur-md py-6 z-20">
            <div className="w-full px-4 md:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-4 justify-center md:justify-start group">
                        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
                            <Star className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <div className="text-xl font-bold">10000+</div>
                            <div className="text-xs text-white/50 uppercase tracking-wider">Reviews</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 justify-center md:justify-start group">
                         <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <div className="text-xl font-bold">80000+</div>
                            <div className="text-xs text-white/50 uppercase tracking-wider">Satisfied Travelers</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 justify-center md:justify-start group">
                         <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
                            <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <div className="text-xl font-bold">50+</div>
                            <div className="text-xs text-white/50 uppercase tracking-wider">Destinations</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 justify-center md:justify-start group">
                         <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
                            <Wallet className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <div className="text-xl font-bold">9 Years+</div>
                            <div className="text-xs text-white/50 uppercase tracking-wider">Experience</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      {/* CSS for marquee animation and content fade-in */}
      <style jsx global>{`
        @keyframes vertical-scroll {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }
        .animate-vertical-scroll {
            animation: vertical-scroll 45s linear infinite;
        }
        .mask-vertical-fade {
            mask-image: linear-gradient(to bottom, transparent, black 5%, black 95%, transparent);
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
        }
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}</style>
    </section>
  );
}


function WhyChooseUsSection() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Reliable & Safe',
      description: 'Your safety is our priority. We partner with trusted guides and ensure secure bookings.'
    },
    {
      icon: Wallet,
      title: 'Best Price Guarantee',
      description: 'We offer competitive prices and will match any lower price you find for the same package.'
    },
    {
      icon: Headphones,
      title: '24/7 Customer Support',
      description: 'Our dedicated support team is available round the clock to assist you with any queries.'
    },
    {
      icon: Globe,
      title: 'Handpicked Destinations',
      description: 'Our travel experts carefully select the best destinations and experiences for you.'
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4">
         <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Why Choose Yatra Tales</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We go the extra mile to ensure your travel experience is seamless, safe, and unforgettable.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-background p-6 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all text-center group">
              <div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PopularDestinationsSection() {
    const { firestore } = useFirebase();
    
    // Fetch packages to aggregate destinations
    // We fetch a decent number to get a good distribution of locations
    const packagesQuery = useMemoFirebase(
      () =>
        firestore
          ? query(
              collection(firestore, 'travelPackages'),
              limit(50)
            )
          : null,
      [firestore]
    );

    const { data: packages, isLoading } = useCollection<TravelPackage>(packagesQuery);

    // Aggregate locations
    const destinations = useMemo(() => {
        if (!packages) return [];

        const locationStats: Record<string, { count: number, image: string }> = {};

        packages.forEach(pkg => {
            const loc = pkg.location;
            if (!locationStats[loc]) {
                // Try to find a good image
                let imageUrl = '/api/placeholder/400/600';
                if (pkg.imageUrls && pkg.imageUrls.length > 0) {
                    imageUrl = pkg.imageUrls[0];
                } else if (pkg.imageIds && pkg.imageIds.length > 0) {
                    const placeholder = getPlaceholder(pkg.imageIds[0]);
                    if (placeholder) imageUrl = placeholder.imageUrl;
                }

                locationStats[loc] = { count: 0, image: imageUrl };
            }
            locationStats[loc].count++;
        });

        return Object.entries(locationStats)
            .map(([name, stats]) => ({
                name,
                count: `${stats.count} Package${stats.count > 1 ? 's' : ''}`,
                imageUrl: stats.image
            }))
            .sort((a, b) => parseInt(b.count) - parseInt(a.count))
            .slice(0, 4);
    }, [packages]);

    if (isLoading) {
        return (
             <section className="py-16 lg:py-24 bg-background">
                <div className="container px-4">
                     <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-2">Popular Destinations</h2>
                            <p className="text-muted-foreground">Discover the most loved places by our travelers.</p>
                        </div>
                    </div>
    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                             <Skeleton key={i} className="h-80 w-full rounded-2xl" />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (destinations.length === 0) return null;

    return (
        <section className="py-16 lg:py-24 bg-background">
            <div className="container px-4">
                 <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-headline font-bold mb-2">Popular Destinations</h2>
                        <p className="text-muted-foreground">Discover the most loved places by our travelers.</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/packages">View All Destinations</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {destinations.map((dest, i) => (
                        <Link href={`/packages?search=${encodeURIComponent(dest.name)}`} key={i} className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer">
                            <Image
                                src={dest.imageUrl}
                                alt={dest.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{dest.name}</h3>
                                <p className="text-white/80 text-sm font-medium">{dest.count}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

function NewsletterSection() {
    return (
        <section className="py-16 bg-primary/5">
            <div className="container px-4">
                <div className="bg-primary rounded-3xl p-8 md:p-12 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
                     {/* Decorative circles */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
                    
                    <div className="relative z-10 max-w-xl text-primary-foreground">
                        <h2 className="text-3xl font-bold mb-4">Subscribe to our Newsletter</h2>
                        <p className="text-primary-foreground/80 text-lg">
                            Get exclusive travel deals, insider tips, and inspiration delivered straight to your inbox.
                        </p>
                    </div>
                    
                    <div className="relative z-10 w-full max-w-md">
                        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                            <Input 
                                type="email" 
                                placeholder="Enter your email address" 
                                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-offset-0 focus-visible:ring-white/50"
                            />
                            <Button size="lg" variant="secondary" className="h-12 px-8 font-semibold">
                                Subscribe
                            </Button>
                        </form>
                        <p className="text-xs text-primary-foreground/60 mt-3 text-center md:text-left">
                            By subscribing, you agree to our Privacy Policy and Terms of Service.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

function FeaturedPackagesSection() {
    const { firestore } = useFirebase();
    const [filter, setFilter] = useState<'all' | 'international' | 'domestic' | 'group'>('all');

    const featuredPackagesQuery = useMemoFirebase(
      () =>
        firestore
          ? query(
              collection(firestore, 'travelPackages'),
              where('featured', '==', true)
            )
          : null,
      [firestore]
    );
    const { data: allFeatured, isLoading } = useCollection<TravelPackage>(featuredPackagesQuery);

    const filteredPackages = allFeatured?.filter(pkg => {
        if (filter === 'all') return true;
        return pkg.packageType === filter;
    }) || [];

    // Limit to 6 after filter
    const displayPackages = filteredPackages.slice(0, 6);

    return (
        <section className="py-16 lg:py-24 bg-background">
            <div className="container">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold">Featured Packages</h2>
                    <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Explore our handpicked selection of featured travel packages, designed to give you an unforgettable experience.</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    <Button 
                        variant={filter === 'all' ? 'default' : 'outline'} 
                        onClick={() => setFilter('all')}
                        className="rounded-full"
                    >
                        All Packages
                    </Button>
                    <Button 
                        variant={filter === 'international' ? 'default' : 'outline'} 
                        onClick={() => setFilter('international')}
                         className="rounded-full"
                    >
                        International
                    </Button>
                    <Button 
                        variant={filter === 'domestic' ? 'default' : 'outline'} 
                        onClick={() => setFilter('domestic')}
                         className="rounded-full"
                    >
                        Domestic
                    </Button>
                    <Button 
                        variant={filter === 'group' ? 'default' : 'outline'} 
                        onClick={() => setFilter('group')}
                         className="rounded-full"
                    >
                        Group Tours
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <PackageCardSkeleton key={i} />)
                    ) : displayPackages.length > 0 ? (
                        displayPackages.map((pkg) => (
                            <PackageCard key={pkg.id} packageData={pkg} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No featured packages found for this category.
                        </div>
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
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simply the best and most relevant way to travel</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-12 w-24 mx-auto mb-2" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              ))}
            </div>
            
            {/* Testimonial Card Skeleton */}
            <div className="max-w-4xl mx-auto">
               <div className="bg-white/50 backdrop-blur-sm border-0 shadow-lg rounded-xl p-8 md:p-12">
                  <div className="flex justify-center mb-6 gap-1">
                      {Array.from({ length: 5 }).map((_,i) => <Skeleton key={i} className="w-6 h-6 rounded-full" />)}
                  </div>
                  <Skeleton className="h-24 w-full mb-8" />
                  <div className="flex flex-col items-center gap-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                  </div>
               </div>
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
      <LeadPopup />
      <HeroSection />
      <FeaturedPackagesSection />
      <WhyChooseUsSection />
      <PopularDestinationsSection />
      <TestimonialsSection />
      <BlogPreviewSection />
      <NewsletterSection />
    </>
  );
}
