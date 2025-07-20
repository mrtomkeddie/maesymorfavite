import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Newspaper, CalendarDays, Users, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const newsItems = [
    {
      title: 'School Sports Day Triumph!',
      date: 'June 15, 2024',
      excerpt: 'A fantastic day of friendly competition and sunshine. Well done to all houses for their brilliant efforts...',
      image: 'https://placehold.co/600x400.png',
      imageHint: 'children sports'
    },
    {
      title: 'Year 6 Leavers Assembly',
      date: 'June 12, 2024',
      excerpt: 'We bid a fond farewell to our wonderful Year 6 pupils. We wish them all the best for secondary school...',
      image: 'https://placehold.co/600x400.png',
      imageHint: 'graduation cap'
    },
    {
      title: 'Book Fair Coming Soon',
      date: 'June 10, 2024',
      excerpt: 'Get ready for a world of adventure! The school book fair will be running from July 1st to July 5th...',
      image: 'https://placehold.co/600x400.png',
      imageHint: 'books library'
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] w-full bg-primary/10">
        <Image
          src="https://placehold.co/1600x900.png"
          alt="A vibrant classroom with children learning"
          data-ai-hint="school classroom"
          fill={true}
          style={{objectFit: 'cover'}}
          className="z-0"
        />
        <div className="absolute inset-0 bg-primary/50" />
        <div className="container relative z-10 flex h-full max-w-7xl flex-col items-center justify-center text-center text-primary-foreground">
          <h1 className="font-headline text-4xl font-bold md:text-6xl">
            Welcome to Maes Y Morfa
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl">
            A community-focused school nurturing a passion for lifelong learning.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/login">Parent Portal Login</Link>
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="font-headline text-3xl font-bold text-primary">About Our School</h2>
              <p className="mt-4 text-lg text-foreground/80">
                Maes Y Morfa is a vibrant, inclusive primary school where every child is valued. We believe in providing a stimulating and caring environment that enables all children to achieve their full potential. Our dedicated staff are committed to delivering a broad and balanced curriculum, fostering creativity, and encouraging a love of learning.
              </p>
              <Button variant="outline" className="mt-6">Learn More</Button>
            </div>
            <div className="relative h-80 w-full overflow-hidden rounded-lg shadow-xl">
                <Image src="https://placehold.co/600x400.png" alt="Happy students" data-ai-hint="happy students" fill={true} style={{objectFit: 'cover'}} />
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="bg-secondary py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="text-center font-headline text-3xl font-bold text-primary">Latest News & Highlights</h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((item, index) => (
              <Card key={index} className="overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                <CardHeader className="p-0">
                    <Image src={item.image} alt={item.title} data-ai-hint={item.imageHint} width={600} height={400} className="h-48 w-full object-cover" />
                </CardHeader>
                <CardContent className="p-6">
                  <p className="mb-2 text-sm text-muted-foreground">{item.date}</p>
                  <h3 className="mb-3 font-headline text-xl font-semibold">{item.title}</h3>
                  <p className="text-foreground/80">{item.excerpt}</p>
                  <Button variant="link" className="mt-4 p-0">Read More &rarr;</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features/Links Section */}
      <section id="links" className="py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-4">
           <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="text-center">
                  <CardHeader>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                          <CalendarDays className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="mt-4 font-headline">Events Calendar</CardTitle>
                      <CardDescription>Stay up to date with school events, holidays, and important dates.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button variant="secondary" className="mt-4 w-full">View Calendar</Button>
                  </CardContent>
              </Card>
              <Card className="text-center">
                  <CardHeader>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                          <Users className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="mt-4 font-headline">Our Team</CardTitle>
                      <CardDescription>Meet the dedicated staff who make our school special.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button variant="secondary" className="mt-4 w-full">Meet the Team</Button>
                  </CardContent>
              </Card>
              <Card className="text-center">
                  <CardHeader>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                          <Newspaper className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="mt-4 font-headline">Policies</CardTitle>
                      <CardDescription>Access important school policies and documentation.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button variant="secondary" className="mt-4 w-full">View Policies</Button>
                  </CardContent>
              </Card>
              <Card className="text-center">
                  <CardHeader>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                          <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="mt-4 font-headline">Contact Us</CardTitle>
                      <CardDescription>Get in touch with the school office for any enquiries.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button variant="secondary" className="mt-4 w-full">Get in Touch</Button>
                  </CardContent>
              </Card>
           </div>
        </div>
      </section>
    </>
  );
}
