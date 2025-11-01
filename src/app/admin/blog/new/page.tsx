import BlogForm from "../BlogForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function NewPostPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Create New Blog Post</CardTitle>
                <CardDescription>Fill out the form below to add a new article to the blog.</CardDescription>
            </CardHeader>
            <CardContent>
                <BlogForm />
            </CardContent>
        </Card>
    )
}
