import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, BookOpen, HeartHandshake, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className="space-y-6">
                <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-foreground md:text-7xl">
                  Welcome to Maes Y Morfa Primary
                </h1>
                <p className="max-w-md text-lg text-foreground/80">
                  A thriving school community where every child is valued, inspired, and given the confidence to succeed.
                </p>
                 <p className="max-w-md text-lg text-foreground/80">
                  See how we champion every pupil’s journey—from first steps to new horizons.
                </p>
                <div className="flex gap-4">
                    <Button size="lg">Discover Our School <ArrowRight /></Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/login">Parent Portal</Link>
                    </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                    <Image src="https://placehold.co/600x400.png" data-ai-hint="children playing" alt="Happy children playing in the schoolyard" width={600} height={400} className="rounded-2xl object-cover aspect-[4/3]" />
                </div>
                <div className="col-span-2 md:col-span-1 space-y-4">
                    <Card className="bg-secondary rounded-2xl">
                        <CardHeader className="p-6">
                            <CardTitle className="text-5xl font-bold">300+</CardTitle>
                            <CardDescription>Happy Learners</CardDescription>
                        </CardHeader>
                    </Card>
                     <Card className="bg-background rounded-2xl">
                         <CardHeader className="p-6">
                            <Image src="https://placehold.co/600x400.png" data-ai-hint="classroom" alt="A bright and modern classroom" width={600} height={400} className="rounded-lg object-cover w-full h-auto" />
                        </CardHeader>
                    </Card>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="who-we-help" className="w-full py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-8">
            <div className="text-center mb-12">
                <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl">
                    Where Every Child Thrives
                </h2>
            </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group overflow-hidden rounded-2xl border-2 border-accent bg-accent/50 shadow-sm transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-inner">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-headline text-2xl font-bold">Our Mission</h3>
                    </div>
                     <CardDescription className="mt-4">
                        We build confident, curious learners—ready for tomorrow’s world.
                     </CardDescription>
                </CardHeader>
              <CardContent>
                <div className="aspect-video w-full overflow-hidden">
                    <Image src="https://placehold.co/600x400.png" alt="A child focused on a creative task" data-ai-hint="child learning" width={600} height={400} className="h-full w-full rounded-lg object-cover transition-transform group-hover:scale-105" />
                </div>
              </CardContent>
            </Card>
            <Card className="group overflow-hidden rounded-2xl border-2 border-transparent bg-background shadow-sm transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary shadow-inner">
                            <HeartHandshake className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-headline text-2xl font-bold">Caring Community</h3>
                    </div>
                     <CardDescription className="mt-4">
                       Respect, kindness, and support are at the heart of everything we do.
                     </CardDescription>
                </CardHeader>
              <CardContent>
                <div className="aspect-video w-full overflow-hidden">
                    <Image src="https://placehold.co/600x400.png" alt="Children working together on a project" data-ai-hint="children collaborating" width={600} height={400} className="h-full w-full rounded-lg object-cover transition-transform group-hover:scale-105" />
                </div>
              </CardContent>
            </Card>
            <Card className="group overflow-hidden rounded-2xl border-2 border-transparent bg-background shadow-sm transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary shadow-inner">
                            <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-headline text-2xl font-bold">Creative Curriculum</h3>
                    </div>
                     <CardDescription className="mt-4">
                       Inspiring lessons, hands-on learning, and room for every talent to shine.
                     </CardDescription>
                </CardHeader>
              <CardContent>
                <div className="aspect-video w-full overflow-hidden">
                    <Image src="https://placehold.co/600x400.png" alt="A school book open to a colourful page" data-ai-hint="school book" width={600} height={400} className="h-full w-full rounded-lg object-cover transition-transform group-hover:scale-105" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

        {/* Login Prompt Section */}
        <section className="w-full py-16 md:py-24">
            <div className="container mx-auto max-w-4xl px-8 text-center">
                 <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl">
                    Are you a Maes Y Morfa parent?
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
                    Log in to MorfaConnect to check your child’s progress, report absences, and get the latest updates—quickly and securely.
                </p>
                <Button asChild size="lg" className="mt-8">
                    <Link href="/login">Go to Parent Portal</Link>
                </Button>
            </div>
        </section>
    </div>
  );
}
