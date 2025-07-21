
'use client';

import { useState, useEffect } from 'react';
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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, FileText, ExternalLink } from 'lucide-react';
import { getCalendarEvents, deleteCalendarEvent, CalendarEventWithId } from '@/lib/firebase/firestore';
import { deleteFile } from '@/lib/firebase/storage';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CalendarForm } from '@/components/admin/CalendarForm';

export default function CalendarAdminPage() {
  const [events, setEvents] = useState<CalendarEventWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventWithId | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEventWithId | null>(null);

  const { toast } = useToast();

  const fetchEvents = async () => {
    setIsLoading(true);
    const eventData = await getCalendarEvents();
    setEvents(eventData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
    fetchEvents();
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
        await deleteCalendarEvent(eventToDelete.id);

        if (eventToDelete.attachmentUrl) {
           await deleteFile(eventToDelete.attachmentUrl);
        }

        toast({
            title: "Success",
            description: "Calendar event deleted successfully.",
            variant: "default",
        });
        fetchEvents();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">Calendar Management</h1>
            <p className="text-muted-foreground">Create, edit, and manage all school events.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
            setIsDialogOpen(isOpen);
            if (!isOpen) setSelectedEvent(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>A list of all current and future school events.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
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
                {events.length > 0 ? (
                  events.map((event) => (
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
  );
}
