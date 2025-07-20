import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, BookOpen, GraduationCap, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="container mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-foreground md:text-7xl">
              Experts in education services & software
            </h1>
            <p className="max-w-md text-lg text-foreground/80">
              Together, our MAT and school software and services give you the whole picture, with expert teams on hand to support you when you need it.
            </p>
            <div className="flex gap-4">
                <Button size="lg">Explore our solutions <ArrowRight /></Button>
                <Button size="lg" variant="outline">Contact us</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
                <Image src="https://placehold.co/600x400.png" data-ai-hint="teacher students" alt="Teachers and students collaborating" width={600} height={400} className="rounded-2xl object-cover aspect-[4/3]" />
            </div>
            <div className="col-span-2 md:col-span-1 space-y-4">
                <Card className="bg-secondary rounded-2xl">
                    <CardHeader className="p-6">
                        <CardTitle className="text-5xl font-bold">14K+</CardTitle>
                        <CardDescription>Schools</CardDescription>
                    </CardHeader>
                </Card>
                 <Card className="bg-background rounded-2xl">
                     <CardHeader className="p-6">
                        <Image src="https://placehold.co/600x400.png" data-ai-hint="student smiling" alt="A smiling student" width={600} height={400} className="rounded-lg object-cover w-full h-auto" />
                    </CardHeader>
                </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Who we help Section */}
      <section id="who-we-help" className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-12">
                <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl">
                    Who we help
                </h2>
            </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group overflow-hidden rounded-2xl border-2 border-accent bg-accent/50 shadow-sm transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-inner">
                            <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-headline text-2xl font-bold">Primary schools</h3>
                    </div>
                     <CardDescription className="mt-4">
                        We are the UK's leading provider of MIS for primary schools, helping you to make sense of your data and manage your school with confidence.
                     </CardDescription>
                </CardHeader>
              <CardContent>
                <div className="aspect-video w-full overflow-hidden">
                    <Image src="https://placehold.co/600x400.png" alt="Primary school children in a classroom" data-ai-hint="primary school" width={600} height={400} className="h-full w-full rounded-lg object-cover transition-transform group-hover:scale-105" />
                </div>
              </CardContent>
            </Card>
            <Card className="group overflow-hidden rounded-2xl border-2 border-transparent bg-background shadow-sm transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary shadow-inner">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-headline text-2xl font-bold">Secondary schools</h3>
                    </div>
                     <CardDescription className="mt-4">
                       Our solutions help secondary schools to track student progress, manage behaviour and communicate effectively with parents.
                     </CardDescription>
                </CardHeader>
              <CardContent>
                <div className="aspect-video w-full overflow-hidden">
                    <Image src="https://placehold.co/600x400.png" alt="Secondary school students working" data-ai-hint="secondary school" width={600} height={400} className="h-full w-full rounded-lg object-cover transition-transform group-hover:scale-105" />
                </div>
              </CardContent>
            </Card>
            <Card className="group overflow-hidden rounded-2xl border-2 border-transparent bg-background shadow-sm transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary shadow-inner">
                            <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-headline text-2xl font-bold">MATs</h3>
                    </div>
                     <CardDescription className="mt-4">
                       Gain a trust-wide view of your data to drive improvement, ensure consistency and streamline reporting across your schools.
                     </CardDescription>
                </CardHeader>
              <CardContent>
                <div className="aspect-video w-full overflow-hidden">
                    <Image src="https://placehold.co/600x400.png" alt="People in a professional meeting" data-ai-hint="professional meeting" width={600} height={400} className="h-full w-full rounded-lg object-cover transition-transform group-hover:scale-105" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

        {/* Login Prompt Section */}
        <section className="py-16 md:py-24">
            <div className="container mx-auto max-w-4xl px-4 text-center">
                 <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl">
                    Already a customer?
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
                    Log in to the parent portal to view your child's progress, report absences, and stay up-to-date with school news.
                </p>
                <Button asChild size="lg" className="mt-8">
                    <Link href="/login">Parent Portal Login</Link>
                </Button>
            </div>
        </section>
    </div>
  );
}
