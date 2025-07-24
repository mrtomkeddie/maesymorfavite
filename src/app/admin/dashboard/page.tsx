
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Calendar, Users, FileText, Settings, BookUser, Users2, ArrowRight, Lightbulb } from "lucide-react";
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
      ],
      tip: "If your urgent alert doesn't show on the homepage, make sure the 'Urgent' switch is turned on and you have saved the post."
    },
    { id: 'calendar', title: 'Calendar Events', icon: Calendar, href: '/admin/calendar',
       instructions: [
        "Navigate to the 'Calendar' section.",
        "Click 'Add Event' to create a new calendar entry.",
        "Enter the event title, select a date, and add a description.",
        "You can optionally attach a file, like a permission slip.",
        "Check 'Show on Homepage' to also display this on the public homepage.",
        "Click 'Create Event' to save it."
      ],
      tip: "An event won't appear on the public site until it's saved. If you attach a file, it won't be available until you save the event."
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
      tip: "All uploaded documents are only visible to logged-in parents in the Parent Portal, not on the public website."
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
                            <div>
                                <h3 className="font-semibold mb-2">Instructions</h3>
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
                                            <h4 className="font-semibold text-primary">Good to know</h4>
                                            <p className="text-sm text-muted-foreground">{activeTopic.tip}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
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
