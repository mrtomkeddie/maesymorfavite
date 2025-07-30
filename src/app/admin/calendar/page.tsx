
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, FileText, ExternalLink, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { db } from '@/lib/db';
import type { CalendarEventWithId } from '@/lib/types';
import { deleteFile } from '@/lib/firebase/storage';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CalendarForm } from '@/components/admin/CalendarForm';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { Input } from '@/components/ui/input';

export default function CalendarAdminPage() {
  const [events, setEvents] = useState<CalendarEventWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventWithId | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEventWithId | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');


  const { toast } = useToast();

  const fetchEvents = async (initial = false) => {
    setIsLoading(true);
    const { data } = await db.getPaginatedCalendarEvents(100);
    setEvents(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAndSortedEvents = useMemo(() => {
    let result = [...events];

    if (searchQuery) {
        result = result.filter(event =>
            event.title_en.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    result.sort((a, b) => {
        const dateA = new Date(a.start).getTime();
        const dateB = new Date(b.start).getTime();
        if (sortOrder === 'asc') {
            return dateA - dateB;
        } else {
            return dateB - dateA;
        }
    });

    return result;
  }, [events, searchQuery, sortOrder]);


  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
    fetchEvents(true);
  };

  const handleEdit = (event: CalendarEventWithId) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };
  
  const openDeleteAlert = (event: CalendarEventWithId) => {
    setEventToDelete(event);
    setIsDeleteAlertOpen(true);
  }

  const handleDelete = async () => {
      if (!eventToDelete) return;

      try {
        await db.deleteCalendarEvent(eventToDelete.id);

        if (eventToDelete.attachmentUrl) {
           await deleteFile(eventToDelete.attachmentUrl);
        }

        toast({
            title: "Success",
            description: "Calendar event deleted successfully.",
            variant: "default",
        });
        fetchEvents(true);
      } catch (error) {
        console.error("Error deleting event:", error);
        toast({
            title: "Error",
            description: "Failed to delete event. Please try again.",
            variant: "destructive",
        });
      } finally {
        setIsDeleteAlertOpen(false);
        setEventToDelete(null);
      }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
      setIsDialogOpen(isOpen);
      if (!isOpen) setSelectedEvent(null);
    }}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                <p className="text-muted-foreground">Create, edit, and manage all school events.</p>
            </div>
             <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                </Button>
            </DialogTrigger>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
              <div>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>A list of all current and future school events.</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                          type="search"
                          placeholder="Search by title..."
                          className="w-full pl-8 sm:w-[250px]"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                      />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                      {sortOrder === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                      <span className="sr-only">Toggle sort order</span>
                  </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Attachment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedEvents.length > 0 ? (
                      filteredAndSortedEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">{event.title_en}</TableCell>
                          <TableCell>{format(new Date(event.start), 'dd MMM yyyy')}</TableCell>
                           <TableCell>
                            <div className="flex flex-col gap-1">
                              {event.isUrgent && <Badge variant="destructive">Urgent</Badge>}
                              {event.showOnHomepage && <Badge variant="secondary">Homepage</Badge>}
                            </div>
                           </TableCell>
                           <TableCell>
                            {event.attachmentUrl && (
                                <a href={event.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                                    <FileText className="h-4 w-4" /> View
                                </a>
                            )}
                           </TableCell>
                          <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleEdit(event)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => openDeleteAlert(event)} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No upcoming events found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the calendar event
                  and remove its data from our servers.
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedEvent ? 'Edit' : 'Create'} Event</DialogTitle>
          <DialogDescription>
            Fill in the details below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <CalendarForm
          onSuccess={handleFormSuccess}
          existingEvent={selectedEvent}
        />
      </DialogContent>
    </Dialog>
  );
}
