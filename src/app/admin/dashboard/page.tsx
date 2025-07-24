
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Calendar, Users, FileText, Settings } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {

    const managementCards = [
        { title: 'News & Alerts', icon: Newspaper, href: '/admin/news', description: 'Manage school announcements' },
        { title: 'Calendar Events', icon: Calendar, href: '/admin/calendar', description: 'Update the school calendar' },
        { title: 'Staff Directory', icon: Users, href: '/admin/staff', description: 'Edit staff profiles' },
        { title: 'Documents', icon: FileText, href: '/admin/documents', description: 'Upload policies and menus' },
        { title: 'Site Settings', icon: Settings, href: '/admin/settings', description: 'Edit contact details' },
    ];

    return (
        <div className="space-y-8">
             <div className="space-y-1">
                <h2 className="text-2xl font-semibold">Welcome Back!</h2>
                <p className="text-muted-foreground">Here's a quick overview of the content management system.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managementCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Card key={card.title} className="hover:shadow-lg transition-shadow">
                            <Link href={card.href} className="block h-full">
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <div className="p-3 bg-secondary rounded-lg">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle>{card.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{card.description}</CardDescription>
                                </CardContent>
                            </Link>
                        </Card>
                    );
                })}
            </div>
             <Card className="mt-8 bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle>How to Use This Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This dashboard allows you to update the content on the school website and parent portal.
                        Use the sections above to manage news, events, staff, and documents. For detailed instructions, please refer to the admin 'How-To' guide.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
