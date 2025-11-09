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
import { 
  ListOrdered, 
  Package, 
  MessageSquareQuote, 
  FileText, 
  LogOut, 
  PanelLeft, 
  Home, 
  Search,
  Users,
  Star,
  BarChart3,
  Settings
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirebase } from '@/firebase';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';


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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/20 p-4">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-0 bg-background/80 backdrop-blur-sm">
        <CardHeader className="text-center pt-8">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-primary/10 p-4 rounded-2xl">
              <Image 
                src="https://wrijpsiiuvmeqaeklnqi.supabase.co/storage/v1/object/sign/new/210d78b0-4ac1-4ae3-b198-2a853604bffb_removalai_preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNTNkMmE3MS00ODk1LTRmN2YtYWExYS01ZjA1ZDhlYWE2YTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXcvMjEwZDc4YjAtNGFjMS00YWUzLWIxOTgtMmE4NTM2MDRiZmZiX3JlbW92YWxhaV9wcmV2aWV3LnBuZyIsImlhdCI6MTc2MjAyMzI2MywiZXhwIjoxNzkzNTU5MjYzfQ.3wq320XBZwpLHozsDFBDapJdBZDYlLZmPL5bm06aC8w" 
                alt="Yatra Tales Logo" 
                width={100} 
                height={35}
                className="object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-headline text-foreground">Admin Dashboard</CardTitle>
          <CardDescription>Enter your password to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter your password"
                className="h-12 text-base rounded-xl border-muted-foreground/20 focus:border-primary"
              />
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl font-medium text-base">
              Sign In
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
    { href: '/admin/testimonials', label: 'Testimonials', icon: Users },
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
  const { user } = useFirebase();

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/20">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }
  
  // Find current page title
  const currentNavItem = adminNavItems.find(item => pathname.startsWith(item.href));
  const pageTitle = currentNavItem ? currentNavItem.label : 'Dashboard';

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar className="border-r bg-sidebar text-sidebar-foreground">
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="bg-sidebar-primary/10 p-2 rounded-xl">
              <Image 
                src="https://wrijpsiiuvmeqaeklnqi.supabase.co/storage/v1/object/sign/new/210d78b0-4ac1-4ae3-b198-2a853604bffb_removalai_preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNTNkMmE3MS00ODk1LTRmN2YtYWExYS01ZjA1ZDhlYWE2YTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXcvMjEwZDc4YjAtNGFjMS00YWUzLWIxOTgtMmE4NTM2MDRiZmZiX3JlbW92YWxhaV9wcmV2aWV3LnBuZyIsImlhdCI6MTc2MjAyMzI2MywiZXhwIjoxNzkzNTU5MjYzfQ.3wq320XBZwpLHozsDFBDapJdBZDYlLZmPL5bm06aC8w" 
                alt="Yatra Tales Logo" 
                width={32} 
                height={32}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-sidebar-foreground">Yatra Tales</span>
              <span className="text-xs text-sidebar-foreground/70">Admin Panel</span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-2 py-4 bg-sidebar">
          <SidebarMenu>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.href} className="bg-sidebar">
                <Link href={item.href}>
                  <SidebarMenuButton 
                    isActive={pathname.startsWith(item.href)} 
                    className="rounded-xl h-12 mb-1 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <item.icon className="size-5" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/">
                <SidebarMenuButton 
                  variant="ghost" 
                  className="rounded-xl h-12 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <Home className="size-5" />
                  <span>Homepage</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleLogout} 
                variant="ghost" 
                className="rounded-xl h-12 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="size-5" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
          <SidebarTrigger className="md:hidden">
            <PanelLeft className="h-5 w-5" />
          </SidebarTrigger>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">{pageTitle}</h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <form className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 rounded-full bg-muted/50 focus:bg-background transition-colors"
                />
              </div>
            </form>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={''} alt={'Admin'} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={''} alt={'Admin'} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Administrator</span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email || 'admin@yatratales.com'}
                    </span>
                  </div>
                </div>
                <Separator className="my-2" />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto w-full p-0">
          {children}
        </main>
      </div>
    </div>
  );
}