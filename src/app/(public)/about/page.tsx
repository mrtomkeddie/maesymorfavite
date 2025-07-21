
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Users, Building, Eye } from "lucide-react";
import { useLanguage } from './../LanguageProvider';

const content = {
  en: {
    title: "About Maes Y Morfa Primary",
    intro1: "Maes Y Morfa Primary is a welcoming and inclusive school serving the community of Llanelli. We are proud to champion every pupil’s journey—nurturing confidence, curiosity, and respect from their very first steps through to new horizons.",
    intro2: "We believe in high expectations for every child and support our learners with a caring, experienced staff team, a vibrant curriculum, and strong links with our families and community.",
    visionTitle: "Our Vision",
    vision: "Every child valued. Every talent celebrated. Every learner inspired to thrive.",
    teamTitle: "Our Team",
    staffTitle: "Staff",
    headteacher: "Headteacher: Jane Morgan",
    deputyHead: "Deputy Head: Alex Evans",
    teachers: "Teachers: Sarah Davies, Tom Rees, Laura Price",
    assistants: "Teaching Assistants: Bethan Hughes, Ceri Lloyd",
    admin: "Admin: Mark Phillips",
    governorsTitle: "Governors",
    chair: "Chair: Susan Thomas",
    viceChair: "Vice Chair: Peter Williams",
    parentGovernor: "Parent Governor: Emily James",
    communityGovernor: "Community Governor: Brian Lewis",
    contactTitle: "Contact Us",
    address: "Maes Y Morfa Primary School, School Road, Llanelli, SA15 1EX",
    phone: "01234 567890",
    email: "admin@maesymorfa.cymru"
  },
  cy: {
    title: "Amdanom Ysgol Gynradd Maes Y Morfa",
    intro1: "Mae Ysgol Gynradd Maes Y Morfa yn ysgol groesawgar a chynhwysol sy'n gwasanaethu cymuned Llanelli. Rydym yn falch o hyrwyddo taith pob disgybl—gan feithrin hyder, chwilfrydedd, a pharch o'u camau cyntaf un hyd at orwelion newydd.",
    intro2: "Credwn mewn disgwyliadau uchel i bob plentyn a chefnogwn ein dysgwyr gyda thîm staff gofalgar a phrofiadol, cwricwlwm bywiog, a chysylltiadau cryf â'n teuluoedd a'n cymuned.",
    visionTitle: "Ein Gweledigaeth",
    vision: "Pob plentyn yn cael ei werthfawrogi. Pob talent yn cael ei ddathlu. Pob dysgwr yn cael ei ysbrydoli i ffynnu.",
    teamTitle: "Ein Tîm",
    staffTitle: "Staff",
    headteacher: "Pennaeth: Jane Morgan",
    deputyHead: "Dirprwy Bennaeth: Alex Evans",
    teachers: "Athro/Athrawesau: Sarah Davies, Tom Rees, Laura Price",
    assistants: "Cynorthwywyr Addysgu: Bethan Hughes, Ceri Lloyd",
    admin: "Gweinyddiaeth: Mark Phillips",
    governorsTitle: "Llywodraethwyr",
    chair: "Cadeirydd: Susan Thomas",
    viceChair: "Is-gadeirydd: Peter Williams",
    parentGovernor: "Llywodraethwr Rhiant: Emily James",
    communityGovernor: "Llywodraethwr Cymunedol: Brian Lewis",
    contactTitle: "Cysylltu â Ni",
    address: "Ysgol Gynradd Maes Y Morfa, Heol Ysgol, Llanelli, SA15 1EX",
    phone: "01234 567890",
    email: "admin@maesymorfa.cymru"
  }
};

export default function AboutPage() {
  const { language } = useLanguage();
  const t = content[language];

  return (
    <div className="bg-background">
        <section className="w-full py-16 md:py-24">
            <div className="container mx-auto max-w-4xl px-8 space-y-12">
                
                <div className="text-center">
                    <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-foreground md:text-6xl">
                        {t.title}
                    </h1>
                </div>

                <div className="prose prose-lg max-w-none text-foreground/90">
                    <p>{t.intro1}</p>
                    <p>{t.intro2}</p>
                </div>

                <Card className="bg-secondary/30 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                            <Eye className="h-6 w-6 text-primary" />
                            {t.visionTitle}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <blockquote className="text-xl font-semibold text-foreground border-l-4 border-primary pl-4 italic">
                            {t.vision}
                        </blockquote>
                    </CardContent>
                </Card>

                <div>
                    <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-foreground mb-6 text-center">{t.teamTitle}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <Users className="h-6 w-6 text-primary" />
                                    {t.staffTitle}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-muted-foreground">
                                <p><strong>{t.headteacher.split(':')[0]}:</strong> {t.headteacher.split(':')[1]}</p>
                                <p><strong>{t.deputyHead.split(':')[0]}:</strong> {t.deputyHead.split(':')[1]}</p>
                                <p><strong>{t.teachers.split(':')[0]}:</strong> {t.teachers.split(':')[1]}</p>
                                <p><strong>{t.assistants.split(':')[0]}:</strong> {t.assistants.split(':')[1]}</p>
                                <p><strong>{t.admin.split(':')[0]}:</strong> {t.admin.split(':')[1]}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <Building className="h-6 w-6 text-primary" />
                                    {t.governorsTitle}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-muted-foreground">
                                <p><strong>{t.chair.split(':')[0]}:</strong> {t.chair.split(':')[1]}</p>
                                <p><strong>{t.viceChair.split(':')[0]}:</strong> {t.viceChair.split(':')[1]}</p>
                                <p><strong>{t.parentGovernor.split(':')[0]}:</strong> {t.parentGovernor.split(':')[1]}</p>
                                <p><strong>{t.communityGovernor.split(':')[0]}:</strong> {t.communityGovernor.split(':')[1]}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl text-center">{t.contactTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground space-y-4">
                        <div className="flex items-center justify-center gap-3">
                            <MapPin className="h-5 w-5 text-primary" />
                            <span>{t.address}</span>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <Phone className="h-5 w-5 text-primary" />
                            <a href={`tel:${t.phone}`} className="hover:underline">{t.phone}</a>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <Mail className="h-5 w-5 text-primary" />
                            <a href={`mailto:${t.email}`} className="hover:underline">{t.email}</a>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </section>
    </div>
  );
}
