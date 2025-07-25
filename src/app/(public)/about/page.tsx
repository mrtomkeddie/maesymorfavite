
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users, Heart, Sparkles } from "lucide-react";
import { useLanguage } from './../LanguageProvider';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const content = {
  en: {
    title: "A Warm Welcome to Maes Y Morfa Primary",
    intro1: "Maes Y Morfa is more than just a school; it’s a community where every child is seen, valued, and inspired to thrive. From their very first day, we are committed to nurturing a love of learning in a safe, happy, and ambitious environment.",
    intro2: "Our dedicated team works in partnership with families to support every child’s journey. We believe in building confidence, encouraging curiosity, and celebrating every achievement, big or small.",
    valuesTitle: "Our Values",
    values: [
        { icon: Heart, title: "Every Child Valued", text: "We tailor our approach to meet the unique needs of every learner." },
        { icon: Sparkles, title: "Curiosity Encouraged", text: "Our vibrant curriculum inspires questions, exploration, and discovery." },
        { icon: Users, title: "Community Spirit", text: "We foster strong, supportive links between pupils, staff, and families." },
    ],
    dayInLifeTitle: "A Day in the Life",
    dayInLifeText: "A typical day at Maes Y Morfa is buzzing with energy. It begins with a warm welcome at the school gates, moves into engaging lessons that spark imagination, and includes plenty of time for play and friendship. From collaborative projects in the classroom to adventures in our outdoor spaces, every moment is an opportunity to learn and grow.",
    teamTitle: "Meet Our Team",
    teamIntro: "Click each group to see staff members.",
    teamNote: "Staff photos are updated regularly. Please contact the school office for the most up-to-date information.",
    ctaTitle: "Want to see for yourself?",
    ctaText: "The best way to experience Maes Y Morfa is to visit us. We’d love to show you around.",
    ctaButton: "Arrange a Visit"
  },
  cy: {
    title: "Croeso Cynnes i Ysgol Gynradd Maes Y Morfa",
    intro1: "Mae Maes Y Morfa yn fwy na dim ond ysgol; mae'n gymuned lle mae pob plentyn yn cael ei weld, ei werthfawrogi, a'i ysbrydoli i ffynnu. O'u diwrnod cyntaf un, rydym wedi ymrwymo i feithrin cariad at ddysgu mewn amgylchedd diogel, hapus ac uchelgeisiol.",
    intro2: "Mae ein tîm ymroddedig yn gweithio mewn partneriaeth â theuluoedd i gefnogi taith pob plentyn. Credwn mewn magu hyder, annog chwilfrydedd, a dathlu pob llwyddiant, mawr a bach.",
    valuesTitle: "Ein Gwerthoedd",
    values: [
        { icon: Heart, title: "Gwerthfawrogi Pob Plentyn", text: "Rydym yn teilwra ein dull i ddiwallu anghenion unigryw pob dysgwr." },
        { icon: Sparkles, title: "Annog Chwilfrydedd", text: "Mae ein cwricwlwm bywiog yn ysbrydoli cwestiynau, archwilio, a darganfod." },
        { icon: Users, title: "Ysbryd Cymunedol", text: "Rydym yn meithrin cysylltiadau cryf, cefnogol rhwng disgyblion, staff, a theuluoedd." },
    ],
    dayInLifeTitle: "Diwrnod ym Mywyd",
    dayInLifeText: "Mae diwrnod arferol ym Maes Y Morfa yn llawn egni. Mae'n dechrau gyda chroeso cynnes wrth giatiau'r ysgol, yn symud ymlaen i wersi diddorol sy'n tanio'r dychymyg, ac yn cynnwys digon o amser i chwarae a chyfeillgarwch. O brosiectau cydweithredol yn yr ystafell ddosbarth i anturiaethau yn ein mannau awyr agored, mae pob eiliad yn gyfle i ddysgu a thyfu.",
    teamTitle: "Cwrdd â'n Tîm",
    teamIntro: "Cliciwch ar bob grŵp i weld aelodau'r staff.",
    teamNote: "Mae lluniau staff yn cael eu diweddaru'n rheolaidd. Cysylltwch â swyddfa'r ysgol am y wybodaeth ddiweddaraf.",
    ctaTitle: "Am weld drosoch eich hun?",
    ctaText: "Y ffordd orau o brofi Maes Y Morfa yw ymweld â ni. Byddem wrth ein bodd yn eich tywys o gwmpas.",
    ctaButton: "Trefnu Ymweliad"
  }
};

