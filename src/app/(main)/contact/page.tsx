import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container py-16">
      <Breadcrumb className="mb-12">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Contact</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Get In Touch</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Have a question or want to book a trip? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <Card className="bg-secondary/50">
            <CardHeader className="flex flex-row items-center gap-4">
              <Mail className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Email Us</CardTitle>
                <CardDescription>for general inquiries</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <a href="mailto:hello@triply.com" className="font-semibold text-primary hover:underline">
                hello@triply.com
              </a>
            </CardContent>
          </Card>
          <Card className="bg-secondary/50">
            <CardHeader className="flex flex-row items-center gap-4">
              <Phone className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Call Us</CardTitle>
                <CardDescription>Mon-Fri, 9am-5pm</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <a href="tel:+1234567890" className="font-semibold text-primary hover:underline">
                +1 (234) 567-890
              </a>
            </CardContent>
          </Card>
          <Card className="bg-secondary/50">
            <CardHeader className="flex flex-row items-center gap-4">
              <MapPin className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Our Office</CardTitle>
                <CardDescription>123 Travel Lane, Adventure City</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <a href="#" className="font-semibold text-primary hover:underline">
                Get Directions
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input type="text" placeholder="Your Name" />
                  <Input type="email" placeholder="Your Email" />
                </div>
                <Input type="text" placeholder="Subject" />
                <Textarea placeholder="Your Message" rows={8} />
                <Button type="submit" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
