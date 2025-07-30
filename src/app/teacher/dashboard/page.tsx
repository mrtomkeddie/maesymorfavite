

'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { supabase, getUserRole } from '@/lib/supabase';
import type { ChildWithId, StaffMemberWithId, InboxMessageWithId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, FileText, User, Info, AlertTriangle, BookOpen, Smile, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function TeacherDashboard() {
    const [teacher, setTeacher] = useState<StaffMemberWithId | null>(null);
    const [myClass, setMyClass] = useState<ChildWithId[]>([]);
    const [absences, setAbsences] = useState<InboxMessageWithId[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChild, setSelectedChild] = useState<ChildWithId | null>(null);
    const [isChildDetailOpen, setIsChildDetailOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchTeacherData = async () => {
            setIsLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    throw new Error("Not authenticated");
                }
                const teacherData = await db.getTeacherAndClass(session.user.id);
                if (teacherData) {
                    setTeacher(teacherData.teacher);
                    setMyClass(teacherData.myClass);

                    const allAbsences = await db.getInboxMessages();
                    const classChildIds = new Set(teacherData.myClass.map(c => c.id));
                    const today = new Date();
                    today.setHours(0,0,0,0);

                    const relevantAbsences = allAbsences.filter(msg => {
                        if (msg.type !== 'absence') return false;
                        
                        // Extract child ID from subject (this is brittle, a structured field would be better)
                        // Assuming subject is "Absence Report for [Child Name]" and body contains "Child ID: [ID]"
                        // Or we can just check if any of our kids' names are in the subject.
                        const child = teacherData.myClass.find(c => msg.subject.includes(c.name));
                        if (!child) return false;

                        const absenceDate = new Date(msg.body.split('Date of Absence: ')[1]?.split('\n')[0]);
                        return absenceDate >= today;
                    });
                    setAbsences(relevantAbsences);
                }
            } catch (error) {
                console.error("Error fetching teacher data:", error);
                toast({
                    title: "Error",
                    description: "Could not load your class data. Please try again.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeacherData();
    }, [toast]);

    const handleViewChild = (child: ChildWithId) => {
        setSelectedChild(child);
        setIsChildDetailOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Class - {teacher?.team}</h1>
                <p className="text-muted-foreground">Welcome, {teacher?.name}. Here's an overview of your class today.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Class List ({myClass.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myClass.map(child => (
                                        <TableRow key={child.id}>
                                            <TableCell className="font-medium">{child.name}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleViewChild(child)}>
                                                    <Info className="mr-2 h-4 w-4" /> View Details
                                                </Button>
                                                <Button variant="default" size="sm" asChild className="ml-2">
                                                    <Link href={{ pathname: '/teacher/notify', query: { childId: child.id, childName: child.name } }}>
                                                        <Smile className="mr-2 h-4 w-4" /> Notify Parent
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <div>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Upcoming Absences</CardTitle>
                             <CardDescription>Absences reported for today and future dates.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {absences.length > 0 ? (
                            <div className="space-y-3">
                               {absences.map(absence => (
                                   <div key={absence.id} className="p-3 rounded-md border text-sm">
                                       <p className="font-semibold">{absence.subject.replace('Absence Report for ', '')}</p>
                                       <p className="text-muted-foreground">Date: {format(new Date(absence.body.split('Date of Absence: ')[1]?.split('\n')[0]), 'dd MMM yyyy')}</p>
                                       <p className="text-muted-foreground mt-1">Reason: {absence.body.split('Reason: ')[1]?.split('\n---')[0]}</p>
                                   </div>
                               ))}
                            </div>
                           ) : (
                               <p className="text-sm text-muted-foreground text-center py-4">No absences reported for your class.</p>
                           )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isChildDetailOpen} onOpenChange={setIsChildDetailOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedChild?.name}</DialogTitle>
                         <DialogDescription>
                            Key information for this student. For full details, please contact the school office.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedChild && (
                       <ScrollArea className="max-h-[60vh] pr-4">
                           <div className="space-y-4 py-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Parent/Guardian Contact</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        {selectedChild.linkedParents && selectedChild.linkedParents.length > 0 ? (
                                            selectedChild.linkedParents.map(parentLink => (
                                                <div key={parentLink.parentId} className="p-2 bg-muted rounded-md">
                                                    {/* This would be better with a parent data look-up */}
                                                    <p className="font-semibold">{parentLink.relationship}</p>
                                                    <p className="text-muted-foreground">Contact details available from the office.</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground">No parents linked.</p>
                                        )}
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Allergies & Medical</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                       <p className="text-muted-foreground">{selectedChild.allergies || 'No known allergies or medical conditions.'}</p>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4" /> One Page Profile / IDP</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                       {selectedChild.onePageProfileUrl ? (
                                            <Button variant="outline" asChild>
                                                <a href={selectedChild.onePageProfileUrl} target="_blank" rel="noopener noreferrer">
                                                    <LinkIcon className="mr-2 h-4 w-4" /> View Document
                                                </a>
                                            </Button>
                                       ) : (
                                         <p className="text-sm text-muted-foreground">No profile document uploaded.</p>
                                       )}
                                    </CardContent>
                                </Card>
                           </div>
                       </ScrollArea>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
