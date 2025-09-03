import { useLanguage } from '../contexts/LanguageProvider';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from 'react-router-dom';

const content = {
  en: {
    title: "Beyond the Classroom",
    intro: "Enriching the curriculum through outdoor learning, educational trips, and a wide variety of after-school clubs. Details coming soon.",
    back: "Back to Curriculum Overview",
  },
  cy: {
    title: "Y Tu Hwnt i'r Ystafell Ddosbarth",
    intro: "Cyfoethogi'r cwricwlwm drwy ddysgu yn yr awyr agored, teithiau addysgol, ac amrywiaeth eang o glybiau ar ôl ysgol. Manylion yn dod yn fuan.",
    back: "Yn ôl i'r Trosolwg Cwricwlwm",
  }
};

export default function BeyondTheClassroomPage() {
    const { language } = useLanguage();
    const t = content[language];

    return (
        <div className="bg-background">
            <section className="w-full py-16 md:py-24">
                <div className="container mx-auto max-w-4xl px-8 space-y-8">
                    
                    <div className="mb-8">
                         <Link to="/curriculum" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
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
