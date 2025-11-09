'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const router = useRouter();
    
    useEffect(() => {
        router.replace('/admin/bookings');
    }, [router]);
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/20">
            <div className="text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-muted-foreground">Redirecting to dashboard...</p>
            </div>
        </div>
    );
}