const teams = {
  en: [
    { name: "Leadership Team", members: [
        { name: "Jane Morgan", role: "Headteacher", imageHint: "woman headteacher portrait" },
        { name: "Alex Evans", role: "Deputy Head", imageHint: "man teacher portrait" },
        { name: "Ceri Lloyd", role: "SENCo", imageHint: "woman teacher friendly" },
    ]},
    { name: "Nursery & Reception", members: [ { name: "David Williams", role: "Teacher", imageHint: "man teacher classroom" } ]},
    { name: "Year 1", members: [ { name: "Sarah Davies", role: "Teacher", imageHint: "woman teacher primary" } ]},
    { name: "Year 2", members: [ { name: "Tomos Jones", role: "Teacher", imageHint: "man teacher smiling" } ]},
    { name: "Year 3", members: [ { name: "Emily Roberts", role: "Teacher", imageHint: "woman teacher books" } ]},
    { name: "Year 4", members: [ { name: "Megan Phillips", role: "Teacher", imageHint: "teacher portrait" } ]},
    { name: "Year 5", members: [ { name: "Owain Thomas", role: "Teacher", imageHint: "man teacher diverse" } ]},
    { name: "Year 6", members: [ { name: "Ffion Hughes", role: "Teacher", imageHint: "woman teacher outside" } ]},
    { name: "Support Staff", members: [
        { name: "Mark Phillips", role: "Office Manager", imageHint: "man administrator office" },
        { name: "Rhiannon Price", role: "Teaching Assistant", imageHint: "woman teaching assistant" },
    ]},
  ],
  cy: [
    { name: "Tîm Arweinyddiaeth", members: [
        { name: "Jane Morgan", role: "Pennaeth", imageHint: "woman headteacher portrait" },
        { name: "Alex Evans", role: "Dirprwy Bennaeth", imageHint: "man teacher portrait" },
        { name: "Ceri Lloyd", role: "Cydlynydd AAA", imageHint: "woman teacher friendly" },
    ]},
    { name: "Meithrin a Derbyn", members: [ { name: "David Williams", role: "Athro", imageHint: "man teacher classroom" } ]},
    { name: "Blwyddyn 1", members: [ { name: "Sarah Davies", role: "Athrawes", imageHint: "woman teacher primary" } ]},
    { name: "Blwyddyn 2", members: [ { name: "Tomos Jones", role: "Athro", imageHint: "man teacher smiling" } ]},
    { name: "Blwyddyn 3", members: [ { name: "Emily Roberts", role: "Athrawes", imageHint: "woman teacher books" } ]},
    { name: "Blwyddyn 4", members: [ { name: "Megan Phillips", role: "Athrawes", imageHint: "teacher portrait" } ]},
    { name: "Blwyddyn 5", members: [ { name: "Owain Thomas", role: "Athro", imageHint: "man teacher diverse" } ]},
    { name: "Blwyddyn 6", members: [ { name: "Ffion Hughes", role: "Athrawes", imageHint: "woman teacher outside" } ]},
    { name: "Staff Cymorth", members: [
        { name: "Mark Phillips", role: "Rheolwr Swyddfa", imageHint: "man administrator office" },
        { name: "Rhiannon Price", role: "Cynorthwyydd Addysgu", imageHint: "woman teaching assistant" },
    ]},
  ]
};

export default function AboutPage() {
  const { language } = useLanguage();
  const t = content[language];
  const teamData = teams[language];

  return (
    <div className="bg-background">
        <section className="w-full py-16 md:py-24">
            <div className="container mx-auto max-w-5xl px-8 space-y-16">
                
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-foreground md:text-6xl">
                        {t.title}
                    </h1>
                    <div className="mt-6 prose prose-lg max-w-none text-foreground/90 mx-auto">
                        <p>{t.intro1}</p>
                        <p>{t.intro2}</p>
                    </div>
                </div>

                <div className="text-center">
                    <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-foreground mb-8">{t.valuesTitle}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {t.values.map(value => {
                            const Icon = value.icon;
                            return (
                                <Card key={value.title} className="bg-secondary/30 border-0 text-center shadow-lg rounded-2xl">
                                    <CardHeader className="items-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                                            <Icon className="h-8 w-8" />
                                        </div>
                                        <CardTitle className="font-headline text-2xl">{value.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{value.text}</p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-foreground mb-4">{t.dayInLifeTitle}</h2>
                        <p className="text-foreground/80">{t.dayInLifeText}</p>
                    </div>
                    <Image src="https://i.postimg.cc/J7JTBSnT/aboutus.png" alt="Children learning in a classroom" width={500} height={400} className="object-contain w-full aspect-video md:aspect-[5/4]" />
                </div>

                <div>
                    <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-foreground mb-4 text-center">{t.teamTitle}</h2>
                    <p className="text-center text-muted-foreground mb-8">{t.teamIntro}</p>
                    <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
                        {teamData.map((group, index) => (
                           <AccordionItem value={`item-${index}`} key={group.name}>
                               <AccordionTrigger className="text-xl font-bold">{group.name}</AccordionTrigger>
                               <AccordionContent>
                                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
                                       {group.members.map(member => (
                                           <div key={member.name} className="text-center">
                                                <Image src="https://placehold.co/250x250.png" data-ai-hint={member.imageHint} alt={`Portrait of ${member.name}`} width={250} height={250} className="rounded-full object-cover aspect-square shadow-lg mx-auto mb-4" />
                                                <h3 className="font-bold text-lg">{member.name}</h3>
                                                <p className="text-sm text-primary">{member.role}</p>
                                            </div>
                                       ))}
                                   </div>
                               </AccordionContent>
                           </AccordionItem>
                        ))}
                    </Accordion>
                    <p className="text-center text-sm text-muted-foreground mt-8">{t.teamNote}</p>
                </div>

                <div className="text-center bg-secondary/30 rounded-2xl p-8 md:p-12">
                    <h2 className="font-headline text-3xl font-extrabold tracking-tighter text-foreground">{t.ctaTitle}</h2>
                    <p className="mt-2 max-w-xl mx-auto text-foreground/80">{t.ctaText}</p>
                    <Button asChild size="lg" className="mt-6">
                        <Link href="/contact">{t.ctaButton}</Link>
                    </Button>
                </div>

            </div>
        </section>
    </div>
  );
}
