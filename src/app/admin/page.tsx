'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/admin/bookings');
    }, [router]);
    
    return (
        <div className="flex items-center justify-center h-full">
            <p>Redirecting to dashboard...</p>
        </div>
    );
}
