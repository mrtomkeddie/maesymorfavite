
'use client';

import { useLanguage } from '../LanguageProvider';
import { Gamepad2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const content = {
  en: {
    title: "Kids' Corner",
    intro: "Welcome to the fun zone! Get ready to play some cool games.",
    gameTitle: "Morfa Runner",
    gameText: "Run, jump, and collect school values certificates in this exciting endless runner set right here at Maes Y Morfa! Use the spacebar to jump and double-jump.",
  },
  cy: {
    title: "Cornel y Plant",
    intro: "Croeso i'r ardal hwyl! Byddwch yn barod i chwarae gemau cŵl.",
    gameTitle: "Rhedwr Morfa",
    gameText: "Rhedwch, neidiwch, a chasglwch dystysgrifau gwerthoedd yr ysgol yn y rhedwr diddiwedd cyffrous hwn sydd wedi'i osod yma ym Maes Y Morfa! Defnyddiwch y bar gofod i neidio a neidio dwbl.",
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
                            <p className="text-muted-foreground mb-6">{t.gameText}</p>
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
