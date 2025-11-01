import Link from 'next/link';
import Image from 'next/image';
import { AuthButton } from '@/components/auth/AuthButton';
import { Button } from '../ui/button';

const navLinks = [
  { href: '/packages', label: 'Tours' },
  { href: '/destinations', label: 'Destination' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image 
            src="https://wrijpsiiuvmeqaeklnqi.supabase.co/storage/v1/object/sign/new/210d78b0-4ac1-4ae3-b198-2a853604bffb_removalai_preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNTNkMmE3MS00ODk1LTRmN2YtYWExYS01ZjA1ZDhlYWE2YTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXcvMjEwZDc4YjAtNGFjMS00YWUzLWIxOTgtMmE4NTM2MDRiZmZiX3JlbW92YWxhaV9wcmV2aWV3LnBuZyIsImlhdCI6MTc2MjAyMzI2MywiZXhwIjoxNzkzNTU5MjYzfQ.3wq320XBZwpLHozsDFBDapJdBZDYlLZmPL5bm06aC8w" 
            alt="Yatra Tales Logo" 
            width={120} 
            height={40}
            className="object-contain"
          />
        </Link>
        <nav className="hidden md:flex flex-1 items-center justify-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-primary text-base font-semibold"
            >
              {link.label}
              <span className="text-primary">.</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
                <AuthButton />
                <Button variant="outline" asChild>
                  <Link href="/admin">
                    Admin
                  </Link>
                </Button>
            </nav>
        </div>
      </div>
    </header>
  );
}
