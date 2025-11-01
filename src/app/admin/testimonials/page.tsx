
import Image from 'next/image';
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Check, MoreHorizontal, Star, Trash, X } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const getPlaceholder = (id: string) => PlaceHolderImages.find(p => p.id === id);

// Mock Data
const mockReviews = [
  { id: '1', name: 'Alice Johnson', imageId: 'testimonial-1', rating: 5, comment: 'An unforgettable experience! The entire trip was seamless and well-organized. Wanderlust Explorer is the best.', status: 'Approved', package: 'Spectacular Swiss Alps' },
  { id: '2', name: 'David Smith', imageId: 'testimonial-2', rating: 5, comment: 'I had the time of my life. The destinations were stunning and the guides were fantastic. Highly recommended!', status: 'Approved', package: 'Spectacular Swiss Alps' },
  { id: '3', name: 'Jane Doe', imageId: 'avatar-placeholder', rating: 4, comment: 'Great trip overall, but one of the hotel check-ins was a bit slow. Otherwise, fantastic.', status: 'Pending', package: 'Sunsets in Santorini' },
];

export default function ReviewsAdminPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>Manage customer feedback and reviews for your packages.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Author</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Package</TableHead>
              <TableHead className="text-center">Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockReviews.map((review) => {
              const image = getPlaceholder(review.imageId);
              return (
              <TableRow key={review.id} className={review.status === 'Pending' ? 'bg-secondary/50' : ''}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={image?.imageUrl} alt={review.name} data-ai-hint={image?.imageHint} />
                      <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{review.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-sm">
                    <p className="line-clamp-2">{review.comment}</p>
                </TableCell>
                 <TableCell className="text-muted-foreground">{review.package}</TableCell>
                <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                        {review.rating} <Star className="ml-1 h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                </TableCell>
                <TableCell>
                  <Badge variant={review.status === 'Approved' ? "default" : "secondary"}>
                    {review.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {review.status === 'Pending' && (
                        <DropdownMenuItem>
                            <Check className="mr-2 h-4 w-4 text-green-500"/> Approve
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4"/> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

    