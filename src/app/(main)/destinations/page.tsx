import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const getPlaceholder = (id: string) => PlaceHolderImages.find(p => p.id === id);

const destinations = [
    { id: '1', name: 'Paris', country: 'France', imageId: 'destination-paris', description: 'The city of love, lights, and endless art.' },
    { id: '2', name: 'Rome', country: 'Italy', imageId: 'destination-rome', description: 'Ancient history and vibrant street life collide.' },
    { id: '3', name: 'New York', country: 'USA', imageId: 'destination-ny', description: 'The city that never sleeps, full of energy.' },
    { id: '4', name: 'Kyoto', country: 'Japan', imageId: 'package-kyoto', description: 'Serene temples and beautiful traditional gardens.' },
    { id: '5', name: 'Santorini', country: 'Greece', imageId: 'package-santorini', description: 'Iconic white and blue villages on volcanic cliffs.' },
    { id: '6', name: 'Swiss Alps', country: 'Switzerland', imageId: 'package-alps', description: 'Majestic peaks and breathtaking alpine scenery.' },
];

export default function DestinationsPage() {
  return (
    <div className="container py-12">
        <Breadcrumb className="mb-8">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Destinations</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Our Destinations</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          From bustling cities to tranquil landscapes, discover the perfect place for your next adventure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {destinations.map(dest => {
            const img = getPlaceholder(dest.imageId);
            return (
                <Link href="#" key={dest.id} className="group relative block overflow-hidden rounded-lg shadow-lg">
                    <Image 
                        src={img?.imageUrl || ''} 
                        alt={dest.name} 
                        width={600} 
                        height={800} 
                        className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-105" 
                        data-ai-hint={img?.imageHint} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                        <p className="text-sm text-white/80 font-medium">{dest.country}</p>
                        <h3 className="text-3xl font-bold text-white font-headline">{dest.name}</h3>
                        <p className="text-white/90 mt-2 max-w-xs">{dest.description}</p>
                    </div>
                </Link>
            )
        })}
      </div>
    </div>
  );
}
