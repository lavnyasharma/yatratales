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
} from 'lucide-react';
import { useFirebase, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { TravelPackage, HotelOption, PricingTier, Testimonial } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BookingDialog from './BookingDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { use } from 'react';

const getPlaceholder = (id: string) => PlaceHolderImages.find((p) => p.id === id);


function HeroSection({ travelPackage }: { travelPackage: TravelPackage }) {
    const { title, duration, location, imageIds } = travelPackage;
    const images = (imageIds || []).map(id => getPlaceholder(id)).filter(Boolean);
    const bgImage = getPlaceholder(imageIds?.[2] || 'package-kerala-bg');

    return (
        <section className="relative bg-secondary/30 pt-12 pb-8 overflow-hidden">
            {bgImage && (
                 <Image
                    src={bgImage.imageUrl}
                    alt="Background scenery"
                    fill
                    className="object-cover opacity-20"
                    data-ai-hint={bgImage.imageHint}
                />
            )}
            <div className="container relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                   <div className="relative h-80 md:h-[450px] flex items-center justify-center">
                        {images.length > 1 ? (
                            <Carousel className="w-full max-w-md mx-auto">
                                <CarouselContent>
                                    {images.map((image, index) => (
                                        <CarouselItem key={index}>
                                            <div className="p-1">
                                                <Card className="overflow-hidden shadow-2xl">
                                                    <CardContent className="relative flex aspect-square items-center justify-center p-0">
                                                        {image && <Image src={image.imageUrl} alt={image.description} fill className="object-cover" data-ai-hint={image.imageHint} />}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-2" />
                                <CarouselNext className="right-2"/>
                            </Carousel>
                        ) : (
                             <div className="w-[80%] h-[80%] rounded-lg overflow-hidden shadow-2xl relative">
                                {images[0] && <Image src={images[0].imageUrl} alt={images[0].description} fill className="object-cover" data-ai-hint={images[0].imageHint} />}
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-lg font-medium text-primary">{duration}</p>
                        <h1 className="text-5xl md:text-7xl font-bold font-headline leading-none text-foreground my-2">{title}</h1>
                        <p className="text-2xl font-semibold text-muted-foreground">The Essence of {location}</p>
                        <div className="mt-6 bg-background/90 border rounded-lg p-4 space-y-2 max-w-sm mx-auto md:mx-0">
                            {(travelPackage.itinerarySummary || []).map((item, index) => (
                                <div key={index} className="flex items-center justify-between font-bold">
                                    <span>{item.nights} NIGHTS</span>
                                    <span className="text-primary">{item.location}</span>
                                </div>
                            ))}
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
                <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Pricing per Person</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]"></TableHead>
                                {pricing.map(tier => (
                                    <TableHead key={tier.stars} className="text-center font-bold">{tier.stars} Star</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paxOptions.map((pax) => (
                                <TableRow key={pax}>
                                    <TableCell className="font-semibold text-muted-foreground">{pax} Pax</TableCell>
                                    {pricing.map(tier => {
                                        const rate = tier.rates.find(r => r.pax === pax);
                                        return (
                                            <TableCell key={tier.stars} className="text-center font-bold text-lg text-foreground">
                                                ₹{rate ? rate.price.toLocaleString('en-IN') : 'N/A'}/-
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">T&C: Peak season supplement apply.</p>
            </CardContent>
        </Card>
    );
}


function HotelOptions({ hotelOptions }: { hotelOptions?: HotelOption[] }) {
    if (!hotelOptions || hotelOptions.length === 0) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BedDouble className="text-primary"/> Hotel Options</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {hotelOptions.map(option => (
                        <div key={option.stars}>
                            <h3 className="font-bold text-lg mb-2">{option.stars} STAR HOTELS</h3>
                            <ul className="space-y-1 text-muted-foreground">
                                {option.hotels.map((hotel, index) => (
                                    <li key={index} className="text-sm">{hotel}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
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
        <h2 className="text-3xl font-headline font-bold text-center mb-8">What Our Travelers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="overflow-hidden bg-secondary/50 border-none shadow-lg">
                <CardContent className="p-8 text-center flex flex-col items-center">
                    <Skeleton className="h-20 w-20 rounded-full mb-4" />
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-5 w-32 mb-4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
          ))}
        </div>
      </section>
    );
    if (!testimonials || testimonials.length === 0) return null;
  
    return (
      <section className="py-8">
        <h2 className="text-3xl font-headline font-bold text-center mb-8">What Our Travelers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial) => {
            const img = getPlaceholder(testimonial.imageId || 'testimonial-1');
            return (
              <Card key={testimonial.id} className="overflow-hidden bg-secondary/50 border-none shadow-lg">
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

export default function PackageDetailPage({ params }: { params: { id: string } }) {
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
            <div className="container py-8 md:py-12 space-y-8">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink href="/packages">All Packages</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>{title}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
          
                <PricingTable pricing={packageData.pricing} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Full Itinerary</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                            {itinerary}
                        </CardContent>
                    </Card>
                    <div className="space-y-8">
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><CheckCircle className="text-green-500" /> Inclusions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-muted-foreground">
                                {(inclusions || []).map((item, index) => <p key={index}>{item}</p>)}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><XCircle className="text-destructive" /> Exclusions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-muted-foreground">
                                {(exclusions || []).map((item, index) => <p key={index}>{item}</p>)}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <HotelOptions hotelOptions={packageData.hotelOptions} />
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Car className="text-primary"/> Transfers</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-muted-foreground">
                            {(transfers || []).map((item, index) => <p key={index}>{item}</p>)}
                        </CardContent>
                    </Card>
                </div>
                
                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2"><Calendar className="text-primary" /> Validity & Terms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {validity && <p><span className="font-semibold">Validity:</span> {validity}</p>}
                        {terms && <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Terms:</span> {terms}</p>}
                    </CardContent>
                </Card>

                <TestimonialsSection packageId={id} />


                 <div className="text-center pt-8">
                    <BookingDialog packageId={id} packageName={packageData.title}>
                        <Button size="lg" className="text-xl h-14 px-12">Book This Tour</Button>
                    </BookingDialog>
                </div>
            </div>
      </div>
    );
  }
    

    
