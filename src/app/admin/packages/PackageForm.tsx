'use client';
import { useFieldArray, useForm } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import { PlaceHolderImages } from '@/lib/placeholder-images';

const packageSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  location: z.string().min(2, "Location is required."),
  duration: z.string().min(2, "Duration is required."),
  description: z.string().min(10, "Description is required."),
  itinerary: z.string().min(10, "Itinerary is required."),
  packageType: z.enum(["international", "domestic"]).default("domestic"),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  transfers: z.array(z.string()).default([]),
  terms: z.string().optional(),
  validity: z.string().optional(),
  featured: z.boolean().default(false),
  imageUrls: z.array(z.string()).default([]),
  pricing: z.array(z.object({
    stars: z.coerce.number().min(1),
    rates: z.array(z.object({
      pax: z.coerce.number().min(1),
      price: z.coerce.number().min(0),
    })),
  })).default([
    { stars: 3, rates: [{ pax: 2, price: 13700 }, { pax: 4, price: 11500 }] },
    { stars: 4, rates: [{ pax: 2, price: 16000 }, { pax: 4, price: 14000 }] },
    { stars: 5, rates: [{ pax: 2, price: 21000 }, { pax: 4, price: 18750 }] },
  ]),
  hotelOptions: z.array(z.object({
    stars: z.coerce.number().min(1),
    hotels: z.array(z.string()).default([]),
  })).default([
    { stars: 3, hotels: [] },
    { stars: 4, hotels: [] },
    { stars: 5, hotels: [] },
  ]),
  itinerarySummary: z.array(z.object({
    nights: z.coerce.number().min(1),
    location: z.string().min(1),
  })).default([
    { nights: 2, location: 'Munnar' },
    { nights: 1, location: 'Thekkady' },
    { nights: 1, location: 'Alleppey' },
  ]),
});

type PackageFormValues = z.infer<typeof packageSchema>;

// Helper for comma-separated string to array
const stringToArray = (value: string | string[]) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

