'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LeadPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { firestore } = useFirebase();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: ''
  });

  useEffect(() => {
    // Check if user has already seen/closed the popup in this session or recently
    const hasSeenPopup = sessionStorage.getItem('hasSeenLeadPopup');
    
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000); // 5 seconds delay

      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Mark as seen when closed
      sessionStorage.setItem('hasSeenLeadPopup', 'true');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firestore) return;

    try {
      setIsSubmitting(true);
      
      await addDoc(collection(firestore, 'leads'), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'new'
      });

      setHasSubmitted(true);
      toast({
        title: "Success",
        description: "Thanks! We'll be in touch shortly.",
      });
      
      // Close after a brief delay to show success state
      setTimeout(() => {
        setIsOpen(false);
        sessionStorage.setItem('hasSeenLeadPopup', 'true');
      }, 2000);

    } catch (error) {
      console.error("Error submitting lead:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">Thank You!</DialogTitle>
            <DialogDescription className="text-center">
              We have received your details and one of our travel experts will contact you shortly to plan your dream vacation.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white text-black p-0 overflow-hidden gap-0">
        <div className="bg-primary/10 p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Plan Your Dream Trip!</DialogTitle>
            <DialogDescription className="text-foreground/80">
              Get a free personalized itinerary and quote from our travel experts.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="destination">Dream Destination</Label>
              <Input
                id="destination"
                name="destination"
                placeholder="e.g. Bali, Maldives, Europe..."
                value={formData.destination}
                onChange={handleChange}
              />
            </div>
            
            <Button type="submit" className="w-full text-lg mt-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Get Free Quote'
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            We respect your privacy. No spam, ever.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
