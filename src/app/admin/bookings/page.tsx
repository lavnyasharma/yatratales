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
import { Briefcase, DollarSign, Users, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";


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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bookings Overview</h2>
        <p className="text-muted-foreground">Manage and track all travel bookings</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Total Revenue"
          count={`$${totalRevenue.toLocaleString()}`}
          description="Lifetime earnings"
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          className="border-l-4 border-l-primary"
        />
        <DashboardCard 
          title="Total Bookings"
          count={totalBookings}
          description="All time bookings"
          icon={<Briefcase className="h-6 w-6 text-primary" />}
          className="border-l-4 border-l-primary"
        />
        <DashboardCard 
          title="Recent Revenue"
          count={`$${recentRevenue.toLocaleString()}`}
          description="Last 30 days"
          icon={<TrendingUp className="h-6 w-6 text-primary" />}
          className="border-l-4 border-l-primary"
        />
        <DashboardCard 
          title="Recent Bookings"
          count={recentBookingsCount}
          description="Last 30 days"
          icon={<Calendar className="h-6 w-6 text-primary" />}
          className="border-l-4 border-l-primary"
        />
      </div>
      
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Recent Bookings</CardTitle>
            <p className="text-sm text-muted-foreground">Latest travel bookings from all users</p>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2 text-muted-foreground">Loading bookings...</p>
              </div>
            </div>
          ) : (
            <>
              {bookings?.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 font-medium">No bookings found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">There are no bookings to display yet.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-medium">Customer</TableHead>
                        <TableHead className="font-medium">Package</TableHead>
                        <TableHead className="font-medium hidden md:table-cell">Travellers</TableHead>
                        <TableHead className="font-medium hidden md:table-cell">Date</TableHead>
                        <TableHead className="font-medium text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings?.slice(0, 10).map((booking) => (
                        <TableRow key={booking.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="font-medium">{booking.userName}</div>
                            <div className="text-sm text-muted-foreground md:hidden">
                              {booking.userEmail}
                            </div>
                            <div className="text-sm text-muted-foreground hidden md:block">
                              {booking.userEmail}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{booking.packageName}</div>
                            <div className="text-sm text-muted-foreground md:hidden">
                              {booking.userPhone || 'No phone'}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="secondary" className="font-medium">
                              {booking.travellers} {booking.travellers === 1 ? 'person' : 'people'}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {booking.bookingDate?.toDate().toLocaleDateString() || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ${booking.total.toLocaleString()}
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