function PricingTierForm({ tierIndex, control, removeTier }: { tierIndex: number, control: any, removeTier: (index: number) => void }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `pricing.${tierIndex}.rates`
  });

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex justify-between items-center">
        <FormField control={control} name={`pricing.${tierIndex}.stars`} render={({ field }) => (
          <FormItem className="w-1/2"><FormLabel>Star Category</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="button" variant="ghost" size="icon" onClick={() => removeTier(tierIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>

      <div className="space-y-2">
        <FormLabel>Rates</FormLabel>
        {fields.map((rateField, rateIndex) => (
          <div key={rateField.id} className="flex items-end gap-2">
            <FormField control={control} name={`pricing.${tierIndex}.rates.${rateIndex}.pax`} render={({ field }) => (
              <FormItem className="w-1/3"><FormLabel className="text-xs">Pax</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name={`pricing.${tierIndex}.rates.${rateIndex}.price`} render={({ field }) => (
              <FormItem className="w-2/3"><FormLabel className="text-xs">Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(rateIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => append({ pax: 2, price: 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Rate</Button>
      </div>
    </div>
  );
}

export default function PackageForm({ initialData, packageId }: { initialData?: Partial<PackageFormValues>, packageId?: string }) {
  const { firestore } = useFirebase();
  const router = useRouter();

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      ...initialData,
      imageUrls: initialData?.imageUrls || (initialData as any)?.imageIds?.map((id: string) => {
        const placeholder = PlaceHolderImages.find(img => img.id === id);
        return placeholder ? placeholder.imageUrl : '';
      }) || [],
      inclusions: initialData?.inclusions || [],
      exclusions: initialData?.exclusions || [],
      transfers: initialData?.transfers || [],
    },
  });

  const { fields: pricingFields, append: appendPricing, remove: removePricing } = useFieldArray({ control: form.control, name: "pricing" });
  const { fields: hotelFields, append: appendHotel, remove: removeHotel } = useFieldArray({ control: form.control, name: "hotelOptions" });
  const { fields: itineraryFields, append: appendItinerary, remove: removeItinerary } = useFieldArray({ control: form.control, name: "itinerarySummary" });

  async function onSubmit(data: PackageFormValues) {
    if (!firestore) return;
    try {
      // Remove undefined values and transform data for saving
      const dataToSave: Record<string, any> = {};

      // Copy all defined values
      Object.keys(data).forEach(key => {
        const value = (data as any)[key];
        if (value !== undefined) {
          dataToSave[key] = value;
        }
      });

      // Transform imageUrls to separate uploaded URLs and placeholder image IDs
      // Uploaded images go to imageUrls, placeholder images go to imageIds
      const uploadedImages: string[] = [];
      const placeholderImageIds: string[] = [];

      data.imageUrls.forEach(url => {
        // Try to find if this URL matches a placeholder image
        const placeholder = PlaceHolderImages.find(img => img.imageUrl === url);
        if (placeholder) {
          // It's a placeholder image, add to imageIds
          placeholderImageIds.push(placeholder.id);
        } else {
          // It's an uploaded image, add to imageUrls
          uploadedImages.push(url);
        }
      });

      // Store the separated data
      dataToSave.imageUrls = uploadedImages;
      dataToSave.imageIds = placeholderImageIds;

      // Ensure array fields are stored as arrays
      dataToSave.inclusions = Array.isArray(data.inclusions) ? data.inclusions : stringToArray(data.inclusions as any);
      dataToSave.exclusions = Array.isArray(data.exclusions) ? data.exclusions : stringToArray(data.exclusions as any);
      dataToSave.transfers = Array.isArray(data.transfers) ? data.transfers : stringToArray(data.transfers as any);

      if (packageId) {
        const packageDoc = doc(firestore, "travelPackages", packageId);
        await setDoc(packageDoc, dataToSave, { merge: true });
        toast({
          title: "Package Updated!",
          description: "The package details have been successfully updated.",
        });
      } else {
        await addDoc(collection(firestore, "travelPackages"), dataToSave);
        toast({
          title: "Package Created!",
          description: "The new package has been successfully added.",
        });
      }
      router.push("/admin/packages");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Could not save the package.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        <Card>
          <CardHeader><CardTitle>Core Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} placeholder="e.g. Kerala" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="duration" render={({ field }) => (
                <FormItem><FormLabel>Duration</FormLabel><FormControl><Input {...field} placeholder="e.g. 4 Nights • 5 Days" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="packageType" render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Package Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-row space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="domestic" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Domestic
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="international" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        International
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="featured" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-4">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Featured Package</FormLabel>
                  <FormDescription>Display this package on the homepage.</FormDescription>
                </div>
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <ImageUpload
          maxImages={5}
          existingImages={form.watch("imageUrls")}
          onImagesUploaded={(imageUrls) => form.setValue("imageUrls", imageUrls)}
        />

        <Card>
          <CardHeader>
            <CardTitle>Itinerary Summary</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => appendItinerary({ nights: 1, location: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Leg</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {itineraryFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <FormField control={form.control} name={`itinerarySummary.${index}.nights`} render={({ field }) => (
                  <FormItem className="w-1/4"><FormLabel>Nights</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name={`itinerarySummary.${index}.location`} render={({ field }) => (
                  <FormItem className="flex-1"><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItinerary(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pricing Matrix</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => appendPricing({ stars: 3, rates: [] })}><PlusCircle className="mr-2 h-4 w-4" /> Add Tier</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {pricingFields.map((field, index) => (
              <PricingTierForm
                key={field.id}
                tierIndex={index}
                control={form.control}
                removeTier={removePricing}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Hotel Options</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => appendHotel({ stars: 3, hotels: [] })}><PlusCircle className="mr-2 h-4 w-4" /> Add Tier</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {hotelFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <FormField control={form.control} name={`hotelOptions.${index}.stars`} render={({ field }) => (
                    <FormItem className="w-1/2"><FormLabel>Star Category</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeHotel(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <FormField control={form.control} name={`hotelOptions.${index}.hotels`} render={({ field }) => (
                  <FormItem><FormLabel>Hotels (one per line)</FormLabel><FormControl><Textarea {...field} onChange={e => field.onChange(e.target.value.split('\n'))} value={Array.isArray(field.value) ? field.value.join('\n') : field.value} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Package Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="inclusions" render={({ field }) => (
              <FormItem><FormLabel>Inclusions</FormLabel><FormControl><Textarea {...field} onChange={e => field.onChange(e.target.value.split('\n'))} value={Array.isArray(field.value) ? field.value.join('\n') : field.value} placeholder="One item per line" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="exclusions" render={({ field }) => (
              <FormItem><FormLabel>Exclusions</FormLabel><FormControl><Textarea {...field} onChange={e => field.onChange(e.target.value.split('\n'))} value={Array.isArray(field.value) ? field.value.join('\n') : field.value} placeholder="One item per line" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="transfers" render={({ field }) => (
              <FormItem><FormLabel>Transfers</FormLabel><FormControl><Textarea {...field} onChange={e => field.onChange(e.target.value.split('\n'))} value={Array.isArray(field.value) ? field.value.join('\n') : field.value} placeholder="One item per line" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="validity" render={({ field }) => (
              <FormItem><FormLabel>Validity</FormLabel><FormControl><Input {...field} placeholder="e.g. 01 October 2025 - 31 March 2026" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="terms" render={({ field }) => (
              <FormItem><FormLabel>Terms & Conditions</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="itinerary" render={({ field }) => (
              <FormItem><FormLabel>Full Itinerary</FormLabel><FormControl><Textarea {...field} rows={10} placeholder="Day 1: Arrival..." /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent>
        </Card>


        <div className="flex justify-end">
          <Button type="submit">Save Package</Button>
        </div>
      </form>
    </Form>
  );
}
