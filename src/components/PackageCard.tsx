import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Heart, MapPin, Star, Users } from 'lucide-react';
import type { TravelPackage } from '@/lib/types';

const getPlaceholder = (id: string) => PlaceHolderImages.find(p => p.id === id);

type PackageCardProps = {
    packageData: Partial<TravelPackage> & { id: string }
}

export default function PackageCard({ packageData }: PackageCardProps) {
    const { id, title, location, duration, pricing, imageIds, imageUrls, description } = packageData;
    
    // Use imageUrls if available, otherwise fallback to imageIds
    let image = null;
    if (imageUrls && imageUrls.length > 0) {
        image = {
            id: '',
            description: '',
            imageUrl: imageUrls[0],
            imageHint: ''
        };
    } else {
        image = getPlaceholder(imageIds?.[0] || 'package-alps');
    }

    const minPrice = pricing?.[0]?.rates?.[0]?.price || 0;
    const maxPeople = Math.max(...(pricing?.[0]?.rates?.map(r => r.pax) || [2]));
    
    // Extract days from duration (e.g., "7 Days / 6 Nights" -> "7 days")
    const days = duration?.match(/\d+/)
        ? `${duration.match(/\d+/)?.[0]} days`
        : duration;

    return (
        <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group rounded-2xl border-0">
            <div className="relative overflow-hidden h-64 bg-muted">
                <Link href={`/packages/${id}`}>
                    {image?.imageUrl ? (
                        <Image
                            src={image.imageUrl}
                            alt={title || 'Travel Package'}
                            width={600}
                            height={400}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            data-ai-hint={image.imageHint}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No image
                        </div>
                    )}
                </Link>
                
                {/* Heart Icon */}
                <button className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors group/heart">
                    <Heart className="w-4 h-4 text-muted-foreground group-hover/heart:text-red-500 transition-colors" />
                </button>
                
                {/* Duration and People Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                    {days && (
                        <div className="bg-white/90 backdrop-blur-sm text-foreground px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {days}
                        </div>
                    )}
                    <div className="bg-white/90 backdrop-blur-sm text-foreground px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {maxPeople}
                    </div>
                </div>
                
                {/* Star Rating */}
                <div className="absolute bottom-4 left-4 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                </div>
            </div>
            
            <div className="p-4 flex-grow">
                <div className="mb-3">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        <Link href={`/packages/${id}`}>{title}</Link>
                    </h3>
                    
                    {location && (
                        <div className="flex items-center text-muted-foreground text-sm">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>{location}</span>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-muted-foreground">From</div>
                        <div className="text-xl font-bold text-primary">₹{minPrice?.toLocaleString('en-IN')}</div>
                    </div>
                    
                    <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6">
                        <Link href={`/packages/${id}`}>Explore</Link>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
