import { useLanguage } from '@/contexts/LanguageProvider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Shirt, Utensils, ArrowRight, Clock } from "lucide-react";
import { Link } from 'react-router-dom';
// Replace unified manager with split sections component
import { HomepageContent } from '@/components/ui/HomepageContent';
import { UrgentBanner } from '@/components/ui/UrgentBanner';
import { getHomepageContent } from '@/lib/homepageContent';
import { format } from 'date-fns';

const content = {
  en: {
    hero: {
      title: 'Welcome to Ysgol Maes Y Morfa Primary School',
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
    events: {
      heading: 'Upcoming Events',
      viewCalendar: 'View Full Calendar'
    },
    cta: {
      heading: 'Are you a Maes Y Morfa parent?',
      body: 'Log in to the Parent Portal to check your child\'s progress, report absences, and get the latest updates—quickly and securely.',
      button: 'Go to Parent Portal'
    }
  },
  cy: {
    hero: {
      title: 'Croeso i Ysgol Gynradd Maes Y Morfa',
      subtitle: 'Ysgol ofalgar, uchelgeisiol lle mae pob plentyn yn cael ei werthfawrogi a\'i ysbrydoli.',
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
    events: {
      heading: 'Digwyddiadau i Ddod',
      viewCalendar: 'Gweld y Calendr Llawn'
    },
    cta: {
      heading: 'Ydych chi\'n rhiant Maes Y Morfa?',
      body: 'Mewngofnodwch i\'r Porth Rieni i wirio cynnydd eich plentyn, riportio absenoldebau, a chael y diweddariadau diweddaraf—yn gyflym ac yn ddiogel.',
      button: 'Ewch i Borth Rieni'
    }
  }
};

export default function HomePage() {
  const { language } = useLanguage();
  const t = content[language];

  const { urgentAlert, prioritizedContent } = getHomepageContent();
  const eventItems = prioritizedContent.filter(i => i.type === 'event').slice(0, 3);

  return (
    <div className="bg-background">
      {/* Full-width Urgent Banner at the very top of page content */}
      {urgentAlert && (
        <div className="bg-background">
          <UrgentBanner post={urgentAlert} />
        </div>
      )}

      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center text-center text-white overflow-hidden">
        <img
          src="https://i.postimg.cc/RFZsjTxj/Chat-GPT-Image-Jul-25-2025-08-43-22-AM.png"
          alt="A vibrant classroom with children learning"
          className="absolute inset-0 z-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="relative z-20 container mx-auto max-w-4xl px-8">
            <h1 className="font-headline text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl">
                {t.hero.title}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-white/90 md:text-xl">
                {t.hero.subtitle}
            </p>
            <div className="mt-8">
                <Button size="lg" asChild>
                    <Link to="/about">{t.hero.button}</Link>
                </Button>
            </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-7xl px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    {/* Left column: Latest News only */}
                    <HomepageContent showUrgentBanner={false} showEvents={false} />
                </div>
                <div className="lg:col-span-1">
                    {/* Right column: Key Information + Upcoming Events */}
                    <div>
                        <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tighter text-foreground mb-6">
                            {t.keyInfo.heading}
                        </h2>
                        <div className="space-y-3 mb-10">
                            {t.keyInfo.buttons.map(button => {
                                const IconComponent = button.icon;
                                return (
                                    <Card key={button.label} className="bg-background shadow-sm border hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                             <Link to={button.href} className="flex items-center justify-between">
                                                 <div className="flex items-center gap-3">
                                                     <IconComponent className="h-5 w-5 text-primary" />
                                                     <span className="text-left font-medium">{button.label}</span>
                                                 </div>
                                                 <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                             </Link>
                                         </CardContent>
                                     </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upcoming Events list */}
                    <div>
                      <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tighter text-foreground mb-6">
                        {t.events.heading}
                      </h2>
                      {eventItems.length > 0 ? (
                        <Card className="bg-background shadow-sm border">
                           <CardContent className="p-0">
                             <ul className="divide-y">
                               {eventItems.map((item) => (
                                 <li key={item.id} className="p-6">
                                   <div className="flex gap-4 items-start">
                                       <div className="min-w-14 text-center">
                                         <div className="text-lg font-bold">{format(item.date, 'dd')}</div>
                                         <div className="text-xs uppercase">{format(item.date, 'MMM')}</div>
                                       </div>
                                       <div className="flex-grow">
                                         <h3 className="font-semibold text-sm leading-tight mb-1">
                                           {language === 'cy' ? item.title_cy : item.title_en}
                                         </h3>
                                         {item.start && (
                                           <p className="text-xs text-muted-foreground flex items-center gap-1">
                                             <Clock className="h-3 w-3" />
                                             {format(new Date(item.start), 'p')}
                                           </p>
                                         )}
                                       </div>
                                   </div>
                                 </li>
                               ))}
                             </ul>
                           </CardContent>
                         </Card>
                       ) : (
                        <Card className="bg-background shadow-sm border">
                           <CardContent className="p-6">
                             <p className="text-muted-foreground">No upcoming events.</p>
                           </CardContent>
                         </Card>
                       )}

                       <div className="mt-6">
                        <Button asChild variant="outline" size="sm">
                           <Link to="/calendar">{t.events.viewCalendar}</Link>
                         </Button>
                       </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

        {/* Login Prompt Section */}
        <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground">
            <div className="container mx-auto max-w-4xl px-8 text-center">
                 <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tighter">
                    {t.cta.heading}
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
                    {t.cta.body}
                </p>
                <Button asChild size="lg" variant="secondary" className="mt-8">
                    <Link to="/login">{t.cta.button}</Link>
                </Button>
            </div>
        </section>
    </div>
  );
}