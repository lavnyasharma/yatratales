'use client';

import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  destination: string;
  status: string;
  createdAt: Timestamp;
}

export default function LeadsPage() {
  const { firestore } = useFirebase();

  const leadsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'leads'), orderBy('createdAt', 'desc'))
        : null,
    [firestore]
  );

  const { data: leads, isLoading } = useCollection<Lead>(leadsQuery);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
          <p className="text-muted-foreground">
            Manage inquiries from potential customers.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Inquiries</CardTitle>
          <CardDescription>
            A list of users who have requested a quote.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!leads || leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No leads found.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="whitespace-nowrap">
                      {lead.createdAt?.toDate().toLocaleDateString()}
                      <span className="block text-xs text-muted-foreground">
                        {lead.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{lead.email}</span>
                        <span className="text-xs text-muted-foreground">{lead.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.destination || <span className="text-muted-foreground italic">Not specified</span>}
                    </TableCell>
                    <TableCell>
                       <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                        {lead.status.toUpperCase()}
                       </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
