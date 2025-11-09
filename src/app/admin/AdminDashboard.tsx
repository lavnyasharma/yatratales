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
import { cn } from '@/lib/utils';
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
    <div className="w-full bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm mx-auto">
          <CardHeader className="text-center pt-8 pb-6">
            <div className="flex justify-center items-center mb-8">
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-3xl shadow-lg">
                  <Image 
                    src="https://wrijpsiiuvmeqaeklnqi.supabase.co/storage/v1/object/sign/new/210d78b0-4ac1-4ae3-b198-2a853604bffb_removalai_preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNTNkMmE3MS00ODk1LTRmN2YtYWExYS01ZjA1ZDhlYWE2YTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXcvMjEwZDc4YjAtNGFjMS00YWUzLWIxOTgtMmE4NTM2MDRiZmZiX3JlbW92YWxhaV9wcmV2aWV3LnBuZyIsImlhdCI6MTc2MjAyMzI2MywiZXhwIjoxNzkzNTU5MjYzfQ.3wq320XBZwpLHozsDFBDapJdBZDYlLZmPL5bm06aC8w" 
                    alt="Yatra Tales Logo" 
                    width={120} 
                    height={42}
                    className="object-contain"
                  />
                </div>
                <div className="absolute inset-0 bg-primary/5 rounded-3xl animate-pulse opacity-50"></div>
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Admin Dashboard
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Enter your password to access the admin panel
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pb-8 px-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your password"
                  className="h-14 text-base rounded-xl border-2 border-muted-foreground/20 focus:border-primary/50 bg-white/50 backdrop-blur-sm transition-all duration-300"
                />
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm text-destructive text-center font-medium">{error}</p>
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 rounded-xl font-semibold text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
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
      <Sidebar className="border-r border-sidebar-border bg-gradient-to-b from-sidebar to-sidebar/95 text-sidebar-foreground shadow-lg">
        <SidebarHeader className="border-b border-sidebar-border/50 p-6 bg-gradient-to-r from-sidebar-accent/30 to-transparent">
          <Link href="/admin" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="bg-gradient-to-br from-sidebar-primary/15 to-sidebar-primary/5 p-3 rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-300">
                <Image 
                  src="https://wrijpsiiuvmeqaeklnqi.supabase.co/storage/v1/object/sign/new/210d78b0-4ac1-4ae3-b198-2a853604bffb_removalai_preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNTNkMmE3MS00ODk1LTRmN2YtYWExYS01ZjA1ZDhlYWE2YTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXcvMjEwZDc4YjAtNGFjMS00YWUzLWIxOTgtMmE4NTM2MDRiZmZiX3JlbW92YWxhaV9wcmV2aWV3LnBuZyIsImlhdCI6MTc2MjAyMzI2MywiZXhwIjoxNzkzNTU5MjYzfQ.3wq320XBZwpLHozsDFBDapJdBZDYlLZmPL5bm06aC8w" 
                  alt="Yatra Tales Logo" 
                  width={36} 
                  height={36}
                  className="object-contain"
                />
              </div>
              <div className="absolute inset-0 bg-sidebar-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-sidebar-foreground group-hover:text-sidebar-primary transition-colors duration-300">Yatra Tales</span>
              <span className="text-sm text-sidebar-foreground/70 font-medium">Admin Panel</span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-3 py-6 bg-gradient-to-b from-sidebar to-sidebar/95">
          <SidebarMenu className="space-y-2">
            {adminNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton 
                      isActive={isActive}
                      className={cn(
                        "group relative rounded-2xl h-14 mb-2 text-sidebar-foreground transition-all duration-300 font-medium",
                        isActive 
                          ? "bg-gradient-to-r from-sidebar-primary/15 to-sidebar-primary/5 text-sidebar-primary shadow-md border border-sidebar-primary/20" 
                          : "hover:bg-gradient-to-r hover:from-sidebar-accent/50 hover:to-sidebar-accent/20 hover:text-sidebar-accent-foreground hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-xl transition-all duration-300",
                          isActive 
                            ? "bg-sidebar-primary/10 text-sidebar-primary" 
                            : "bg-sidebar-foreground/5 group-hover:bg-sidebar-accent/30"
                        )}>
                          <item.icon className="size-5" />
                        </div>
                        <span className="text-base">{item.label}</span>
                      </div>
                      {isActive && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-sidebar-primary rounded-full animate-pulse"></div>
                      )}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border/50 bg-gradient-to-r from-sidebar-accent/20 to-transparent">
          <SidebarMenu className="space-y-2">
            <SidebarMenuItem>
              <Link href="/">
                <SidebarMenuButton 
                  variant="ghost" 
                  className="group rounded-2xl h-12 text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-accent/50 hover:to-sidebar-accent/20 hover:text-sidebar-accent-foreground transition-all duration-300 font-medium"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-sidebar-foreground/5 group-hover:bg-sidebar-accent/30 transition-all duration-300">
                      <Home className="size-4" />
                    </div>
                    <span>Homepage</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleLogout} 
                variant="ghost" 
                className="group rounded-2xl h-12 text-sidebar-foreground hover:bg-gradient-to-r hover:from-destructive/10 hover:to-destructive/5 hover:text-destructive transition-all duration-300 font-medium"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sidebar-foreground/5 group-hover:bg-destructive/10 transition-all duration-300">
                    <LogOut className="size-4" />
                  </div>
                  <span>Logout</span>
                </div>
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