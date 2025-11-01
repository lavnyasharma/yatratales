'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListOrdered, Package, MessageSquareQuote, FileText, LogOut, PanelLeft, Home, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirebase } from '@/firebase';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'L@vanya2210') {
      try {
        sessionStorage.setItem('adminAuthenticated', 'true');
        onLogin();
      } catch (e) {
        setError('Could not save session. Please enable cookies/site data.');
      }
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm mx-4 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
             <Image 
                src="https://wrijpsiiuvmeqaeklnqi.supabase.co/storage/v1/object/sign/new/210d78b0-4ac1-4ae3-b198-2a853604bffb_removalai_preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNTNkMmE3MS00ODk1LTRmN2YtYWExYS01ZjA1ZDhlYWE2YTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXcvMjEwZDc4YjAtNGFjMS00YWUzLWIxOTgtMmE4NTM2MDRiZmZiX3JlbW92YWxhaV9wcmV2aWV3LnBuZyIsImlhdCI6MTc2MjAyMzI2MywiZXhwIjoxNzkzNTU5MjYzfQ.3wq320XBZwpLHozsDFBDapJdBZDYlLZmPL5bm06aC8w" 
                alt="Yatra Tales Logo" 
                width={140} 
                height={45}
                className="object-contain"
              />
          </div>
          <CardTitle className="text-2xl font-headline">Admin Access</CardTitle>
          <CardDescription>Enter the password to manage the website.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Password"
              className="text-base"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Unlock
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const adminNavItems = [
    { href: '/admin/bookings', label: 'Bookings', icon: ListOrdered },
    { href: '/admin/packages', label: 'Packages', icon: Package },
    { href: '/admin/reviews', label: 'Reviews', icon: MessageSquareQuote },
    { href: '/admin/blog', label: 'Blog Posts', icon: FileText },
];

export default function AdminDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // This effect should only run on the client
    try {
      const sessionAuth = sessionStorage.getItem('adminAuthenticated');
      setIsAuthenticated(sessionAuth === 'true');
    } catch (e) {
      console.error("Could not access sessionStorage. This can happen in SSR or if disabled by user. Error: ", e);
      setIsAuthenticated(false);
    }
  }, []); 

  const handleLogin = () => {
    setIsAuthenticated(true);
    router.push('/admin/bookings');
  };
  
  const handleLogout = () => {
    try {
      sessionStorage.removeItem('adminAuthenticated');
    } catch (e) {
      console.error('Failed to remove session storage item.');
    }
    setIsAuthenticated(false);
    router.push('/');
  }

  // Loading state while we check session storage on the client
  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center min-h-screen bg-muted/40 text-muted-foreground">Loading Admin Panel...</div>;
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }
  
  // Find current page title
  const currentNavItem = adminNavItems.find(item => pathname.startsWith(item.href));
  const pageTitle = currentNavItem ? currentNavItem.label : 'Dashboard';

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar>
        <SidebarHeader className="border-b p-2 flex items-center justify-center">
           <Link href="/admin" className="flex items-center">
              <Image 
                src="https://wrijpsiiuvmeqaeklnqi.supabase.co/storage/v1/object/sign/new/210d78b0-4ac1-4ae3-b198-2a853604bffb_removalai_preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNTNkMmE3MS00ODk1LTRmN2YtYWExYS01ZjA1ZDhlYWE2YTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXcvMjEwZDc4YjAtNGFjMS00YWUzLWIxOTgtMmE4NTM2MDRiZmZiX3JlbW92YWxhaV9wcmV2aWV3LnBuZyIsImlhdCI6MTc2MjAyMzI2MywiZXhwIjoxNzkzNTU5MjYzfQ.3wq320XBZwpLHozsDFBDapJdBZDYlLZmPL5bm06aC8w" 
                alt="Yatra Tales Logo" 
                width={120} 
                height={40}
                className="object-contain group-data-[collapsible=icon]:hidden"
              />
               <Image 
                src="https://wrijpsiiuvmeqaeklnqi.supabase.co/storage/v1/object/sign/new/210d78b0-4ac1-4ae3-b198-2a853604bffb_removalai_preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNTNkMmE3MS00ODk1LTRmN2YtYWExYS01ZjA1ZDhlYWE2YTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXcvMjEwZDc4YjAtNGFjMS00YWUzLWIxOTgtMmE4NTM2MDRiZmZiX3JlbW92YWxhaV9wcmV2aWV3LnBuZyIsImlhdCI6MTc2MjAyMzI2MywiZXhwIjoxNzkzNTU5MjYzfQ.3wq320XBZwpLHozsDFBDapJdBZDYlLZmPL5bm06aC8w" 
                alt="Yatra Tales Logo" 
                width={32} 
                height={32}
                className="object-contain hidden group-data-[collapsible=icon]:block"
              />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton isActive={pathname.startsWith(item.href)} tooltip={{children: item.label, side: "right", align: "center"}}>
                    <item.icon className="size-5" />
                    <span className='group-data-[collapsible=icon]:hidden'>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <div className="border-t mx-2 my-2"></div>
           <SidebarMenu>
              <SidebarMenuItem>
                  <Link href="/">
                      <SidebarMenuButton variant="ghost" tooltip={{children: "Go to Homepage", side: "right", align: "center"}}>
                          <Home className="size-5" />
                          <span className='group-data-[collapsible=icon]:hidden'>Homepage</span>
                      </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogout} variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" tooltip={{children: "Logout", side: "right", align: "center"}}>
                      <LogOut className="size-5" />
                      <span className='group-data-[collapsible=icon]:hidden'>Logout</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
             <SidebarTrigger className="md:hidden"><PanelLeft /></SidebarTrigger>
             <h1 className="text-xl font-semibold">{pageTitle}</h1>
             <div className="ml-auto flex items-center gap-4">
               <form>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search everything..."
                      className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] rounded-full bg-muted/60"
                    />
                  </div>
                </form>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Avatar>
                                <AvatarImage src={''} alt={'Admin'} />
                                <AvatarFallback>{'A'}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive">Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/40">{children}</main>
      </div>
    </div>
  );
}
