"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_TESTIMONIALS = [
  {
    id: "1",
    name: "Lavanya",
    location: "World Traveler",
    comment: "The trip was absolutely seamless. I loved every moment of the Spiti valley trek!",
    image: null,
    rating: 5,
  },
  {
    id: "2",
    name: "Rahul Sharma",
    location: "Explorer",
    comment: "The journey was breathtaking. Every moment felt curated just for us.",
    image: null,
    rating: 5,
  },
  {
    id: "3",
    name: "Priya M",
    location: "Cyclist",
    comment: "Yatra Tales made my solo trip safe and incredibly fun. Highly recommend!",
    image: null,
    rating: 4,
  },
  {
    id: "4",
    name: "Vikram Singh",
    location: "Photographer",
    comment: "The landscapes we visited were dreamy. Perfect guidance by the team.",
    image: null,
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const { firestore } = useFirebase();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const testimonialsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, "testimonials"),
            where("status", "==", "Approved"),
            limit(10)
          )
        : null,
    [firestore]
  );
  const { data: testimonialsData, isLoading } = useCollection(testimonialsQuery);

  const testimonials = (testimonialsData && testimonialsData.length > 0) ? testimonialsData : PLACEHOLDER_TESTIMONIALS;

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <section className="relative py-20 lg:py-28 bg-[#FFFCF8] overflow-hidden">
      <div className="container relative px-4 md:px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-headline font-bold text-gray-900 mb-4">
                    Stories from the Road
                </h2>
                <p className="text-lg text-gray-500">
                    See what our travelers have to say about their unforgettable journeys with us.
                </p>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
                <button 
                    onClick={() => api?.scrollPrev()}
                    className="w-12 h-12 rounded-full border border-gray-200 bg-white hover:bg-[#F27A54] hover:text-white hover:border-[#F27A54] transition-all flex items-center justify-center"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => api?.scrollNext()}
                    className="w-12 h-12 rounded-full border border-gray-200 bg-white hover:bg-[#F27A54] hover:text-white hover:border-[#F27A54] transition-all flex items-center justify-center"
                >
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="relative">
          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[1,2,3].map(i => (
                     <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
                 ))}
             </div>
          ) : (
            <Carousel setApi={setApi} className="w-full" opts={{ align: "start", loop: true }}>
              <CarouselContent className="-ml-4 md:-ml-6">
                {testimonials.map((t: any, index: number) => (
                  <CarouselItem key={index} className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow bg-white rounded-3xl overflow-hidden p-6 md:p-8 flex flex-col justify-between">
                        <div>
                            {/* Stars */}
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        className={cn(
                                            "w-4 h-4", 
                                            i < (t.rating || 5) ? "fill-[#F27A54] text-[#F27A54]" : "fill-gray-100 text-gray-100"
                                        )} 
                                    />
                                ))}
                            </div>

                            {/* Comment */}
                            <blockquote className="text-lg text-gray-700 leading-relaxed mb-8 font-medium">
                                "{t.comment}"
                            </blockquote>
                        </div>

                        {/* Author */}
                        <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                            <Avatar className="w-12 h-12 border border-gray-100">
                                <AvatarImage src={t.image || t.userImage} alt={t.name} />
                                <AvatarFallback className="bg-[#FDF0E9] text-[#F27A54] font-bold">
                                    {t.name?.[0] || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-bold text-gray-900">{t.name}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {t.location || "Traveler"}
                                </div>
                            </div>
                        </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Mobile Navigation */}
              <div className="flex md:hidden items-center justify-center gap-4 mt-8">
                 <button onClick={() => api?.scrollPrev()} className="p-2 rounded-full border bg-white"><ArrowLeft className="w-5 h-5" /></button>
                 <button onClick={() => api?.scrollNext()} className="p-2 rounded-full border bg-white"><ArrowRight className="w-5 h-5" /></button>
              </div>

            </Carousel>
          )}
        </div>

      </div>
    </section>
  );
}
