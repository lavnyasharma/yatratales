'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel"
import {
  Users,
  BedDouble,
  Car,
  Calendar,
  CheckCircle,
  XCircle,
  Star,
  ChevronDown,
} from 'lucide-react';
import { useFirebase, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { TravelPackage, HotelOption, PricingTier, Testimonial } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BookingDialog from './BookingDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { use, useState } from 'react';

const getPlaceholder = (id: string) => PlaceHolderImages.find((p) => p.id === id);

function TourPlanSection({ itinerary }: { itinerary?: string }) {
    const [expandedDay, setExpandedDay] = useState<number | null>(null);
    
    if (!itinerary) return null;
    
    const days = itinerary.split('\n').filter(line => line.trim());
    
    const toggleDay = (dayIndex: number) => {
        setExpandedDay(expandedDay === dayIndex ? null : dayIndex);
    };
    
    return (
        <section>
            <h2 className="text-2xl font-bold mb-6 text-primary">Tour Plan</h2>
            <div className="space-y-4">
                {days.map((day, index) => {
                    const isExpanded = expandedDay === index;
                    const dayTitle = day.length > 50 ? day.substring(0, 50) + '...' : day;
                    
                    return (
                        <div key={index} className="border rounded-lg overflow-hidden">
                            <button 
                                className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                                onClick={() => toggleDay(index)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="font-medium">Day {index + 1}</span>
                                    <span className="text-primary font-medium">{dayTitle}</span>
                                </div>
                                <ChevronDown 
                                    className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                                        isExpanded ? 'rotate-180' : ''
                                    }`} 
                                />
                            </button>
                            
                            {isExpanded && (
                                <div className="px-4 pb-4 border-t bg-muted/20">
                                    <div className="pt-4 text-sm text-muted-foreground whitespace-pre-line">
                                        {day}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}


function HeroSection({ travelPackage }: { travelPackage: TravelPackage }) {
    const { title, duration, location, imageIds, imageUrls, pricing } = travelPackage;
    
    // Use imageUrls if available, otherwise fallback to imageIds
    let images = [];
    if (imageUrls && imageUrls.length > 0) {
        images = imageUrls.map(url => ({
            id: '',
            description: '',
            imageUrl: url,
            imageHint: ''
        }));
    } else {
        images = (imageIds || []).map(id => getPlaceholder(id)).filter(Boolean);
    }
    
    // Get minimum price
    const minPrice = pricing?.[0]?.rates?.[0]?.price || 0;
    const maxPeople = Math.max(...(pricing?.[0]?.rates?.map(r => r.pax) || [2]));

    return (
        <section className="bg-background pt-8 pb-8">
            <div className="container">
                {/* Title and Location */}
                <div className="mb-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{title}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {location}
                    </div>
                </div>

                {/* Image Carousel */}
                <div className="mb-8">
                    {images.length > 1 ? (
                        <Carousel className="w-full">
                            <CarouselContent>
                                {images.map((image, index) => (
                                    <CarouselItem key={index}>
                                        <div className="aspect-[16/9] relative overflow-hidden rounded-lg">
                                            {image && <Image src={image.imageUrl} alt={image.description} fill className="object-cover" data-ai-hint={image.imageHint} />}
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-4" />
                            <CarouselNext className="right-4"/>
                        </Carousel>
                    ) : (
                         <div className="aspect-[16/9] relative overflow-hidden rounded-lg">
                            {images[0] && <Image src={images[0].imageUrl} alt={images[0].description} fill className="object-cover" data-ai-hint={images[0].imageHint} />}
                        </div>
                    )}
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Price</div>
                            <div className="font-semibold text-primary">From ₹{minPrice.toLocaleString('en-IN')}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Duration</div>
                            <div className="font-semibold">{duration}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Max People</div>
                            <div className="font-semibold">{maxPeople}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Min Age</div>
                            <div className="font-semibold">12+</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Tour Type</div>
                            <div className="font-semibold text-sm">Adventure, Nature</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function PricingTable({ pricing }: { pricing?: PricingTier[] }) {
    if (!pricing || pricing.length === 0) return null;
    
    const paxOptions = pricing[0]?.rates.map(r => r.pax) || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Users className="h-5 w-5" />
                    Pricing
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px] font-medium">Travelers</TableHead>
                                {pricing.map(tier => (
                                    <TableHead key={tier.stars} className="text-center font-medium">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(tier.stars)].map((_, i) => (
                                                    <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                                                ))}
                                            </div>
                                            <span className="text-sm">{tier.stars} Star</span>
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paxOptions.map((pax) => (
                                <TableRow key={pax}>
                                    <TableCell className="font-medium">{pax} Pax</TableCell>
                                    {pricing.map(tier => {
                                        const rate = tier.rates.find(r => r.pax === pax);
                                        return (
                                            <TableCell key={tier.stars} className="text-center">
                                                <div className="font-semibold text-lg">
                                                    ₹{rate ? rate.price.toLocaleString('en-IN') : 'N/A'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">per person</div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="border-t p-4">
                    <p className="text-xs text-muted-foreground text-center">
                        * Peak season supplement may apply
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}


function HotelOptions({ hotelOptions }: { hotelOptions?: HotelOption[] }) {
    if (!hotelOptions || hotelOptions.length === 0) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <BedDouble className="h-5 w-5"/>
                    Accommodation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {hotelOptions.map(option => (
                    <div key={option.stars} className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                                {[...Array(option.stars)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                                ))}
                            </div>
                            <h3 className="font-semibold">{option.stars} Star Hotels</h3>
                        </div>
                        <ul className="space-y-1 ml-6">
                            {option.hotels.map((hotel, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                    • {hotel}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

function TestimonialsSection({ packageId }: { packageId: string }) {
    const { firestore } = useFirebase();
  
    const testimonialsQuery = useMemoFirebase(
      () =>
        firestore
          ? query(
              collection(firestore, 'testimonials'),
              where('packageId', '==', packageId),
              where('status', '==', 'Approved')
            )
          : null,
      [firestore, packageId]
    );
    const { data: testimonials, isLoading } = useCollection<Testimonial>(testimonialsQuery);
  
    if (isLoading) return (
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-8">Reviews</h2>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </section>
    );
    if (!testimonials || testimonials.length === 0) return null;
  
    const averageRating = testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length;
    const totalReviews = testimonials.length;
    
    return (
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-8">Reviews</h2>
        
        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-primary mb-2">{averageRating.toFixed(2)}</div>
            <div className="text-lg font-medium mb-2">Wonderful</div>
            <div className="text-sm text-muted-foreground">{totalReviews} verified reviews</div>
          </div>
          
          <div className="space-y-3">
            {['Location', 'Amenities', 'Services', 'Price', 'Rooms'].map((category, index) => {
              const rating = (4.2 + Math.random() * 0.8).toFixed(1);
              return (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${(parseFloat(rating) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{rating}/5</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground mb-6">
          Showing {Math.min(6, totalReviews)}-{Math.min(8, totalReviews)} of {totalReviews} comments
        </div>
        
        {/* Reviews List */}
        <div className="space-y-6">
          {testimonials.slice(0, 3).map((testimonial) => {
            const img = getPlaceholder(testimonial.imageId || 'testimonial-1');
            return (
              <div key={testimonial.id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.image || img?.imageUrl} alt={testimonial.name} data-ai-hint={img?.imageHint} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <span className="text-sm text-muted-foreground">27 Nov, 2020</span>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-4 mb-3">
                      {['Location', 'Amenities', 'Services', 'Price', 'Rooms'].map((category) => (
                        <div key={category} className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">{category}</div>
                          <div className="flex justify-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < testimonial.rating ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{testimonial.comment}</p>
                    
                    <button className="text-sm text-muted-foreground hover:text-foreground mt-2">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

function PackageDetailSkeleton() {
    return (
        <div className="bg-background">
            {/* Hero Skeleton */}
            <div className="relative bg-muted/40 pt-12 pb-8 overflow-hidden">
                <div className="container relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="relative h-80 md:h-[450px]">
                           <Skeleton className="absolute bottom-0 left-0 w-[70%] h-[70%] rounded-lg" />
                           <Skeleton className="absolute top-0 right-0 w-[70%] h-[70%] rounded-lg" />
                        </div>
                        <div className="space-y-4 text-center md:text-left">
                            <Skeleton className="h-6 w-32 mx-auto md:mx-0" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-8 w-1/2 mx-auto md:mx-0" />
                            <Skeleton className="h-24 max-w-sm mx-auto md:mx-0" />
                        </div>
                    </div>
                </div>
            </div>
             {/* Content Skeleton */}
            <div className="container py-8 md:py-12 space-y-8">
                 <Skeleton className="h-6 w-1/2" />
                 <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     <Card><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
                     <Card><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
                     <Card><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
                 </div>
                 <Card><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
                 <Card><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
                 <div className="text-center pt-8">
                    <Skeleton className="h-14 w-48 mx-auto" />
                </div>
            </div>
        </div>
    )
}

export default function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { firestore } = useFirebase();
  
    const packageRef = useMemoFirebase(() => {
      if (!firestore || !id) return null;
      return doc(firestore, 'travelPackages', id);
    }, [firestore, id]);
  
    const { data: packageData, isLoading } = useDoc<TravelPackage>(packageRef);
  
    if (isLoading) {
      return <PackageDetailSkeleton />;
    }
  
    if (!packageData) {
      return <div>Package not found.</div>;
    }
  
    const { title, inclusions, exclusions, terms, validity, transfers, itinerary } = packageData;
  
    return (
        <div className="bg-background">
            <HeroSection travelPackage={packageData} />
            <div className="container py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Overview Section */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Overview</h2>
                            <div className="prose max-w-none text-muted-foreground mb-6">
                                <p>{packageData.description}</p>
                            </div>
                            
                            {/* Season and Departure Info */}
                            <div className="space-y-4">
                                <div>
                                    <span className="font-semibold">Season:</span> {validity || 'Year Round'}
                                </div>
                                <div>
                                    <span className="font-semibold">Departure Locations & Days:</span>
                                    <ul className="mt-2 space-y-1 ml-4">
                                        {(packageData.itinerarySummary || []).map((item: any, index: number) => (
                                            <li key={index} className="text-muted-foreground">
                                                • {item.location} - {item.nights} nights
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Included/Excluded Section */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Included/Excluded</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    {(inclusions || []).map((item, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-3">
                                    {(exclusions || []).map((item, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Tour Plan Section */}
                        <TourPlanSection itinerary={itinerary} />

                        <TestimonialsSection packageId={id} />
                        
                        {/* Leave a Reply Section */}
                        <section className="py-8">
                            <h2 className="text-2xl font-bold mb-6">Leave a Reply</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Your email address will not be published. Required fields are marked *
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <input 
                                    type="text" 
                                    placeholder="Your Name *" 
                                    className="p-3 border rounded-lg text-sm"
                                />
                                <input 
                                    type="email" 
                                    placeholder="Email Address *" 
                                    className="p-3 border rounded-lg text-sm"
                                />
                                <input 
                                    type="url" 
                                    placeholder="Your Website" 
                                    className="p-3 border rounded-lg text-sm"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <textarea 
                                    placeholder="Comment" 
                                    rows={6}
                                    className="p-3 border rounded-lg text-sm resize-none"
                                />
                                
                                <div className="space-y-4">
                                    {['Location', 'Amenities', 'Services', 'Price', 'Rooms'].map((category) => (
                                        <div key={category} className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{category}</span>
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="h-4 w-4 text-muted-foreground hover:text-yellow-500 cursor-pointer" />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-6 mb-4">
                                <input type="checkbox" id="save-info" className="rounded" />
                                <label htmlFor="save-info" className="text-sm text-muted-foreground">
                                    Save my name, email, and website in this browser for the next time I comment.
                                </label>
                            </div>
                            
                            <Button className="bg-primary hover:bg-primary/90 text-white px-8">
                                Post Comment
                            </Button>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <Card className="border-2 border-primary/20">
                                <CardHeader className="border-b border-primary/20">
                                    <CardTitle className="text-xl text-primary">Book This Tour</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium">From:</label>
                                            <div className="mt-1 p-3 border rounded-lg flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                <span className="text-sm text-muted-foreground">Select date</span>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium">Time:</label>
                                            <div className="mt-1 p-3 border rounded-lg">
                                                <span className="text-sm text-muted-foreground">Select time</span>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium">Tickets:</label>
                                            <div className="mt-1 p-3 border rounded-lg">
                                                <span className="text-sm text-muted-foreground">Please select date first</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t pt-4">
                                        <h4 className="font-medium mb-3">Add Extra</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Service per booking</span>
                                                <span className="text-sm font-medium">₹30.00</span>
                                            </div>
                                            <div className="text-sm font-medium">Service per person</div>
                                            <div className="flex justify-between text-sm">
                                                <span>Adult: ₹17.00</span>
                                                <span>Youth: ₹14.00</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="font-medium">Total:</span>
                                            <span className="text-lg font-bold">₹{(packageData.pricing?.[0]?.rates?.[0]?.price || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                        <BookingDialog packageId={id} packageName={packageData.title}>
                                            <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3">
                                                Book Now
                                            </Button>
                                        </BookingDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
      </div>
    );
  }
    

    
