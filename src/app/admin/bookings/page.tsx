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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collectionGroup, query } from "firebase/firestore";
import type { Booking } from "@/lib/types";
import DashboardCard from '@/components/admin/DashboardCard';
import { Briefcase, DollarSign, Users } from "lucide-react";


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


  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DashboardCard 
                title="Total Revenue"
                count={`$${totalRevenue.toLocaleString()}`}
                description="Total revenue from all bookings"
                icon={<DollarSign className="h-6 w-6 text-muted-foreground" />}
            />
             <DashboardCard 
                title="Total Bookings"
                count={totalBookings}
                description="Total number of bookings made"
                icon={<Briefcase className="h-6 w-6 text-muted-foreground" />}
            />
             <DashboardCard 
                title="Total Travellers"
                count={totalTravellers}
                description="Total number of travellers booked"
                icon={<Users className="h-6 w-6 text-muted-foreground" />}
            />
        </div>
        <Card>
            <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>A list of all recent travel bookings from all users.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <p>Loading bookings...</p>}
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead className="hidden md:table-cell">Travellers</TableHead>
                    <TableHead className="hidden md:table-cell">Booking Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bookings?.map((booking) => (
                    <TableRow key={booking.id}>
                        <TableCell>
                        <div className="font-medium">{booking.userName}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                            {booking.userEmail}
                        </div>
                        </TableCell>
                        <TableCell>
                            <div className="font-medium">{booking.userPhone || 'N/A'}</div>
                        </TableCell>
                        <TableCell>{booking.packageName}</TableCell>
                        <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className="font-semibold">{booking.travellers}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                        {booking.bookingDate?.toDate().toLocaleDateString() || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                            ${booking.total.toLocaleString()}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
                {!isLoading && bookings?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No bookings found.</p>
                )}
            </CardContent>
        </Card>
    </div>
  )
}
