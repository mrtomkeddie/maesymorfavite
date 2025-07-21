
'use client';

import { useLanguage } from '../../LanguageProvider';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';

const content = {
  en: {
    title: "Key Stage 1 (Years 1 & 2)",
    intro: "In Key Stage 1, we build upon the foundations of Early Years, developing core skills in reading, writing, and maths through a broad and engaging curriculum. Details coming soon.",
    back: "Back to Curriculum Overview",
  },
  cy: {
    title: "Cyfnod Allweddol 1 (Blynyddoedd 1 a 2)",
    intro: "Yng Nghyfnod Allweddol 1, rydym yn adeiladu ar sylfeini'r Blynyddoedd Cynnar, gan ddatblygu sgiliau craidd mewn darllen, ysgrifennu, a mathemateg drwy gwricwlwm eang a diddorol. Manylion yn dod yn fuan.",
    back: "Yn ôl i'r Trosolwg Cwricwlwm",
  }
};

export default function KeyStage1Page() {
    const { language } = useLanguage();
    const t = content[language];

    return (
        <div className="bg-background">
            <section className="w-full py-16 md:py-24">
                <div className="container mx-auto max-w-4xl px-8 space-y-8">
                    
                    <div className="mb-8">
                         <Link href="/curriculum" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" /> {t.back}
                         </Link>
                    </div>
                    
                    <div className="text-center">
                        <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-foreground md:text-6xl">
                            {t.title}
                        </h1>
                    </div>

                    <div className="prose prose-lg max-w-none text-foreground/90">
                        <p>{t.intro}</p>
                    </div>

                    {/* Placeholder for future content */}
                    <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Image/Content coming soon</p>
                    </div>

                </div>
            </section>
        </div>
    );
}
