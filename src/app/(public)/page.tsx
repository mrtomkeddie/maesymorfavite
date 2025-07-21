
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, BookOpen, HeartHandshake, Sparkles, Newspaper } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { UrgentBanner } from '@/components/ui/UrgentBanner';
import { news as mockNews, UrgentNewsPost } from '@/lib/mockNews';

const content = {
  en: {
    hero: {
      title: 'Welcome to Maes Y Morfa Primary',
      subtitle: 'A thriving school community where every child is valued, inspired, and given the confidence to succeed.',
      body: 'See how we champion every pupil’s journey—from first steps to new horizons.',
      button1: 'Discover Our School',
      button2: 'Parent Portal'
    },
    stats: {
        title: 'Happy Learners'
    },
    features: {
      heading: 'Where Every Child Thrives',
      mission: {
        title: 'Our Mission',
        description: 'We build confident, curious learners—ready for tomorrow’s world.'
      },
      community: {
        title: 'Caring Community',
        description: 'Respect, kindness, and support are at the heart of everything we do.'
      },
      curriculum: {
        title: 'Our Curriculum',
        description: 'Inspiring lessons, hands-on learning, and room for every talent to shine.'
      },
      learnMoreButton: 'Learn More About Our Curriculum'
    },
    latestNews: {
      heading: 'Latest News',
      readMore: 'Read More',
      viewAll: 'View All News'
    },
    cta: {
      heading: 'Are you a Maes Y Morfa parent?',
      body: 'Log in to MorfaConnect to check your child’s progress, report absences, and get the latest updates—quickly and securely.',
      button: 'Go to Parent Portal'
    }
  },
  cy: {
    hero: {
      title: 'Croeso i Ysgol Gynradd Maes Y Morfa',
      subtitle: 'Cymuned ysgol fywiog lle mae pob plentyn yn cael ei werthfawrogi, ei ysbrydoli, ac yn cael y hyder i lwyddo.',
      body: 'Gweler sut rydym yn meithrin taith pob disgybl—o’r camau cyntaf i orwelion newydd.',
      button1: 'Darganfod Ein Hysgol',
      button2: 'Porth Rieni'
    },
    stats: {
        title: 'Disgyblion hapus'
    },
    features: {
      heading: 'Lle mae pob plentyn yn ffynnu',
      mission: {
        title: 'Ein Cenhadaeth',
        description: 'Rydym yn meithrin dysgwyr hyderus, chwilfrydig—yn barod ar gyfer byd yfory.'
      },
      community: {
        title: 'Cymuned Ofalgar',
        description: 'Mae parch, caredigrwydd a chefnogaeth wrth galon popeth a wnawn.'
      },
      curriculum: {
        title: 'Ein Cwricwlwm',
        description: 'Gwersi ysbrydoledig, dysgu ymarferol, a lle i bob talent ddisgleirio.'
      },
      learnMoreButton: 'Dysgwch Fwy am Ein Cwricwlwm'
    },
    latestNews: {
        heading: 'Newyddion Diweddaraf',
        readMore: 'Darllen Mwy',
        viewAll: 'Gweld Pob Newyddion'
    },
    cta: {
      heading: 'Ydych chi’n rhiant Maes Y Morfa?',
      body: 'Mewngofnodwch i MorfaConnect i wirio cynnydd eich plentyn, riportio absenoldebau, a chael y diweddariadau diweddaraf—yn gyflym ac yn ddiogel.',
      button: 'Ewch i Borth Rieni'
    }
  }
};


