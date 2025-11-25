import type { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export interface Rate {
  pax: number; // e.g. 2, 4, 6, 8
  price: number;
}

export interface PricingTier {
  stars: number; // e.g. 3, 4, 5
  rates: Rate[];
}

export interface HotelOption {
  stars: number;
  hotels: string[];
}

export interface ItinerarySummaryItem {
  nights: number;
  location: string;
}

export interface TravelPackage {
  id: string;
  title: string;
  location: string;
  duration: string; // e.g., "7 Days / 6 Nights"
  description: string;
  packageType?: 'international' | 'domestic';
  imageIds: string[];
  imageUrls: string[];
  itinerary: string;
  inclusions: string[];
  exclusions: string[];
  transfers?: string[];
  terms?: string;
  validity?: string;
  featured?: boolean;
  pricing: PricingTier[];
  hotelOptions: HotelOption[];
  itinerarySummary?: ItinerarySummaryItem[];
}

export interface Booking {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  packageId: string;
  packageName: string;
  travellers: number;
  bookingDate: Timestamp;
  total: number;
  addons?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  image: string;
  rating: number;
  comment: string;
  packageId: string;
  status: 'Pending' | 'Approved';
  createdAt: Timestamp;
  imageId?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  imageId: string;
  content: string;
  publishDate: string; // ISO string
  author: string;
}

export interface AppUser extends FirebaseUser { }



