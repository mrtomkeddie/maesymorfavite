

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Award, MessageSquare } from 'lucide-react';
import { db } from '@/lib/db';
import type { ParentNotificationWithId, StaffMemberWithId, ChildWithId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TeacherOutboxPage() {
    const [sentNotifications, setSentNotifications] = useState<ParentNotificationWithId[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [teacher, setTeacher] = useState<StaffMemberWithId | null>(null);
    const [myClass, setMyClass] = useState<ChildWithId[]>([]);
    const [childFilter, setChildFilter] = useState('all');
    const { toast } = useToast();
    const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


    useEffect(() => {
        const fetchSentNotifications = async () => {
            setIsLoading(true);
            try {
                let userId = 'mock-teacher-id-1'; // Default for non-supabase env
                if (isSupabaseConfigured) {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw new Error("Not authenticated");
                    userId = session.user.id;
                }

                const allNotifications = await db.getParentNotifications();
                const teacherNotifications = allNotifications.filter(n => n.teacherId === userId);
                setSentNotifications(teacherNotifications.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

                const teacherData = await db.getTeacherAndClass(userId);
                if (teacherData) {
                    setTeacher(teacherData.teacher);
                    setMyClass(teacherData.myClass);
                }

            } catch (error) {
                console.error("Failed to fetch sent notifications:", error);
                toast({
                    title: "Error",
                    description: "Could not load your sent messages.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSentNotifications();
    }, [toast, isSupabaseConfigured]);

    const filteredNotifications = useMemo(() => {
        if (childFilter === 'all') {
            return sentNotifications;
        }
        return sentNotifications.filter(notif => notif.childId === childFilter);
    }, [sentNotifications, childFilter]);


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    const notificationIcons = {
        'Achievement': <MessageSquare className="h-6 w-6 text-yellow-500" />,
        'Incident': <MessageSquare className="h-6 w-6 text-red-500" />,
        'General': <MessageSquare className="h-6 w-6 text-blue-500" />,
        'Values Award': <Award className="h-6 w-6 text-purple-500" />
    };

    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sent Messages</h1>
                    <p className="text-muted-foreground">A history of notifications you have sent to parents.</p>
                </div>
                 <Button asChild>
                    <Link href="/teacher/dashboard">
                        <MessageSquare className="mr-2 h-4 w-4" /> Send New Notification
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                         <CardTitle>Sent Items</CardTitle>
                         <div className="w-full max-w-xs">
                             <Select value={childFilter} onValueChange={setChildFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by student..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Students</SelectItem>
                                    {myClass.map(child => (
                                        <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                         </div>
                    </div>
                </CardHeader>
                 <CardContent>
                    {filteredNotifications.length > 0 ? (
                        <div className="space-y-4">
                            {filteredNotifications.map(notif => (
                                <Card key={notif.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1">{notificationIcons[notif.type]}</div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold">
                                                        To Parent of: <span className="text-primary">{notif.childName}</span>
                                                        </p>
                                                        <Badge variant="outline" className="mt-1">{notif.type}</Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground text-right shrink-0">
                                                        {formatDistanceToNow(new Date(notif.date), { addSuffix: true })}
                                                        <br />
                                                        <span className={notif.isRead ? '' : 'font-bold text-primary'}>
                                                            {notif.isRead ? 'Seen' : 'Delivered'}
                                                        </span>
                                                    </p>
                                                </div>
                                                
                                                <p className="text-sm text-muted-foreground mt-4 whitespace-pre-wrap">{notif.notes}</p>
                                                {notif.treatmentGiven && (
                                                    <p className="text-sm text-muted-foreground mt-2"><strong>Treatment:</strong> {notif.treatmentGiven}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center p-12 border-dashed">
                            <Send className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h2 className="mt-4 text-xl font-semibold">No Sent Messages</h2>
                            <p className="mt-2 text-muted-foreground">
                                {childFilter === 'all' ? "You haven't sent any notifications yet." : "No notifications found for this student."}
                            </p>
                        </Card>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}

    
