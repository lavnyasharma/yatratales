import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
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

    return (
        <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group rounded-lg">
            <div className="relative overflow-hidden h-56 bg-muted">
                <Link href={`/packages/${id}`}>
                    {image?.imageUrl ? (
                        <Image
                            src={image.imageUrl}
                            alt={title || 'Travel Package'}
                            width={600}
                            height={400}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            data-ai-hint={image.imageHint}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No image
                        </div>
                    )}
                </Link>
                {location && (
                    <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        {location}
                    </div>
                )}
            </div>
            <CardHeader className="p-4">
                <CardTitle className="font-headline text-xl h-14 group-hover:text-primary transition-colors">
                    <Link href={`/packages/${id}`}>{title}</Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-grow space-y-2">
                {duration && (
                    <div className="flex items-center text-muted-foreground text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span>{duration}</span>
                    </div>
                )}
                <p className="text-sm text-muted-foreground flex-grow line-clamp-2">{description}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-secondary/30 p-4">
                <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">From</span>
                    <span className="text-xl font-bold text-primary">₹{minPrice?.toLocaleString('en-IN')}</span>
                </div>
                <Button asChild>
                    <Link href={`/packages/${id}`}>Details</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
