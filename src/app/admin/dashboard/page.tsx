
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Calendar, Users, FileText, Settings, BookUser, Users2 } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
    const managementCards = [
        { title: 'News & Alerts', icon: Newspaper, href: '/admin/news' },
        { title: 'Calendar Events', icon: Calendar, href: '/admin/calendar' },
        { title: 'Staff Directory', icon: Users, href: '/admin/staff' },
        { title: 'Parent Accounts', icon: Users2, href: '/admin/parents' },
        { title: 'Child Profiles', icon: BookUser, href: '/admin/children' },
        { title: 'Documents', icon: FileText, href: '/admin/documents' },
        { title: 'Site Settings', icon: Settings, href: '/admin/settings' },
    ];

    return (
        <div className="space-y-6">
             <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Welcome Back!</h1>
                <p className="text-muted-foreground">This is your content management system. Use the menu on the left to get started.</p>
            </div>
             <Card className="bg-secondary/30 border-secondary">
                <CardHeader>
                    <CardTitle>How to Use This Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground max-w-2xl">
                        This dashboard allows you to update the content on the school website and parent portal.
                        Use the navigation menu on the left to manage the different sections of the site. For detailed instructions on any section, please refer to the admin 'How-To' guide.
                    </p>
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {managementCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <Link key={card.title} href={card.href} className="flex items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground">
                                    <Icon className="h-4 w-4" />
                                    <span>{card.title}</span>
                                </Link>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
