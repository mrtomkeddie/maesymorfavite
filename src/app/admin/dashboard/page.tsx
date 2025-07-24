
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
        "Go to the 'News & Alerts' page from the sidebar.",
        "Click the 'Add News Post' button to open the form.",
        "Fill in the title and body content for the announcement.",
        "Mark it as 'Urgent' if it's a critical alert, like a school closure.",
        "Click 'Create Post' to publish it to the website."
      ]
    },
    { id: 'calendar', title: 'Calendar Events', icon: Calendar, href: '/admin/calendar',
       instructions: [
        "Navigate to the 'Calendar' section.",
        "Click 'Add Event' to create a new calendar entry.",
        "Enter the event title, select a date, and add a description.",
        "You can optionally attach a file, like a permission slip.",
        "Check 'Cross-post to News' to also create a news item for the event.",
        "Click 'Create Event' to save it."
      ]
    },
    { id: 'staff', title: 'Staff Directory', icon: Users, href: '/admin/staff',
      instructions: [
        "Go to the 'Staff' page.",
        "Click 'Add Staff Member' to open the staff form.",
        "Enter the staff member's name, role, and assign them to a team (e.g., Leadership, Year 1).",
        "You can also add a short bio and upload a profile photo.",
        "Click 'Add Staff' to add them to the public 'About Us' page."
      ]
    },
    { id: 'parents', title: 'Parent Accounts', icon: Users2, href: '/admin/parents',
      instructions: [
        "Go to the 'Users' > 'Parents' page.",
        "Click 'Add Parent' to create a new parent account.",
        "Fill in the parent's name and email address.",
        "In the 'Linked Children' section, search for and select the children associated with this parent.",
        "Specify the relationship for each linked child (e.g., Mother, Guardian).",
        "Click 'Add Parent' to save the account."
      ]
    },
    { id: 'children', title: 'Child Profiles', icon: BookUser, href: '/admin/children',
      instructions: [
        "Navigate to 'Users' > 'Children'.",
        "Click 'Enrol Child' to add a new student.",
        "Enter the child's name and select their year group.",
        "You can either link them to an existing parent or add a new parent directly from this form.",
        "Click 'Enrol Child' to create the profile."
      ]
    },
    { id: 'documents', title: 'Documents', icon: FileText, href: '/admin/documents',
      instructions: [
        "Go to the 'Documents' page.",
        "Click 'Upload Document'.",
        "Give the document a clear title and select a category (e.g., Policy, Newsletter).",
        "Upload the PDF file.",
        "Click 'Upload Document'. It will now be available in the Parent Portal."
      ]
    },
    { id: 'settings', title: 'Site Settings', icon: Settings, href: '/admin/settings',
      instructions: [
        "Go to the 'System' > 'Site Settings' page.",
        "Update the school's address, phone number, and public email.",
        "You can also add or update links to your social media pages.",
        "Click 'Save Settings' to update this information across the public website."
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
