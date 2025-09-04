

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Calendar, Users, FileText, Settings, BookUser, Users2, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { useLanguage } from "@/contexts/LanguageProvider";


const content = {
    en: {
        welcome: "Welcome Back!",
        description: "This is your content management system. Select a topic below for a quick guide.",
        stats: {
            pupils: "Total Pupils",
            parents: "Parent Accounts",
            documents: "Documents",

        },

        quickActions: {
            title: "Quick Actions",
            description: "Jump directly to common tasks. Each page includes interactive tutorials to guide you.",
        },
        topics: [
            { title: 'Announcements' },
            { title: 'Staff Directory' },
            { title: 'Parent Accounts' },
            { title: 'Child Profiles' },
            { title: 'Documents' },
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

        quickActions: {
            title: "Gweithredoedd Cyflym",
            description: "Neidiwch yn uniongyrchol i dasgau cyffredin. Mae pob tudalen yn cynnwys tiwtorialau rhyngweithiol i'ch arwain.",
        },
        topics: [
            { title: 'Cyhoeddiadau' },
            { title: 'Cyfeirlyfr Staff' },
            { title: 'Cyfrifon Rhieni' },
            { title: 'Proffiliau Plant' },
            { title: 'Dogfennau' },
        ]
    }
}

type Stat = {
    label: string;
    value: number | null;
    icon: React.ElementType;
}

export default function AdminDashboard() {
    const { language } = useLanguage();
    const t = content[language];
    
    const quickActionItems = [
        { id: 'announcements', title: t.topics[0].title, description: language === 'en' ? 'Create announcements' : 'Creu cyhoeddiadau', icon: Newspaper, href: '/admin/announcements' },
        { id: 'staff', title: t.topics[1].title, description: language === 'en' ? 'Manage staff' : 'Rheoli staff', icon: Users, href: '/admin/staff' },
        { id: 'parents', title: t.topics[2].title, description: language === 'en' ? 'Add parent accounts' : 'Ychwanegu cyfrifon rhieni', icon: Users2, href: '/admin/parents' },
        { id: 'children', title: t.topics[3].title, description: language === 'en' ? 'Enrol students' : 'Cofrestru myfyrwyr', icon: BookUser, href: '/admin/children' },
        { id: 'documents', title: t.topics[4].title, description: language === 'en' ? 'Upload files' : 'Llwytho ffeiliau', icon: FileText, href: '/admin/documents' },
    ];

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
            }
        };

        fetchStats();
    }, [t.stats.pupils, t.stats.parents, t.stats.documents]);

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

            {/* Lifecycle section removed */}

             <Card>
                <CardHeader>
                    <CardTitle>{t.quickActions.title}</CardTitle>
                    <CardDescription>
                        {t.quickActions.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {quickActionItems.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Button 
                                    key={action.id} 
                                    asChild
                                    variant="outline"
                                    className="p-4 h-auto flex flex-col items-center justify-center text-center hover:bg-primary/5"
                                >
                                    <Link to={action.href}>
                                        <Icon className="h-8 w-8 mb-2 text-primary" />
                                        <span className="font-semibold text-sm">{action.title}</span>
                                        <span className="text-xs text-muted-foreground mt-1">{action.description}</span>
                                    </Link>
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
