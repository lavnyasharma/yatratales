'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirebase, errorEmitter } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { PartyPopper } from 'lucide-react';
import { FirestorePermissionError } from '@/firebase/errors';

const bookingSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(10, 'Phone number is required.'),
  travellers: z.coerce.number().min(1, 'At least one traveller is required.'),
  addons: z.array(z.string()).optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const addons = [
  { id: 'visa', label: 'Visa Assistance' },
  { id: 'insurance', label: 'Travel Insurance' },
  { id: 'guide', label: 'Private Guide' },
];

export default function BookingDialog({
  children,
  packageId,
  packageName,
}: {
  children: React.ReactNode;
  packageId: string;
  packageName: string;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { firestore, user } = useFirebase();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      phone: '',
      travellers: 2,
      addons: [],
    },
  });

  const onSubmit = async (data: BookingFormValues) => {
    if (!firestore) return;
    if (!user) {
        toast({
            title: 'Authentication Required',
            description: 'You must be logged in to submit a booking inquiry.',
            variant: 'destructive',
        });
        return;
    }

    const bookingRef = collection(firestore, 'users', user.uid, 'bookings');
    const bookingData = {
        userName: data.name,
        userEmail: data.email,
        userPhone: data.phone,
        travellers: data.travellers,
        packageId,
        packageName,
        addons: data.addons,
        bookingDate: serverTimestamp(),
        total: 0, 
        userId: user.uid,
      };

    try {
      await addDoc(bookingRef, bookingData);
      setIsSubmitted(true);
    } catch (error: any) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: bookingRef.path,
            operation: 'create',
            requestResourceData: bookingData,
        }))
      toast({
        title: 'Submission Failed',
        description: error.message || 'There was an error submitting your inquiry.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset form after a short delay to allow dialog to close
    setTimeout(() => {
        form.reset();
        setIsSubmitted(false);
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]" onInteractOutside={(e) => {
          if(isSubmitted) {
            e.preventDefault();
            handleClose();
          }
      }}>
        {isSubmitted ? (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <PartyPopper className="w-16 h-16 text-green-500 mb-4" />
                <DialogTitle className="text-2xl mb-2">Thank You!</DialogTitle>
                <DialogDescription className="mb-6">
                    Your booking inquiry has been received. Our travel expert will get in touch with you shortly.
                </DialogDescription>
                <Button onClick={handleClose} className="w-full">Close</Button>
            </div>
        ) : (
            <>
            <DialogHeader>
                <DialogTitle>Book: {packageName}</DialogTitle>
                <DialogDescription>
                    Fill in your details below and we'll get back to you with a confirmation.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" {...form.register('name')} />
                        {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...form.register('email')} />
                            {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" {...form.register('phone')} />
                            {form.formState.errors.phone && <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="travellers">Number of Travellers</Label>
                        <Input id="travellers" type="number" {...form.register('travellers')} />
                        {form.formState.errors.travellers && <p className="text-sm text-destructive">{form.formState.errors.travellers.message}</p>}
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Optional Add-ons</Label>
                    <div className="space-y-2">
                    <Controller
                        control={form.control}
                        name="addons"
                        render={({ field }) => (
                            <>
                            {addons.map((item) => (
                                <div key={item.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={item.id}
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                    return checked
                                        ? field.onChange([...(field.value || []), item.id])
                                        : field.onChange(
                                            (field.value || []).filter(
                                                (value) => value !== item.id
                                            )
                                            );
                                    }}
                                />
                                <label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {item.label}
                                </label>
                                </div>
                            ))}
                            </>
                        )}
                    />
                    </div>
                </div>
                
                <DialogFooter>
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                    </Button>
                </DialogFooter>
            </form>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
