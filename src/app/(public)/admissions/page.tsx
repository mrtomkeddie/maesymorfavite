


import { useLanguage } from './../LanguageProvider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Download, ExternalLink, HelpCircle, School, Loader2 } from "lucide-react";
import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import type { SiteSettings } from '@/lib/types';

const content = {
  en: {
    title: "Admissions",
    subtitle: "Join Maes Y Morfa Primary School",
    intro: "We welcome applications for children of all backgrounds and abilities. If you are interested in joining our school, here’s how to get started:",
    howToApply: "How to Apply",
    step1Title: "1. Contact Us",
    step1Body: "Phone the school office or email us to arrange a visit or request an admissions pack.",
    step2Title: "2. Complete an Application Form",
    step2Body: "Download our application form below or collect one from the school office. Fill it in and return it to us—either by email, post, or in person.",
    downloadButton: "Download Application Form",
    step3Title: "3. Arrange a School Visit",
    step3Body: "We strongly encourage prospective parents and children to visit. You’ll meet staff, see our facilities, and ask any questions.",
    policyTitle: "Admissions Policy",
    policyBody: "We follow Carmarthenshire Local Authority’s admissions criteria. For detailed admissions criteria and procedures, see the link below.",
    policyLink: "Carmarthenshire LA Admissions",
    startingTitle: "Starting School",
    startingBody1: "Once your place is confirmed, we will contact you with a start date and induction details.",
    startingBody2: "If your child is joining part-way through the year, we’ll work with you to make the transition as smooth as possible.",
    helpTitle: "Need help?",
    helpBody: "Contact the school office—we're happy to answer any questions about the process."
  },
  cy: {
    title: "Derbyniadau",
    subtitle: "Ymunwch ag Ysgol Gynradd Maes Y Morfa",
    intro: "Rydym yn croesawu ceisiadau gan blant o bob cefndir a gallu. Os oes gennych ddiddordeb mewn ymuno â'n hysgol, dyma sut i ddechrau:",
    howToApply: "Sut i Ymgeisio",
    step1Title: "1. Cysylltwch â Ni",
    step1Body: "Ffoniwch swyddfa'r ysgol neu anfonwch e-bost atom i drefnu ymweliad neu ofyn am becyn derbyn.",
    step2Title: "2. Cwblhewch Ffurflen Gais",
    step2Body: "Lawrlwythwch ein ffurflen gais isod neu casglwch un o swyddfa'r ysgol. Llenwch hi a'i dychwelyd atom—naill ai drwy e-bost, post, neu'n bersonol.",
    downloadButton: "Lawrlwytho'r Ffurflen Gais",
    step3Title: "3. Trefnwch Ymweliad ag Ysgol",
    step3Body: "Rydym yn annog darpar rieni a phlant i ymweld. Byddwch yn cwrdd â staff, yn gweld ein cyfleusterau, ac yn gofyn unrhyw gwestiynau.",
    policyTitle: "Polisi Derbyniadau",
    policyBody: "Rydym yn dilyn meini prawf derbyn Awdurdod Lleol Sir Gaerfyrddin. Am feini prawf a gweithdrefnau derbyn manwl, gweler y ddolen isod.",
    policyLink: "Derbyniadau ALl Sir Gâr",
    startingTitle: "Dechrau'r Ysgol",
    startingBody1: "Unwaith y bydd eich lle wedi'i gadarnhau, byddwn yn cysylltu â chi gyda dyddiad dechrau a manylion ymsefydlu.",
    startingBody2: "Os yw'ch plentyn yn ymuno'n rhan-ffordd drwy'r flwyddyn, byddwn yn gweithio gyda chi i wneud y trosglwyddiad mor llyfn â phosibl.",
    helpTitle: "Angen cymorth?",
    helpBody: "Cysylltwch â swyddfa'r ysgol—rydym yn hapus i ateb unrhyw gwestiynau am y broses."
  }
};


export default function AdmissionsPage() {
    const { language } = useLanguage();
    const t = content[language];
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isSettingsLoading, setIsSettingsLoading] = useState(true);

    useEffect(() => {
        setIsSettingsLoading(true);
        db.getSiteSettings()
            .then(setSettings)
            .catch(console.error)
            .finally(() => setIsSettingsLoading(false));
    }, []);

    return (
        <div className="bg-background">
            <section className="w-full py-16 md:py-24">
                <div className="container mx-auto max-w-4xl px-8 space-y-12">

                    <div className="text-center">
                        <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-foreground md:text-6xl">
                            {t.title}
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
                           {t.subtitle}
                        </p>
                    </div>

                    <div className="prose prose-lg max-w-none text-foreground/90 text-center">
                        <p>{t.intro}</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-3xl">{t.howToApply}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-bold text-lg text-primary">{t.step1Title}</h3>
                                <p className="text-muted-foreground">{t.step1Body}</p>
                                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                     <Button variant="outline" asChild>
                                        <a href={`tel:${t.phone}`}><Phone className="mr-2 h-4 w-4"/>{t.phone}</a>
                                     </Button>
                                     <Button variant="outline" asChild>
                                        <a href={`mailto:${t.email}`}><Mail className="mr-2 h-4 w-4"/>{t.email}</a>
                                     </Button>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-primary">{t.step2Title}</h3>
                                <p className="text-muted-foreground">{t.step2Body}</p>
                                <div className="mt-2">
                                    <Button><Download className="mr-2 h-4 w-4"/>{t.downloadButton}</Button>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-primary">{t.step3Title}</h3>
                                <p className="text-muted-foreground">{t.step3Body}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-secondary/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                               <School className="h-6 w-6 text-primary" /> {t.policyTitle}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">{t.policyBody}</p>
                            <Button asChild variant="outline">
                                <a href="#" target="_blank" rel="noopener noreferrer">
                                    {t.policyLink} <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                             <CardTitle className="font-headline text-2xl">{t.startingTitle}</CardTitle>
                        </CardHeader>
                        <CardContent className="prose max-w-none text-muted-foreground">
                            <p>{t.startingBody1}</p>
                            <p>{t.startingBody2}</p>
                        </CardContent>
                    </Card>
                    
                     <div className="text-center border-t pt-8">
                        <HelpCircle className="mx-auto h-10 w-10 text-primary mb-2" />
                        <h3 className="font-headline text-2xl font-bold">{t.helpTitle}</h3>
                        <p className="text-muted-foreground mt-2">{t.helpBody}</p>
                         <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
                            {isSettingsLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading contact information...
                                </div>
                            ) : (
                                <>
                                    <Button asChild>
                                        <a href={`tel:${settings?.phone}`}><Phone className="mr-2 h-4 w-4"/>{settings?.phone || 'Phone not available'}</a>
                                    </Button>
                                    <Button asChild>
                                        <a href={`mailto:${settings?.email}`}><Mail className="mr-2 h-4 w-4"/>{settings?.email || 'Email not available'}</a>
                                    </Button>
                                </>
                            )}
                         </div>
                    </div>


                </div>
            </section>
        </div>
    );
}
