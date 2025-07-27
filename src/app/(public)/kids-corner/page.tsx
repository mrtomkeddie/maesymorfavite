
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
    howToPlay: "How to Play",
    instructions: "Help our Ysgol Maes Y Morfa student race through the school grounds! Jump over obstacles and collect values for bonus points.",
    controls: "Press SPACE to jump, and again in mid-air for a double jump!",
    gameElements: "In the game:",
    elements: [
      { name: 'Jump over the Books', image: 'books.png' },
      { name: 'Dodge the School Bag', image: 'bag.png' },
      { name: 'Avoid Mrs Jones!', image: 'teacher.png' },
      { name: 'Collect the School Values', image: 'values.png' },
    ]
  },
  cy: {
    title: "Cornel y Plant",
    intro: "Croeso i'r ardal hwyl! Byddwch yn barod i chwarae gemau cŵl.",
    gameTitle: "Rhedwr Morfa",
    howToPlay: "Sut i Chwarae",
    instructions: "Helpwch ein myfyriwr o Ysgol Maes Y Morfa i rasio drwy dir yr ysgol! Neidiwch dros rwystrau a chasglu gwerthoedd am bwyntiau bonws.",
    controls: "Pwyswch SPACE i neidio, ac eto yn yr awyr am naid ddwbl!",
    gameElements: "Yn y gêm:",
    elements: [
      { name: 'Neidio dros y Llyfrau', image: 'books.png' },
      { name: 'Osgowch y Bag Ysgol', image: 'bag.png' },
      { name: 'Osgowch Mrs Jones!', image: 'teacher.png' },
      { name: 'Casglwch Werthoedd yr Ysgol', image: 'values.png' },
    ]
  }
};

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
                            <div className="grid md:grid-cols-2 gap-8 mb-6">
                                <div>
                                    <h3 className="font-bold text-lg mb-2">{t.howToPlay}</h3>
                                    <p className="text-muted-foreground">{t.instructions}</p>
                                    <p className="text-muted-foreground mt-2"><strong>{t.controls}</strong></p>
                                </div>
                                <div className="border-t md:border-t-0 md:border-l pl-0 md:pl-8 pt-6 md:pt-0">
                                    <h3 className="font-bold text-lg mb-3">{t.gameElements}</h3>
                                    <div className="space-y-3">
                                        {t.elements.map(item => (
                                            <div key={item.name} className="flex items-center gap-4">
                                                <Image src={`/morfa-runner/images/${item.image}`} alt={item.name} width={40} height={40} className="object-contain" />
                                                <span className="text-muted-foreground font-medium">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
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
