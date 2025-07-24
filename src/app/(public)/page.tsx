
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
    strengths: {
      heading: 'What Makes Us Special',
      cards: [
        {
          icon: HeartHandshake,
          title: 'Caring, Experienced Staff',
          description: 'Our dedicated team is committed to creating a supportive and nurturing environment for every child.'
        },
        {
          icon: Sparkles,
          title: 'Support for Every Child',
          description: 'We tailor our approach to meet individual needs, ensuring every learner can achieve their full potential.'
        },
        {
          icon: BookOpen,
          title: 'Modern Curriculum',
          description: 'Our vibrant curriculum inspires a love of learning and prepares pupils for the challenges of tomorrow.'
        }
      ]
    },
    keyInfo: {
      heading: 'Key Information',
      note: 'Find key school documents and policies on our information page.',
      buttons: [
        { icon: Calendar, label: 'Term Dates', href: '/key-info' },
        { icon: Shirt, label: 'Uniform Policy', href: '/key-info' },
        { icon: Utensils, label: 'Lunch Menu', href: '/key-info' }
      ]
    },
    latestNews: {
      heading: 'Latest News',
      readMore: 'Read More',
      viewAll: 'View All News'
    },
    proof: {
      quote: "300+ happy learners. Proud to serve Llanelli’s families."
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
      subtitle: 'Ysgol ofalgar, uchelgeisiol lle mae pob plentyn yn cael ei werthfawrogi a’i ysbrydoli.',
      button: 'Archwiliwch Ein Hysgol'
    },
    strengths: {
      heading: 'Beth Sy\'n Ein Gwneud Ni\'n Arbennig',
      cards: [
        {
          icon: HeartHandshake,
          title: 'Staff Gofalgar, Profiadol',
          description: 'Mae ein tîm ymroddedig wedi ymrwymo i greu amgylchedd cefnogol a meithringar i bob plentyn.'
        },
        {
          icon: Sparkles,
          title: 'Cefnogaeth i Bob Plentyn',
          description: 'Rydym yn teilwra ein dull i ddiwallu anghenion unigol, gan sicrhau y gall pob dysgwr gyflawni ei lawn botensial.'
        },
        {
          icon: BookOpen,
          title: 'Cwricwlwm Modern',
          description: 'Mae ein cwricwlwm bywiog yn ysbrydoli cariad at ddysgu ac yn paratoi disgyblion ar gyfer heriau yfory.'
        }
      ]
    },
    keyInfo: {
      heading: 'Gwybodaeth Allweddol',
      note: 'Dewch o hyd i ddogfennau a pholisïau allweddol yr ysgol ar ein tudalen wybodaeth.',
      buttons: [
        { icon: Calendar, label: 'Dyddiadau Tymor', href: '/key-info' },
        { icon: Shirt, label: 'Polisi Gwisg Ysgol', href: '/key-info' },
        { icon: Utensils, label: 'Bwydlen Ginio', href: '/key-info' }
      ]
    },
    latestNews: {
        heading: 'Newyddion Diweddaraf',
        readMore: 'Darllen Mwy',
        viewAll: 'Gweld Pob Newyddion'
    },
    proof: {
        quote: "300+ o ddysgwyr hapus. Yn falch o wasanaethu teuluoedd Llanelli."
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
      <section className="w-full py-16 md:py-24 lg:py-32">
        <div className="container mx-auto max-w-7xl px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className="space-y-6 text-center lg:text-left">
                <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-foreground sm:text-6xl md:text-7xl">
                  {t.hero.title}
                </h1>
                <p className="max-w-xl mx-auto lg:mx-0 text-lg text-foreground/80 md:text-xl">
                  {t.hero.subtitle}
                </p>
                <div className="flex justify-center lg:justify-start">
                    <Button size="lg" asChild>
                        <Link href="/about">{t.hero.button}</Link>
                    </Button>
                </div>
              </div>
              <div className="w-full">
                <Image src="https://placehold.co/600x400.png" data-ai-hint="happy children school" alt="Happy children learning in a bright school environment" width={600} height={400} className="rounded-2xl object-cover w-full aspect-video lg:aspect-[4/3] shadow-lg" />
              </div>
            </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="w-full py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-8">
          <div className="text-center mb-12">
            <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl">
              {t.latestNews.heading}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </section>

      {/* Key Info Section */}
       <section className="w-full py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto max-w-5xl px-8">
             <div className="text-center mb-12">
                <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl">
                    {t.keyInfo.heading}
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {t.keyInfo.buttons.map((button) => {
                    const Icon = button.icon;
                    return (
                        <Button key={button.label} variant="outline" size="lg" className="h-auto py-6 text-lg bg-background" asChild>
                           <Link href={button.href}>
                                <Icon className="mr-4 h-6 w-6"/> {button.label}
                           </Link>
                        </Button>
                    )
                })}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">{t.keyInfo.note}</p>
        </div>
      </section>

      {/* Social Proof Section */}
       <section className="w-full py-16 md:py-24">
        <div className="container mx-auto max-w-4xl px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">
                 <div className="md:col-span-1">
                    <Image src="https://placehold.co/400x400.png" data-ai-hint="school building entrance" alt="Maes Y Morfa school building" width={400} height={400} className="rounded-full object-cover aspect-square shadow-lg mx-auto" />
                 </div>
                 <div className="md:col-span-2 text-center md:text-left">
                    <blockquote className="text-2xl font-semibold text-foreground md:text-3xl lg:text-4xl italic">
                        "{t.proof.quote}"
                    </blockquote>
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
