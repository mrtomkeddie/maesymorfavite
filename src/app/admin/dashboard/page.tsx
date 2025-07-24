
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Calendar, Users, FileText, Settings, BookUser, Users2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from 'framer-motion';

const managementTopics = [
    { id: 'news', title: 'News & Alerts', icon: Newspaper, href: '/admin/news',
      instructions: [
        "1. Go to the 'News & Alerts' page from the sidebar.",
        "2. Click the 'Add News Post' button to open the form.",
        "3. Fill in the title and body content for the announcement.",
        "4. Mark it as 'Urgent' if it's a critical alert, like a school closure.",
        "5. Click 'Create Post' to publish it to the website."
      ]
    },
    { id: 'calendar', title: 'Calendar Events', icon: Calendar, href: '/admin/calendar',
       instructions: [
        "1. Navigate to the 'Calendar' section.",
        "2. Click 'Add Event' to create a new calendar entry.",
        "3. Enter the event title, select a date, and add a description.",
        "4. You can optionally attach a file, like a permission slip.",
        "5. Check 'Cross-post to News' to also create a news item for the event.",
        "6. Click 'Create Event' to save it."
      ]
    },
    { id: 'staff', title: 'Staff Directory', icon: Users, href: '/admin/staff',
      instructions: [
        "1. Go to the 'Staff' page.",
        "2. Click 'Add Staff Member' to open the staff form.",
        "3. Enter the staff member's name, role, and assign them to a team (e.g., Leadership, Year 1).",
        "4. You can also add a short bio and upload a profile photo.",
        "5. Click 'Add Staff' to add them to the public 'About Us' page."
      ]
    },
    { id: 'parents', title: 'Parent Accounts', icon: Users2, href: '/admin/parents',
      instructions: [
        "1. Go to the 'Users' > 'Parents' page.",
        "2. Click 'Add Parent' to create a new parent account.",
        "3. Fill in the parent's name and email address.",
        "4. In the 'Linked Children' section, search for and select the children associated with this parent.",
        "5. Specify the relationship for each linked child (e.g., Mother, Guardian).",
        "6. Click 'Add Parent' to save the account."
      ]
    },
    { id: 'children', title: 'Child Profiles', icon: BookUser, href: '/admin/children',
      instructions: [
        "1. Navigate to 'Users' > 'Children'.",
        "2. Click 'Enrol Child' to add a new student.",
        "3. Enter the child's name and select their year group.",
        "4. You can either link them to an existing parent or add a new parent directly from this form.",
        "5. Click 'Enrol Child' to create the profile."
      ]
    },
    { id: 'documents', title: 'Documents', icon: FileText, href: '/admin/documents',
      instructions: [
        "1. Go to the 'Documents' page.",
        "2. Click 'Upload Document'.",
        "3. Give the document a clear title and select a category (e.g., Policy, Newsletter).",
        "4. Upload the PDF file.",
        "5. Click 'Upload Document'. It will now be available in the Parent Portal."
      ]
    },
    { id: 'settings', title: 'Site Settings', icon: Settings, href: '/admin/settings',
      instructions: [
        "1. Go to the 'System' > 'Site Settings' page.",
        "2. Update the school's address, phone number, and public email.",
        "3. You can also add or update links to your social media pages.",
        "4. Click 'Save Settings' to update this information across the public website."
      ]
    },
];

export default function AdminDashboardPage() {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    const activeTopic = managementTopics.find(t => t.id === selectedTopic);

    return (
        <div className="space-y-6">
             <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Welcome Back!</h1>
                <p className="text-muted-foreground">This is your content management system. Select a topic below for a quick guide.</p>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>How to Use This Dashboard</CardTitle>
                    <CardDescription>
                        Click a topic below to see a step-by-step guide. For full management, use the navigation menu on the left.
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
                                {activeTopic.title} Guide
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                {activeTopic.instructions.map((step, index) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ol>
                            <div className="pt-2">
                                <Button asChild variant="link" className="p-0">
                                    <Link href={activeTopic.href}>
                                        Go to {activeTopic.title} page <ArrowRight className="ml-2 h-4 w-4" />
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
