'use client';
import BlogForm from "../../BlogForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function EditPostPage({ params }: { params: { id: string } }) {
    const { firestore } = useFirebase();
    const postRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'blogPosts', params.id);
    }, [firestore, params.id]);

    const { data: postData, isLoading } = useDoc(postRef);

    if (isLoading) return <p>Loading post data...</p>
    if (!postData) return <p>Blog post not found.</p>

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Blog Post</CardTitle>
                <CardDescription>Editing post: <span className="font-semibold">{postData?.title}</span></CardDescription>
            </CardHeader>
            <CardContent>
                <BlogForm initialData={postData} postId={params.id} />
            </CardContent>
        </Card>
    )
}
