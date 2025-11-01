'use client';

import PackageForm from "../../PackageForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function EditPackagePage({ params }: { params: { id: string } }) {
    const { firestore } = useFirebase();
    const packageRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'travelPackages', params.id);
    }, [firestore, params.id]);

    const { data: packageData, isLoading } = useDoc(packageRef);

    if (isLoading) {
        return <p>Loading package data...</p>
    }

    if (!packageData) {
        return <p>Package not found.</p>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Package</CardTitle>
                <CardDescription>Editing package: <span className="font-semibold">{packageData.title}</span></CardDescription>
            </CardHeader>
            <CardContent>
                <PackageForm initialData={packageData} packageId={params.id} />
            </CardContent>
        </Card>
    )
}
