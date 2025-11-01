'use client';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirebase } from "@/firebase";
import { addDoc, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

const blogPostSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters.").max(160, "Excerpt must be less than 160 characters."),
  author: z.string().min(2, "Author name is required."),
  status: z.enum(["Draft", "Published"]),
  content: z.string().min(10, "Content is required."),
  imageId: z.string().optional().default('blog-1'),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

export default function BlogForm({ initialData, postId }: { initialData?: Partial<BlogPostFormValues>, postId?: string }) {
  const { firestore } = useFirebase();
  const router = useRouter();

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: initialData || {
      title: "",
      excerpt: "",
      author: "",
      status: "Draft",
      content: "",
      imageId: 'blog-1',
    },
  });

  async function onSubmit(data: BlogPostFormValues) {
    if (!firestore) return;

    try {
      if (postId) {
        // Editing existing post
        const postDoc = doc(firestore, "blogPosts", postId);
        await setDoc(postDoc, { ...data, updatedAt: serverTimestamp() }, { merge: true });
        toast({
          title: "Blog Post Updated!",
          description: "The post has been successfully updated.",
        });
      } else {
        // Creating new post
        await addDoc(collection(firestore, "blogPosts"), {
          ...data,
          publishDate: data.status === "Published" ? new Date().toISOString() : null,
          createdAt: serverTimestamp(),
        });
        toast({
          title: "Blog Post Created!",
          description: "The new post has been successfully added.",
        });
      }
      router.push("/admin/blog");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Could not save the blog post.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Post Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="excerpt" render={({ field }) => (
                    <FormItem><FormLabel>Excerpt</FormLabel><FormControl><Textarea {...field} rows={3} placeholder="A short summary of the post..." /></FormControl><FormDescription>This will be shown in post previews.</FormDescription><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="content" render={({ field }) => (
                    <FormItem><FormLabel>Content</FormLabel><FormControl><Textarea {...field} rows={15} placeholder="Write your blog post here..." /></FormControl><FormDescription>Use Markdown for formatting.</FormDescription><FormMessage /></FormItem>
                )} />
            </div>
            <div className="space-y-4">
                <FormField control={form.control} name="author" render={({ field }) => (
                    <FormItem><FormLabel>Author</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                    <FormLabel>Featured Image</FormLabel>
                    <FormControl>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary/80">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2">
                                    <p className="mb-2 text-sm text-muted-foreground">Image upload is not implemented.</p>
                                </div>
                                <Input id="dropzone-file" type="file" className="hidden" disabled />
                            </label>
                        </div> 
                    </FormControl>
                    <FormDescription>Image selection is disabled. A default image will be used.</FormDescription>
                </FormItem>
            </div>
        </div>
        
        <div className="flex justify-end">
            <Button type="submit">{postId ? 'Save Changes' : 'Create Post'}</Button>
        </div>
      </form>
    </Form>
  );
}
