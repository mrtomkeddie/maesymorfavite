


import { useLanguage } from './../LanguageProvider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Calendar, Shirt, Utensils, ShieldCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import type { DocumentWithId } from '@/lib/types';

const content = {
  en: {
    title: "Key Information",
    intro: "Find essential information for parents, including term dates, uniform policies, and lunch menus.",
    termDates: {
      title: "Term Dates",
      body: "View the academic calendar for the current school year. Please note INSET days are subject to change.",
      button: "Download Term Dates"
    },
    uniform: {
      title: "School Uniform",
      body: "Our school uniform helps to create a sense of identity and pride. Please ensure your child comes to school in the correct uniform.",
      button: "View Uniform Policy"
    },
    lunchMenu: {
      title: "Lunch Menu",
      body: "We offer a rotating menu of healthy and delicious school lunches, prepared fresh on site.",
      button: "Download Lunch Menu"
    },
    policies: {
      title: "Statutory Policies",
      body: "Access our key statutory policies below.",
      links: [
        { label: "Safeguarding Policy", category: "Policy" },
        { label: "Privacy Policy", category: "Policy" },
        { label: "Complaints Procedure", category: "Policy" }
      ]
    },
    noDocument: "Document not available.",
  },
  cy: {
    title: "Gwybodaeth Allweddol",
    intro: "Dewch o hyd i wybodaeth hanfodol i rieni, gan gynnwys dyddiadau tymor, polisïau gwisg ysgol, a bwydlenni cinio.",
    termDates: {
      title: "Dyddiadau'r Tymor",
      body: "Gweler y calendr academaidd ar gyfer y flwyddyn ysgol gyfredol. Nodwch y gall diwrnodau HMS newid.",
      button: "Lawrlwytho Dyddiadau Tymor"
    },
    uniform: {
      title: "Gwisg Ysgol",
      body: "Mae ein gwisg ysgol yn helpu i greu ymdeimlad o hunaniaeth a balchder. Sicrhewch fod eich plentyn yn dod i'r ysgol yn y wisg gywir.",
      button: "Gweld y Polisi Gwisg Ysgol"
    },
    lunchMenu: {
      title: "Bwydlen Ginio",
      body: "Rydym yn cynnig bwydlen gylchdroi o giniawau ysgol iach a blasus, wedi'u paratoi'n ffres ar y safle.",
      button: "Lawrlwytho'r Fwydlen Ginio"
    },
    policies: {
      title: "Polisïau Statudol",
      body: "Cyrchwch ein polisïau statudol allweddol isod.",
      links: [
        { label: "Polisi Diogelu", category: "Policy" },
        { label: "Polisi Preifatrwydd", category: "Policy" },
        { label: "Gweithdrefn Cwynion", category: "Policy" }
      ]
    },
    noDocument: "Dogfen ddim ar gael.",
  }
};

type InfoCardData = {
  icon: React.ElementType;
  title: string;
  body: string;
  button: string;
  category: "Term Dates" | "Uniform" | "Lunch Menu";
};


export default function KeyInfoPage() {
    const { language } = useLanguage();
    const t = content[language];
    const [docs, setDocs] = useState<DocumentWithId[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        db.getDocuments().then((data) => {
            setDocs(data);
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setIsLoading(false);
        });
    }, []);

    const findDocUrl = (category: string) => docs.find(d => d.category === category)?.fileUrl;

    const infoCards: InfoCardData[] = [
        { icon: Calendar, title: t.termDates.title, body: t.termDates.body, button: t.termDates.button, category: "Term Dates" },
        { icon: Shirt, title: t.uniform.title, body: t.uniform.body, button: t.uniform.button, category: "Uniform" },
        { icon: Utensils, title: t.lunchMenu.title, body: t.lunchMenu.body, button: t.lunchMenu.button, category: "Lunch Menu" },
    ];
    
    const policyDocs = docs.filter(d => d.category === 'Policy');

    return (
        <div className="bg-background">
            <section className="w-full py-16 md:py-24">
                <div className="container mx-auto max-w-4xl px-8 space-y-12">

                    <div className="text-center">
                        <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-foreground md:text-6xl">
                            {t.title}
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
                           {t.intro}
                        </p>
                    </div>
                    {isLoading ? <div className="flex justify-center"><Loader2 className="animate-spin" /></div> : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {infoCards.map((card, index) => {
                                    const Icon = card.icon;
                                    const docUrl = findDocUrl(card.category);
                                    return (
                                        <Card key={index} className="flex flex-col">
                                            <CardHeader className="flex-row items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary shadow-inner flex-shrink-0">
                                                    <Icon className="h-6 w-6 text-primary" />
                                                </div>
                                                <CardTitle className="font-headline text-xl">{card.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex-grow">
                                                <p className="text-muted-foreground text-sm mb-4">{card.body}</p>
                                            </CardContent>
                                            <div className="p-6 pt-0">
                                                <Button className="w-full whitespace-normal h-auto py-2" asChild disabled={!docUrl}>
                                                    <a href={docUrl || "#"} download target="_blank" rel="noopener noreferrer">
                                                        <Download className="mr-2 h-4 w-4" />
                                                        {docUrl ? card.button : t.noDocument}
                                                    </a>
                                                </Button>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                                    <ShieldCheck className="h-6 w-6 text-primary" /> {t.policies.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-4">{t.policies.body}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {policyDocs.length > 0 ? policyDocs.map(link => (
                                            <Button asChild variant="outline" key={link.id}>
                                                <a href={link.fileUrl} target="_blank" rel="noopener noreferrer">
                                                    {link.title} <ExternalLink className="ml-2 h-4 w-4" />
                                                </a>
                                            </Button>
                                        )) : <p className="text-sm text-muted-foreground">{t.noDocument}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
