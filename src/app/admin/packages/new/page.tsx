import PackageForm from "../PackageForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function NewPackagePage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Create New Package</CardTitle>
                <CardDescription>Fill out the form below to add a new travel package.</CardDescription>
            </CardHeader>
            <CardContent>
                <PackageForm />
            </CardContent>
        </Card>
    )
}
