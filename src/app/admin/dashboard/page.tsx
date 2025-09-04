
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Calendar, Users, FileText, Settings, BookUser, Users2, ArrowRight, Lightbulb, TrendingUp, Loader2, Megaphone } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from 'framer-motion';
import { db } from "@/lib/db";
import { useLanguage } from "@/app/(public)/LanguageProvider";

const content = {
    en: {
        welcome: "Welcome Back!",
        description: "This is your content management system. Select a topic below for a quick guide.",
        stats: {
            pupils: "Total Pupils",
            parents: "Parent Accounts",
            documents: "Documents",
        },
        howTo: {
            title: "How to Use This Dashboard",
            description: "Click a topic below to see a step-by-step guide. For full management, use the navigation menu on the left.",
        },
        guide: {
            titleSuffix: "Guide",
            instructions: "Instructions",
            tipTitle: "Good to know",
            goTo: "Go to {topic} page",
        },
        topics: [
            { id: 'announcement', title: 'Announcements', icon: Megaphone, href: '/admin/announcements',
              instructions: [
                "Go to the 'Announcements' page from the sidebar.",
                "Click the 'Add Announcement' button.",
                "Fill in a title.",
                "To make a calendar event, add a date.",
                "To make a news post, add some body text.",
                "To create both, fill in all fields.",
                "Check 'Urgent' for a homepage banner alert."
              ],
              tip: "You can create a news post, a calendar event, or both from the same form. Just fill in the relevant fields!"
            },
            { id: 'staff', title: 'Staff Directory', icon: Users, href: '/admin/staff',
              instructions: [
                "Go to the 'Staff' page.",
                "Click 'Add Staff Member' to open the staff form.",
                "Enter the staff member's name, role, and assign them to a team (e.g., Leadership, Year 1).",
                "You can also add a short bio and upload a profile photo.",
                "Click 'Add Staff' to add them to the public 'About Us' page."
              ],
              tip: "If a staff photo appears stretched, make sure the original image is square (e.g., 500x500 pixels) before uploading."
            },
            { id: 'parents', title: 'Parent Accounts', icon: Users2, href: '/admin/parents',
              instructions: [
                "Go to the 'Users' > 'Parents' page.",
                "Click 'Add Parent' to create a new parent account.",
                "Fill in the parent's name and email address.",
                "In the 'Linked Children' section, search for and select the children associated with this parent.",
                "Specify the relationship for each linked child (e.g., Mother, Guardian).",
                "Click 'Add Parent' to save the account."
              ],
              tip: "A parent cannot log in until their account has been created here. Ensure the email address is correct as this is their username."
            },
            { id: 'children', title: 'Child Profiles', icon: BookUser, href: '/admin/children',
              instructions: [
                "Navigate to 'Users' > 'Children'.",
                "Click 'Enrol Child' to add a new student.",
                "Enter the child's name and select their year group.",
                "You can either link them to an existing parent or add a new parent directly from this form.",
                "Click 'Enrol Child' to create the profile."
              ],
              tip: "To move all children to the next year group at the end of the school year, use the 'Promote Year Groups' button."
            },
            { id: 'documents', title: 'Documents', icon: FileText, href: '/admin/documents',
              instructions: [
                "Go to the 'Documents' page.",
                "Click 'Upload Document'.",
                "Give the document a clear title and select a category (e.g., Policy, Newsletter).",
                "Upload the PDF file.",
                "Click 'Upload Document'. It will now be available in the Parent Portal."
              ],
              tip: "Documents are available in the 'Key Information' section of the public website and Parent Portal."
            },
            { id: 'settings', title: 'Site Settings', icon: Settings, href: '/admin/settings',
              instructions: [
                "Go to the 'System' > 'Site Settings' page.",
                "Update the school's address, phone number, and public email.",
                "You can also add or update links to your social media pages.",
                "Click 'Save Settings' to update this information across the public website."
              ],
              tip: "Changes to the school's address or phone number in Settings will automatically update the website's footer and Contact Us page."
            },
        ]
    },
    cy: {
        welcome: "Croeso'n ôl!",
        description: "Dyma eich system rheoli cynnwys. Dewiswch bwnc isod am ganllaw cyflym.",
        stats: {
            pupils: "Cyfanswm Disgyblion",
            parents: "Cyfrifon Rhieni",
            documents: "Dogfennau",
        },
        howTo: {
            title: "Sut i Ddefnyddio'r Dangosfwrdd Hwn",
            description: "Cliciwch bwnc isod i weld canllaw cam wrth gam. Ar gyfer rheolaeth lawn, defnyddiwch y ddewislen ar y chwith.",
        },
        guide: {
            titleSuffix: " Canllaw",
            instructions: "Cyfarwyddiadau",
            tipTitle: "Da gwybod",
            goTo: "Ewch i dudalen {topic}",
        },
        topics: [
            { id: 'announcement', title: 'Cyhoeddiadau', icon: Megaphone, href: '/admin/announcements',
              instructions: [
                "Ewch i'r dudalen 'Cyhoeddiadau' o'r bar ochr.",
                "Cliciwch y botwm 'Ychwanegu Cyhoeddiad'.",
                "Llenwch deitl.",
                "I greu digwyddiad calendr, ychwanegwch ddyddiad.",
                "I greu cofnod newyddion, ychwanegwch rywfaint o destun corff.",
                "I greu'r ddau, llenwch yr holl feysydd.",
                "Ticiwch 'Brys' am rybudd baner ar y dudalen gartref."
              ],
              tip: "Gallwch greu cofnod newyddion, digwyddiad calendr, neu'r ddau o'r un ffurflen. Llenwch y meysydd perthnasol!"
            },
            { id: 'staff', title: 'Cyfeirlyfr Staff', icon: Users, href: '/admin/staff',
              instructions: [
                "Ewch i'r dudalen 'Staff'.",
                "Cliciwch 'Ychwanegu Aelod o Staff' i agor y ffurflen staff.",
                "Rhowch enw'r aelod o staff, ei rôl, a'i aseinio i dîm (e.e., Arweinyddiaeth, Blwyddyn 1).",
                "Gallwch hefyd ychwanegu bywgraffiad byr a llwytho llun proffil i fyny.",
                "Cliciwch 'Ychwanegu Staff' i'w hychwanegu at y dudalen gyhoeddus 'Amdanom Ni'."
              ],
              tip: "Os yw llun staff yn ymddangos wedi'i ymestyn, gwnewch yn siŵr bod y ddelwedd wreiddiol yn sgwâr (e.e., 500x500 picsel) cyn ei llwytho i fyny."
            },
            { id: 'parents', title: 'Cyfrifon Rhieni', icon: Users2, href: '/admin/parents',
              instructions: [
                "Ewch i'r dudalen 'Defnyddwyr' > 'Rhieni'.",
                "Cliciwch 'Ychwanegu Rhiant' i greu cyfrif rhiant newydd.",
                "Llenwch enw a chyfeiriad e-bost y rhiant.",
                "Yn yr adran 'Plant Cysylltiedig', chwiliwch am a dewiswch y plant sy'n gysylltiedig â'r rhiant hwn.",
                "Nodwch y berthynas ar gyfer pob plentyn cysylltiedig (e.e., Mam, Gwarcheidwad).",
                "Cliciwch 'Ychwanegu Rhiant' i gadw'r cyfrif."
              ],
              tip: "Ni all rhiant fewngofnodi nes bod ei gyfrif wedi'i greu yma. Sicrhewch fod y cyfeiriad e-bost yn gywir gan mai hwn yw eu henw defnyddiwr."
            },
            { id: 'children', title: 'Proffiliau Plant', icon: BookUser, href: '/admin/children',
              instructions: [
                "Llywiwch i 'Defnyddwyr' > 'Plant'.",
                "Cliciwch 'Cofrestru Plentyn' i ychwanegu myfyriwr newydd.",
                "Rhowch enw'r plentyn a dewiswch ei grŵp blwyddyn.",
                "Gallwch naill ai eu cysylltu â rhiant presennol neu ychwanegu rhiant newydd yn uniongyrchol o'r ffurflen hon.",
                "Cliciwch 'Cofrestru Plentyn' i greu'r proffil."
              ],
              tip: "I symud pob plentyn i'r grŵp blwyddyn nesaf ar ddiwedd y flwyddyn ysgol, defnyddiwch y botwm 'Dyrchafu Grwpiau Blwyddyn'."
            },
            { id: 'documents', title: 'Dogfennau', icon: FileText, href: '/admin/documents',
              instructions: [
                "Ewch i'r dudalen 'Dogfennau'.",
                "Cliciwch 'Llwytho Dogfen i Fyny'.",
                "Rhowch deitl clir i'r ddogfen a dewiswch gategori (e.e., Polisi, Cylchlythyr).",
                "Llwythwch y ffeil PDF i fyny.",
                "Cliciwch 'Llwytho Dogfen i Fyny'. Bydd nawr ar gael yn Porth y Rieni."
              ],
              tip: "Mae dogfennau ar gael yn yr adran 'Gwybodaeth Allweddol' ar y wefan gyhoeddus ac ym Mhorth y Rieni."
            },
            { id: 'settings', title: 'Gosodiadau Gwefan', icon: Settings, href: '/admin/settings',
              instructions: [
                "Ewch i'r dudalen 'System' > 'Gosodiadau Gwefan'.",
                "Diweddarwch gyfeiriad, rhif ffôn, ac e-bost cyhoeddus yr ysgol.",
                "Gallwch hefyd ychwanegu neu ddiweddaru dolenni i'ch tudalennau cyfryngau cymdeithasol.",
                "Cliciwch 'Cadw Gosodiadau' i ddiweddaru'r wybodaeth hon ar draws y wefan gyhoeddus."
              ],
              tip: "Bydd newidiadau i gyfeiriad neu rif ffôn yr ysgol yn y Gosodiadau yn diweddaru troedyn y wefan a'r dudalen Cysylltu â Ni yn awtomatig."
            },
        ]
    }
}


