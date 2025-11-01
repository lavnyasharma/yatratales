'use client';

import AdminDashboard from './AdminDashboard';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider>
      <AdminDashboard>
        {children}
      </AdminDashboard>
    </SidebarProvider>
  );
}
