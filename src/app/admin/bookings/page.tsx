'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collectionGroup, query } from "firebase/firestore";
import type { Booking } from "@/lib/types";
import DashboardCard from '@/components/admin/DashboardCard';
import { Briefcase, DollarSign, Users, Calendar, TrendingUp, Search, Filter, Download, Eye, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function BookingsPage() {
  const { firestore, user } = useFirebase();

  const bookingsQuery = useMemoFirebase(
    () => (firestore && user ? query(collectionGroup(firestore, 'bookings')) : null),
    [firestore, user]
  );

  const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

  const totalRevenue = bookings?.reduce((sum, booking) => sum + booking.total, 0) || 0;
  const totalBookings = bookings?.length || 0;
  const totalTravellers = bookings?.reduce((sum, booking) => sum + booking.travellers, 0) || 0;

  // Calculate recent bookings (last 30 days)
  const recentBookings = bookings?.filter(booking => {
    if (!booking.bookingDate) return false;
    const bookingDate = booking.bookingDate.toDate();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return bookingDate >= thirtyDaysAgo;
  }) || [];

  const recentRevenue = recentBookings.reduce((sum, booking) => sum + booking.total, 0);
  const recentBookingsCount = recentBookings.length;

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Bookings Overview
          </h2>
          <p className="text-muted-foreground text-lg">Manage and track all travel bookings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search bookings..." 
              className="pl-10 w-64 bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Total Revenue"
          count={`$${totalRevenue.toLocaleString()}`}
          description="Lifetime earnings"
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <DashboardCard 
          title="Total Bookings"
          count={totalBookings}
          description="All time bookings"
          icon={<Briefcase className="h-6 w-6 text-primary" />}
          trend={{ value: 8.2, isPositive: true }}
        />
        <DashboardCard 
          title="Recent Revenue"
          count={`$${recentRevenue.toLocaleString()}`}
          description="Last 30 days"
          icon={<TrendingUp className="h-6 w-6 text-primary" />}
          trend={{ value: 15.3, isPositive: true }}
        />
        <DashboardCard 
          title="Recent Bookings"
          count={recentBookingsCount}
          description="Last 30 days"
          icon={<Calendar className="h-6 w-6 text-primary" />}
          trend={{ value: 5.7, isPositive: false }}
        />
      </div>
      
      {/* Bookings Table */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Recent Bookings
            </CardTitle>
            <p className="text-sm text-muted-foreground">Latest travel bookings from all users</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-medium">
              {bookings?.length || 0} Total
            </Badge>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary/20 border-r-primary align-[-0.125em]"></div>
                  <div className="absolute inset-0 inline-block h-12 w-12 animate-ping rounded-full border-4 border-primary/10"></div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Loading bookings...</p>
                  <p className="text-sm text-muted-foreground">Please wait while we fetch your data</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {bookings?.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative">
                    <div className="mx-auto h-20 w-20 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
                      <Briefcase className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="absolute inset-0 mx-auto h-20 w-20 bg-primary/5 rounded-full animate-pulse"></div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">No bookings found</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">There are no bookings to display yet. New bookings will appear here once customers start booking.</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-muted/80 to-muted/40">
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="font-semibold text-foreground/90 py-4">Customer</TableHead>
                        <TableHead className="font-semibold text-foreground/90">Package</TableHead>
                        <TableHead className="font-semibold text-foreground/90 hidden md:table-cell">Travellers</TableHead>
                        <TableHead className="font-semibold text-foreground/90 hidden md:table-cell">Date</TableHead>
                        <TableHead className="font-semibold text-foreground/90 text-right">Total</TableHead>
                        <TableHead className="font-semibold text-foreground/90 w-12">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings?.slice(0, 10).map((booking, index) => (
                        <TableRow key={booking.id} className="hover:bg-gradient-to-r hover:from-primary/[0.02] hover:to-transparent transition-all duration-200 border-border/30">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center font-semibold text-primary text-sm">
                                {booking.userName?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">{booking.userName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {booking.userEmail}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-foreground">{booking.packageName}</div>
                              <div className="text-sm text-muted-foreground md:hidden">
                                {booking.userPhone || 'No phone'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="secondary" className="font-medium bg-primary/10 text-primary border-primary/20">
                              <Users className="w-3 h-3 mr-1" />
                              {booking.travellers} {booking.travellers === 1 ? 'person' : 'people'}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium">
                                {booking.bookingDate?.toDate().toLocaleDateString() || 'N/A'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-bold text-lg text-foreground">
                              ${booking.total.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem className="gap-2">
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2">
                                  <Download className="h-4 w-4" />
                                  Download Receipt
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}