export default function HomePage() {
  const { language } = useLanguage();
  const t = content[language];
  const latestNews = mockNews.filter(n => n.published).slice(0, 3);
  const urgentNews: UrgentNewsPost | undefined = mockNews.find(p => p.isUrgent && p.published) as UrgentNewsPost;

  return (
    <div className="bg-background">
      {urgentNews && <UrgentBanner post={urgentNews} />}

      {/* Hero Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className="space-y-6">
                <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-foreground md:text-7xl">
                  {t.hero.title}
                </h1>
                <p className="max-w-md text-lg text-foreground/80">
                  {t.hero.subtitle}
                </p>
                 <p className="max-w-md text-lg text-foreground/80">
                   {t.hero.body}
                </p>
                <div className="flex gap-4">
                    <Button size="lg">{t.hero.button1} <ArrowRight /></Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/login">{t.hero.button2}</Link>
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
                            <CardDescription>{t.stats.title}</CardDescription>
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
      <section className="w-full py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-8">
            <div className="text-center mb-12">
                <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl">
                    {t.features.heading}
                </h2>
            </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/about" className="block group">
              <Card className="overflow-hidden rounded-2xl border-2 border-accent bg-accent/50 shadow-sm transition-all h-full hover:border-primary/50 hover:shadow-lg">
                  <CardHeader>
                      <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-inner">
                              <Sparkles className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="font-headline text-2xl font-bold">{t.features.mission.title}</h3>
                      </div>
                       <CardDescription className="mt-4">
                          {t.features.mission.description}
                       </CardDescription>
                  </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full overflow-hidden">
                      <Image src="https://placehold.co/600x400.png" alt="A child focused on a creative task" data-ai-hint="child learning" width={600} height={400} className="h-full w-full rounded-lg object-cover transition-transform group-hover:scale-105" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/about" className="block group">
              <Card className="overflow-hidden rounded-2xl border-2 border-transparent bg-background shadow-sm transition-all h-full hover:border-primary/50 hover:shadow-lg">
                  <CardHeader>
                      <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary shadow-inner">
                              <HeartHandshake className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="font-headline text-2xl font-bold">{t.features.community.title}</h3>
                      </div>
                       <CardDescription className="mt-4">
                         {t.features.community.description}
                       </CardDescription>
                  </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full overflow-hidden">
                      <Image src="https://placehold.co/600x400.png" alt="Children working together on a project" data-ai-hint="children collaborating" width={600} height={400} className="h-full w-full rounded-lg object-cover transition-transform group-hover:scale-105" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/curriculum" className="block group">
              <Card className="overflow-hidden rounded-2xl border-2 border-transparent bg-background shadow-sm transition-all h-full hover:border-primary/50 hover:shadow-lg">
                  <CardHeader>
                      <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary shadow-inner">
                              <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="font-headline text-2xl font-bold">{t.features.curriculum.title}</h3>
                      </div>
                       <CardDescription className="mt-4">
                         {t.features.curriculum.description}
                       </CardDescription>
                  </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full overflow-hidden">
                      <Image src="https://placehold.co/600x400.png" alt="A school book open to a colourful page" data-ai-hint="school book" width={600} height={400} className="h-full w-full rounded-lg object-cover transition-transform group-hover:scale-105" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
           <div className="text-center mt-12">
            <Button asChild size="lg">
                <Link href="/curriculum">{t.features.learnMoreButton}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-8">
          <div className="text-center mb-12">
            <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl">
              {t.latestNews.heading}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {latestNews.map((post) => (
              <Card key={post.id} className="flex flex-col">
                <CardHeader>
                  <span className="text-sm text-muted-foreground">{new Date(post.date).toLocaleDateString(language === 'cy' ? 'cy-GB' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <CardTitle className="text-xl font-bold">{post[`title_${language}`]}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground line-clamp-3">{post[`body_${language}`].substring(0, 150)}...</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button asChild variant="link" className="p-0">
                    <Link href={`/news/${post.slug}`}>{t.latestNews.readMore} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
                <Link href="/news">{t.latestNews.viewAll}</Link>
            </Button>
          </div>
        </div>
      </section>

        {/* Login Prompt Section */}
        <section className="w-full py-16 md:py-24 bg-secondary/30">
            <div className="container mx-auto max-w-4xl px-8 text-center">
                 <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl">
                    {t.cta.heading}
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
                    {t.cta.body}
                </p>
                <Button asChild size="lg" className="mt-8">
                    <Link href="/login">{t.cta.button}</Link>
                </Button>
            </div>
        </section>
    </div>
  );
}
