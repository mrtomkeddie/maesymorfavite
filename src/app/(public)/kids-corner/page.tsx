
'use client';

import { useLanguage } from '../LanguageProvider';
import { Gamepad2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

const content = {
  en: {
    title: "Kids' Corner",
    intro: "Welcome to the fun zone! Get ready to play some cool games.",
    gameTitle: "Morfa Runner",
  },
  cy: {
    title: "Cornel y Plant",
    intro: "Croeso i'r ardal hwyl! Byddwch yn barod i chwarae gemau cŵl.",
    gameTitle: "Rhedwr Morfa",
  }
};

const GameDescription = ({ lang }: { lang: 'en' | 'cy' }) => {
    if (lang === 'cy') {
        return (
            <div className="prose prose-sm max-w-none text-muted-foreground mb-6">
                <h2>Croeso i Redwr Morfa! 🏃‍♂️</h2>
                <p>
                    Helpwch ein myfyriwr o Ysgol Maes Y Morfa i rasio drwy dir yr ysgol! Neidiwch dros rwystrau fel
                    <Image src="/morfa-runner/images/books.png" alt="Llyfrau" width="40" height="40" className="inline-block mx-1 align-middle" />,
                    <Image src="/morfa-runner/images/bag.png" alt="Bag Ysgol" width="40" height="40" className="inline-block mx-1 align-middle" />,
                    a hyd yn oed
                    <Image src="/morfa-runner/images/teacher.png" alt="Athro" width="50" height="50" className="inline-block mx-1 align-middle" /> wrth gasglu <Image src="/morfa-runner/images/values.png" alt="Gwerthoedd" width="40" height="40" className="inline-block mx-1 align-middle" /> am bwyntiau bonws!
                </p>
                <p><strong>Pwyswch SPACE i neidio a gweld pa mor bell y gallwch chi redeg!</strong></p>
            </div>
        )
    }
    return (
       <div className="prose prose-sm max-w-none text-muted-foreground mb-6">
          <h2>Welcome to Morfa Runner! 🏃‍♂️</h2>
          <p>
            Help our Ysgol Maes Y Morfa student race through the school grounds! Jump over obstacles like
            <Image src="/morfa-runner/images/books.png" alt="Books" width="40" height="40" className="inline-block mx-1 align-middle" />,
            <Image src="/morfa-runner/images/bag.png" alt="School Bag" width="40" height="40" className="inline-block mx-1 align-middle" />,
            and even
            <Image src="/morfa-runner/images/teacher.png" alt="Teacher" width="50" height="50" className="inline-block mx-1 align-middle" /> while collecting <Image src="/morfa-runner/images/values.png" alt="Values" width="40" height="40" className="inline-block mx-1 align-middle" /> for bonus points!
          </p>
          <p><strong>Press SPACE to jump and see how far you can run!</strong></p>
        </div>
    )
}

export default function KidsCornerPage() {
    const { language } = useLanguage();
    const t = content[language];

    return (
        <div className="bg-background">
            <section className="w-full py-16 md:py-24">
                <div className="container mx-auto max-w-4xl px-8 space-y-12">
                    
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <Gamepad2 className="h-12 w-12" />
                            </div>
                        </div>
                        <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-foreground md:text-6xl">
                            {t.title}
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
                           {t.intro}
                        </p>
                    </div>

                    <Card className="bg-secondary/30">
                        <CardHeader>
                            <CardTitle>{t.gameTitle}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GameDescription lang={language} />
                            <div className="aspect-[900/400] w-full bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                <iframe 
                                    src="/morfa-runner/index.html" 
                                    className="w-full h-full border-0"
                                    title="Morfa Runner Game"
                                ></iframe>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </section>
        </div>
    );
}
