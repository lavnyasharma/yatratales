'use client';
import Link from 'next/link';
import Image from 'next/image';
import { AuthButton } from '@/components/auth/AuthButton';
import { Button } from '../ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TravelPackage } from '@/lib/types';
import { useMemo } from 'react';

export default function Header() {
  const { firestore } = useFirebase();

  const packagesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'travelPackages') : null),
    [firestore]
  );
  const { data: allPackages } = useCollection<TravelPackage>(packagesQuery);

  // Get unique locations for international packages
  const internationalLocations = useMemo(() => {
    if (!allPackages) return [];
    const locations = allPackages
      .filter(pkg => pkg.packageType === 'international')
      .map(pkg => pkg.location)
      .filter((location, index, self) => self.indexOf(location) === index)
      .slice(0, 6); // Limit to 6 locations
    return locations;
  }, [allPackages]);

  // Get unique locations for domestic packages
  const domesticLocations = useMemo(() => {
    if (!allPackages) return [];
    const locations = allPackages
      .filter(pkg => pkg.packageType === 'domestic')
      .map(pkg => pkg.location)
      .filter((location, index, self) => self.indexOf(location) === index)
      .slice(0, 6); // Limit to 6 locations
    return locations;
  }, [allPackages]);

  // Get unique locations for group packages
  const groupLocations = useMemo(() => {
    if (!allPackages) return [];
    const locations = allPackages
      .filter(pkg => pkg.packageType === 'group')
      .map(pkg => pkg.location)
      .filter((location, index, self) => self.indexOf(location) === index)
      .slice(0, 6); // Limit to 6 locations
    return locations;
  }, [allPackages]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo - Left */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="https://wrijpsiiuvmeqaeklnqi.supabase.co/storage/v1/object/sign/new/210d78b0-4ac1-4ae3-b198-2a853604bffb_removalai_preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNTNkMmE3MS00ODk1LTRmN2YtYWFhYS01ZjA1ZDhlYWE2YTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXcvMjEwZDc4YjAtNGFjMS00YWUzLWIxOTgtMmE4NTM2MDRiZmZiX3JlbW92YWxhaV9wcmV2aWV3LnBuZyIsImlhdCI6MTc2MjAyMzI2MywiZXhwIjoxNzkzNTU5MjYzfQ.3wq320XBZwpLHozsDFBDapJdBZDYlLZmPL5bm06aC8w"
            alt="Yatra Tales Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </Link>

        {/* Navigation - Center */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-base font-semibold">
                International<span className="text-primary">.</span>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <ListItem href="/packages?type=international" title="All International">
                    Explore all our international tour packages
                  </ListItem>
                  {internationalLocations.length > 0 ? (
                    internationalLocations.map((location) => (
                      <ListItem
                        key={location}
                        href={`/packages?type=international&search=${encodeURIComponent(location)}`}
                        title={location}
                      >
                        Discover {location}
                      </ListItem>
                    ))
                  ) : (
                    <li className="col-span-2 p-3 text-sm text-muted-foreground text-center">
                      No international packages available
                    </li>
                  )}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-base font-semibold">
                Domestic<span className="text-primary">.</span>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <ListItem href="/packages?type=domestic" title="All Domestic">
                    Explore all our domestic tour packages
                  </ListItem>
                  {domesticLocations.length > 0 ? (
                    domesticLocations.map((location) => (
                      <ListItem
                        key={location}
                        href={`/packages?type=domestic&search=${encodeURIComponent(location)}`}
                        title={location}
                      >
                        Explore {location}
                      </ListItem>
                    ))
                  ) : (
                    <li className="col-span-2 p-3 text-sm text-muted-foreground text-center">
                      No domestic packages available
                    </li>
                  )}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

             <NavigationMenuItem>
              <NavigationMenuTrigger className="text-base font-semibold">
                Group Packages<span className="text-primary">.</span>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <ListItem href="/packages?type=group" title="All Group Packages">
                    Explore all our group tour packages
                  </ListItem>
                  {groupLocations.length > 0 ? (
                    groupLocations.map((location) => (
                      <ListItem
                        key={location}
                        href={`/packages?type=group&search=${encodeURIComponent(location)}`}
                        title={location}
                      >
                         Join a group to {location}
                      </ListItem>
                    ))
                  ) : (
                    <li className="col-span-2 p-3 text-sm text-muted-foreground text-center">
                      No group packages available
                    </li>
                  )}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/blog" legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-base font-semibold")}>
                  Blog<span className="text-primary">.</span>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-base font-semibold")}>
                  About<span className="text-primary">.</span>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/contact" legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-base font-semibold")}>
                  Contact<span className="text-primary">.</span>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Auth Buttons - Right */}
        <div className="flex items-center space-x-2">
          <AuthButton />
          <Button variant="outline" asChild size="sm">
            <Link href="/admin">
              Admin
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

const ListItem = ({ className, title, children, href, ...props }: {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};
