
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, BookOpen, HeartHandshake, Sparkles, Newspaper, Calendar, Shirt, Utensils } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { UrgentBanner } from '@/components/ui/UrgentBanner';
import { news as mockNews, UrgentNewsPost } from '@/lib/mockNews';

const content = {
  en: {
    hero: {
      title: 'Welcome to Maes Y Morfa Primary School',
      subtitle: 'A caring, ambitious school where every child is valued and inspired.',
      button: 'Explore Our School'
    },
    keyInfo: {
      heading: 'Key Information',
      buttons: [
        { icon: Calendar, label: 'Term Dates', href: '/key-info', docCategory: 'Term Dates' },
        { icon: Shirt, label: 'Uniform Policy', href: '/key-info', docCategory: 'Uniform' },
        { icon: Utensils, label: 'Lunch Menu', href: '/key-info', docCategory: 'Lunch Menu' }
      ]
    },
    latestNews: {
      heading: 'Latest News',
      readMore: 'Read More',
      viewAll: 'View All News'
    },
    cta: {
      heading: 'Are you a Maes Y Morfa parent?',
      body: 'Log in to the Parent Portal to check your child’s progress, report absences, and get the latest updates—quickly and securely.',
      button: 'Go to Parent Portal'
    }
  },
  cy: {
    hero: {
      title: 'Croeso i Ysgol Gynradd Maes Y Morfa',
      subtitle: 'Ysgol ofalgar, uchelgeisiol lle mae pob plentyn yn cael ei werthfawrogi a’i ysbrydoli.',
      button: 'Archwiliwch Ein Hysgol'
    },
    keyInfo: {
      heading: 'Gwybodaeth Allweddol',
      buttons: [
        { icon: Calendar, label: 'Dyddiadau Tymor', href: '/key-info', docCategory: 'Term Dates' },
        { icon: Shirt, label: 'Polisi Gwisg Ysgol', href: '/key-info', docCategory: 'Uniform' },
        { icon: Utensils, label: 'Bwydlen Ginio', href: '/key-info', docCategory: 'Lunch Menu' }
      ]
    },
    latestNews: {
        heading: 'Newyddion Diweddaraf',
        readMore: 'Darllen Mwy',
        viewAll: 'Gweld Pob Newyddion'
    },
    cta: {
      heading: 'Ydych chi’n rhiant Maes Y Morfa?',
      body: 'Mewngofnodwch i\'r Porth Rieni i wirio cynnydd eich plentyn, riportio absenoldebau, a chael y diweddariadau diweddaraf—yn gyflym ac yn ddiogel.',
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
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white overflow-hidden">
        <Image
          src="https://i.postimg.cc/RFZsjTxj/Chat-GPT-Image-Jul-25-2025-08-43-22-AM.png"
          alt="A vibrant classroom with children learning"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0"
          data-ai-hint="vibrant classroom learning"
        />
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="relative z-20 container mx-auto max-w-4xl px-8">
            <h1 className="font-headline text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl">
                {t.hero.title}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-white/90 md:text-xl">
                {t.hero.subtitle}
            </p>
            <div className="mt-8">
                <Button size="lg" asChild>
                    <Link href="/about">{t.hero.button}</Link>
                </Button>
            </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-8">
           <div className="text-center mb-12">
              <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl">
                {t.latestNews.heading}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {latestNews.map((post) => {
                  const plainBody = post[`body_${language}`].replace(/<[^>]*>?/gm, '');
                  return (
                      <Card key={post.id} className="flex flex-col bg-background/70 shadow-lg border-0">
                      <CardHeader>
                          <span className="text-sm text-muted-foreground">{new Date(post.date).toLocaleDateString(language === 'cy' ? 'cy-GB' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          <CardTitle className="text-xl font-bold">{post[`title_${language}`]}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                          <p className="text-muted-foreground line-clamp-3">{plainBody.substring(0, 150)}...</p>
                      </CardContent>
                      <div className="p-6 pt-0">
                          <Button asChild variant="link" className="p-0">
                          <Link href={`/news/${post.slug}`}>{t.latestNews.readMore} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                          </Button>
                      </div>
                      </Card>
                  )
                })}
            </div>
            <div className="text-center mt-12">
                <Button asChild size="lg" variant="outline">
                    <Link href="/news">{t.latestNews.viewAll}</Link>
                </Button>
            </div>
            
            <div className="mt-24">
              <div className="text-center mb-8">
                <h2 className="font-headline text-3xl font-bold tracking-tighter text-foreground md:text-4xl">
                  {t.keyInfo.heading}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {t.keyInfo.buttons.map(button => {
                      const Icon = button.icon;
                      return (
                          <Card key={button.label} className="bg-background/70 shadow-lg border-0 text-center">
                            <CardContent className="p-6">
                              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                                <Icon className="h-6 w-6" />
                              </div>
                              <h3 className="font-semibold">{button.label}</h3>
                              <Button asChild variant="link" size="sm" className="mt-2">
                                <Link href={button.href}>{t.latestNews.readMore}</Link>
                              </Button>
                            </CardContent>
                          </Card>
                      )
                  })}
              </div>
            </div>
        </div>
      </section>

        {/* Login Prompt Section */}
        <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground">
            <div className="container mx-auto max-w-4xl px-8 text-center">
                 <h2 className="font-headline text-4xl font-extrabold tracking-tighter md:text-5xl">
                    {t.cta.heading}
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
                    {t.cta.body}
                </p>
                <Button asChild size="lg" variant="secondary" className="mt-8">
                    <Link href="/login">{t.cta.button}</Link>
                </Button>
            </div>
        </section>
    </div>
  );
}
