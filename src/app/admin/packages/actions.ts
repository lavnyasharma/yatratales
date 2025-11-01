'use server'

import { enhancePackageItinerary, type PackageItineraryEnhancementInput, type PackageItineraryEnhancementOutput } from '@/ai/flows/package-itinerary-enhancement'
import { collection, writeBatch, getDocs, doc } from "firebase/firestore";
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '@/lib/firebase/config';

// Mock data to seed the database
const travelPackages = [
    { 
      id: 'green-triangle-kerala', 
      title: 'The Green Triangle', 
      location: 'Kerala', 
      duration: '4 Nights • 5 Days',
      description: 'Experience the essence of Kerala, from lush tea plantations in Munnar to the serene backwaters of Alleppey.', 
      featured: true, 
      imageIds: ['package-kerala-1', 'package-kerala-2', 'package-kerala-bg'],
      itinerarySummary: [
          { nights: 2, location: 'Munnar' },
          { nights: 1, location: 'Thekkady' },
          { nights: 1, location: 'Alleppey' },
      ],
      pricing: [
          { stars: 3, rates: [{ pax: 2, price: 13700 }, { pax: 4, price: 11500 }, { pax: 6, price: 11200 }, { pax: 8, price: 10300 }] },
          { stars: 4, rates: [{ pax: 2, price: 16000 }, { pax: 4, price: 14000 }, { pax: 6, price: 13500 }, { pax: 8, price: 12600 }] },
          { stars: 5, rates: [{ pax: 2, price: 21000 }, { pax: 4, price: 18750 }, { pax: 6, price: 18450 }, { pax: 8, price: 17500 }] },
      ],
      hotelOptions: [
          { stars: 3, hotels: ["2 N Arbour Resort or Similar", "1N Jungle Park or Similar", "1 N Venice Iva Residency or Similar"] },
          { stars: 4, hotels: ["2 N Southern Panorama or Similar", "1N Holiday vista or Similar", "1 N PMC Lakeshore or Similar"] },
          { stars: 5, hotels: ["2 N Fogg Resort or Similar", "1N Serene Horizen or Similar", "1 N Ramada by Wyndham or Similar"] },
      ],
      inclusions: ["Entry: Cochin", "Exit: Cochin", "Breakfast in all places"],
      exclusions: ["Train / Air fare NOT included"],
      transfers: ["Sedan car for 2 pax", "Innova car for 4 pax", "Traveller for 06 pax & Above"],
      validity: "01 October 2025 - 31 March 2026",
      terms: "Peak season supplement apply.",
      itinerary: "Day 1: Arrival in Cochin, transfer to Munnar. Check in and relax.\nDay 2: Munnar sightseeing, visit tea gardens and Mattupetty Dam.\nDay 3: Travel to Thekkady, visit Periyar National Park.\nDay 4: Travel to Alleppey, enjoy a houseboat cruise.\nDay 5: After breakfast, transfer to Cochin for departure."
    },
    { id: 'swiss-alps', title: 'Spectacular Swiss Alps', location: 'Switzerland', duration: '7 Days', price: 2500, imageIds: ['package-alps', 'destination-ny', 'destination-paris'], description: 'Experience the breathtaking beauty of the Swiss Alps with our guided tour.', featured: true, itinerary: "Day 1: Arrival in Zurich\nDay 2: Explore Lucerne\nDay 3: Journey to Interlaken\nDay 4: Jungfrau Excursion\nDay 5: Grindelwald Adventures\nDay 6: Return to Zurich\nDay 7: Departure", inclusions: ["Accommodation", "Breakfast", "Guided Tours"], exclusions: ["Flights", "Lunch", "Dinner", "Visa"] },
];

const blogPosts = [
    { 
        id: '1',
        title: '10 Must-Visit Places in Japan for First-Timers', 
        excerpt: 'Japan is a country of ancient traditions and futuristic technology. Here are 10 spots you can\'t miss on your first trip.',
        content: 'From the bustling streets of Tokyo to the serene temples of Kyoto, Japan offers a unique experience for every traveler. Don\'t forget to try the local cuisine!',
        author: 'Alice Johnson',
        status: 'Published',
        publishDate: '2024-05-10T10:00:00Z',
        imageId: 'blog-2'
    },
    {
        id: '2',
        title: 'A Food Lover\'s Guide to Italy',
        excerpt: 'Explore the rich culinary traditions of Italy, from fresh pasta in Rome to pizza in Naples.',
        content: 'Italian food is loved worldwide, but experiencing it in its homeland is another story. This guide will take you on a delicious journey through Italy\'s most iconic dishes.',
        author: 'David Smith',
        status: 'Published',
        publishDate: '2024-05-15T14:30:00Z',
        imageId: 'destination-rome'
    },
    {
        id: '3',
        title: 'Budget Travel: How to Explore Europe Without Breaking the Bank',
        excerpt: 'Dreaming of a European adventure but worried about the cost? Here are our top tips for budget-friendly travel.',
        content: 'Traveling through Europe can be affordable if you plan wisely. From staying in hostels to eating like a local, we share our secrets to save money while having the time of your life.',
        author: 'Emily White',
        status: 'Draft',
        publishDate: null,
        imageId: 'blog-3'
    }
];


export async function seedDataAction(): Promise<{ success: boolean; error?: string }> {
    try {
        console.log("Seeding database from server action...");
        
        const firebaseApp = !getApps().length ? initializeApp(FIREBASE_CONFIG) : getApp();
        const db = getFirestore(firebaseApp);
        const batch = writeBatch(db);

        // Seed travel packages
        const packagesCollection = collection(db, 'travelPackages');
        const packagesSnapshot = await getDocs(packagesCollection);
        if (packagesSnapshot.empty) {
            travelPackages.forEach((pkg) => {
                const docRef = doc(db, 'travelPackages', pkg.id);
                batch.set(docRef, pkg);
            });
            console.log("Staging travel packages for seeding.");
        } else {
            console.log("Travel packages collection already contains data. Skipping seeding for packages.");
        }
        
        // Seed blog posts
        const blogPostsCollection = collection(db, 'blogPosts');
        const blogPostsSnapshot = await getDocs(blogPostsCollection);
        if(blogPostsSnapshot.empty) {
            blogPosts.forEach((post) => {
                const docRef = doc(db, 'blogPosts', post.id);
                batch.set(docRef, post);
            });
            console.log("Staging blog posts for seeding.");
        } else {
             console.log("Blog posts collection already contains data. Skipping seeding for blog posts.");
        }


        await batch.commit();

        console.log("Database seeding process completed.");
        return { success: true };

    } catch (error: any) {
        console.error("Error seeding database:", error);
        return { success: false, error: `Error seeding database: ${error.message}` };
    }
}


export async function enhanceItineraryAction(input: PackageItineraryEnhancementInput): Promise<{success: boolean; data?: PackageItineraryEnhancementOutput; error?: string}> {
    try {
        if (!input.itinerary) {
            return { success: false, error: 'Itinerary cannot be empty.' };
        }
        
        console.log("Calling AI to enhance itinerary with input:", input);
        const result = await enhancePackageItinerary(input);
        console.log("AI enhancement result:", result);
        
        return { success: true, data: result };
    } catch (error) {
        console.error("Error enhancing itinerary:", error);
        
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: `Failed to enhance itinerary. ${errorMessage}` };
    }
}
