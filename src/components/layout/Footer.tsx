import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground border-t">
      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3 flex flex-col space-y-4">
                <Link href="/" className="flex items-center space-x-2">
                  <Image 
                    src="https://wrijpsiiuvmeqaeklnqi.supabase.co/storage/v1/object/sign/new/210d78b0-4ac1-4ae3-b198-2a853604bffb_removalai_preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNTNkMmE3MS00ODk1LTRmN2YtYWExYS01ZjA1ZDhlYWE2YTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXcvMjEwZDc4YjAtNGFjMS00YWUzLWIxOTgtMmE4NTM2MDRiZmZiX3JlbW92YWxhaV9wcmV2aWV3LnBuZyIsImlhdCI6MTc2MjAyMzI2MywiZXhwIjoxNzkzNTU5MjYzfQ.3wq320XBZwpLHozsDFBDapJdBZDYlLZmPL5bm06aC8w" 
                    alt="Yatra Tales Logo" 
                    width={140} 
                    height={45}
                    className="object-contain"
                  />
                </Link>
                <p className="text-sm text-muted-foreground">
                Your journey begins here. Explore the world with our curated travel packages.
                </p>
                <div className="flex space-x-4">
                <Link href="#" className="text-muted-foreground hover:text-primary">
                    <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                    <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                    <Instagram className="h-5 w-5" />
                </Link>
                </div>
            </div>
            <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-semibold mb-4">Company</h3>
                    <ul className="space-y-2">
                    <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
                    <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">Blog</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Careers</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Press</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Support</h3>
                    <ul className="space-y-2">
                    <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Destinations</h3>
                    <ul className="space-y-2">
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Europe</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Asia</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">South America</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Africa</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Newsletter</h3>
                    <p className="text-sm text-muted-foreground mb-2">Subscribe for travel deals and news.</p>
                    <form className="flex">
                        <Input type="email" placeholder="Your email" className="rounded-r-none focus:z-10" />
                        <Button type="submit" className="rounded-l-none bg-primary text-primary-foreground">Subscribe</Button>
                    </form>
                </div>
            </div>
        </div>
      </div>
      <div className="bg-background/50">
        <div className="container py-6 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Yatra Tales. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