type Stat = {
    label: string;
    value: number | null;
    icon: React.ElementType;
}

export default function AdminDashboardPage() {
    const { language } = useLanguage();
    const t = content[language];
    const managementTopics = t.topics;

    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [stats, setStats] = useState<{label: string, value: number | null, icon: React.ElementType}[]>([
        { label: t.stats.pupils, value: null, icon: BookUser },
        { label: t.stats.parents, value: null, icon: Users2 },
        { label: t.stats.documents, value: null, icon: FileText },
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [pupilCount, parentCount, documentCount] = await Promise.all([
                    db.getCollectionCount('children'),
                    db.getCollectionCount('parents'),
                    db.getCollectionCount('documents'),
                ]);
                setStats([
                    { label: t.stats.pupils, value: pupilCount, icon: BookUser },
                    { label: t.stats.parents, value: parentCount, icon: Users2 },
                    { label: t.stats.documents, value: documentCount, icon: FileText },
                ]);
            } catch (error) {
                console.error("Failed to fetch collection counts:", error);
                // Keep values as null to show loading state or error
            }
        };

        fetchStats();
    }, [t.stats.pupils, t.stats.parents, t.stats.documents]);

    const activeTopic = managementTopics.find(t => t.id === selectedTopic);

    return (
        <div className="space-y-6">
             <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">{t.welcome}</h1>
                <p className="text-muted-foreground">{t.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map(stat => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {stat.value === null ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>


             <Card>
                <CardHeader>
                    <CardTitle>{t.howTo.title}</CardTitle>
                    <CardDescription>
                        {t.howTo.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {managementTopics.map((topic) => {
                            const Icon = topic.icon;
                            return (
                                <Button 
                                    key={topic.id} 
                                    variant={selectedTopic === topic.id ? "secondary" : "outline"} 
                                    onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                                    className="p-4 h-auto flex flex-col items-start justify-start text-left"
                                >
                                    <Icon className="h-6 w-6 mb-2 text-primary" />
                                    <span className="font-semibold">{topic.title}</span>
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <AnimatePresence>
            {activeTopic && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    <Card className="bg-secondary/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <activeTopic.icon className="h-5 w-5 text-primary"/>
                                {activeTopic.title} {t.guide.titleSuffix}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">{t.guide.instructions}</h3>
                                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                    {activeTopic.instructions.map((step, index) => (
                                        <li key={index}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                            {activeTopic.tip && (
                                <div className="p-3 rounded-md bg-background/50 border border-primary/20">
                                    <div className="flex items-start gap-3">
                                        <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-primary">{t.guide.tipTitle}</h4>
                                            <p className="text-sm text-muted-foreground">{activeTopic.tip}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="pt-2">
                                <Button asChild variant="link" className="p-0">
                                    <Link href={activeTopic.href}>
                                        {t.guide.goTo.replace('{topic}', activeTopic.title)} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}
