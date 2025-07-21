
'use client';

import { useLanguage } from '../../LanguageProvider';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';

const content = {
  en: {
    title: "Early Years (Nursery & Reception)",
    intro: "Our Early Years curriculum is designed to give children the best possible start to their school life. We focus on learning through play, exploration, and creative expression. Details coming soon.",
    back: "Back to Curriculum Overview",
  },
  cy: {
    title: "Blynyddoedd Cynnar (Meithrin a Derbyn)",
    intro: "Mae ein cwricwlwm Blynyddoedd Cynnar wedi'i gynllunio i roi'r dechrau gorau posibl i blant i'w bywyd ysgol. Rydym yn canolbwyntio ar ddysgu drwy chwarae, archwilio, a mynegiant creadigol. Manylion yn dod yn fuan.",
    back: "Yn ôl i'r Trosolwg Cwricwlwm",
  }
};

export default function EarlyYearsPage() {
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
