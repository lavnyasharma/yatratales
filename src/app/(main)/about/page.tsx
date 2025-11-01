import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, Globe, Heart } from 'lucide-react';

const getPlaceholder = (id: string) => PlaceHolderImages.find(p => p.id === id);

const teamMembers = [
  { name: 'Alice Johnson', role: 'Founder & CEO', imageId: 'testimonial-1' },
  { name: 'David Smith', role: 'Lead Travel Consultant', imageId: 'testimonial-2' },
  { name: 'Emily White', role: 'Marketing Director', imageId: 'avatar-placeholder' },
];

export default function AboutPage() {
  const aboutHero = getPlaceholder('blog-1');

  return (
    <div>
      <section className="relative h-[500px] bg-secondary/30">
        {aboutHero && (
          <Image
            src={aboutHero.imageUrl}
            alt="Beautiful beach"
            fill
            className="object-cover opacity-20"
            data-ai-hint={aboutHero.imageHint}
          />
        )}
        <div className="container relative z-10 flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4">About Yatra Tales</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            We are a passionate team of travel enthusiasts dedicated to creating unforgettable journeys and adventures for everyone.
          </p>
        </div>
      </section>

      <div className="container py-16">
        <Breadcrumb className="mb-12">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>About Us</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-headline font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-6">
                Our mission is to make travel accessible, enjoyable, and enriching for everyone. We believe that travel has the power to open minds, foster connections, and create lifelong memories. We meticulously craft each itinerary to ensure you have the most authentic and seamless experience possible.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <Card className="bg-secondary/50">
                  <CardContent className="p-6">
                    <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">Passion</h3>
                    <p className="text-sm text-muted-foreground">Driven by our love for exploration.</p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/50">
                  <CardContent className="p-6">
                    <Briefcase className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">Expertise</h3>
                    <p className="text-sm text-muted-foreground">Years of experience in the travel industry.</p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/50">
                  <CardContent className="p-6">
                    <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">Global Reach</h3>
                    <p className="text-sm text-muted-foreground">Tours and packages all over the world.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div>
              <Image
                src={getPlaceholder('destination-ny')?.imageUrl || ''}
                alt="Team working"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
                data-ai-hint={getPlaceholder('destination-ny')?.imageHint}
              />
            </div>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-headline font-bold mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member) => {
              const image = getPlaceholder(member.imageId);
              return (
                <Card key={member.name}>
                  <CardContent className="p-6 text-center">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarImage src={image?.imageUrl} alt={member.name} data-ai-hint={image?.imageHint} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-primary">{member.role}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
