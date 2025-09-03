import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { HelpButton } from '@/components/tutorial/HelpButton';
import { useTutorial, Tutorial } from '@/contexts/TutorialProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, FileText, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { db } from '@/lib/db';
import type { CalendarEventWithId } from '@/lib/types';
import { deleteFile } from '@/lib/storage';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CalendarForm } from '@/components/admin/CalendarForm';
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
  const { language } = useLanguage();
  const { autoStartForNewUsers, isTutorialCompleted } = useTutorial();

  const fetchEvents = async (initial = false) => {
    setIsLoading(true);
    try {
      const { data } = await db.getPaginatedCalendarEvents(100);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(true);
  }, []);

  // Define calendar tutorial steps
  const calendarTutorials: Tutorial[] = [
    {
      id: 'calendar-basics',
      title: language === 'en' ? 'Calendar Management Basics' : 'Sylfaeni Rheoli Calendr',
      description: language === 'en' 
        ? 'Learn how to create, edit, and manage school events in the calendar system.'
        : 'Dysgwch sut i greu, golygu, a rheoli digwyddiadau ysgol yn y system calendr.',
      steps: [
        {
          id: 'overview',
          target: '[data-tutorial="calendar-overview"]',
          title: language === 'en' ? 'Calendar Overview' : 'Trosolwg Calendr',
          content: language === 'en'
            ? 'This is your calendar management page where you can view all school events, create new ones, and manage existing events.'
            : 'Dyma eich tudalen rheoli calendr lle gallwch weld holl ddigwyddiadau\'r ysgol, creu rhai newydd, a rheoli digwyddiadau presennol.',
          position: 'bottom',
          tip: language === 'en'
            ? 'Events created here will automatically appear on the public school website.'
            : 'Bydd digwyddiadau a grëir yma yn ymddangos yn awtomatig ar wefan gyhoeddus yr ysgol.'
        },
        {
          id: 'add-event',
          target: '[data-tutorial="add-event-button"]',
          title: language === 'en' ? 'Adding New Events' : 'Ychwanegu Digwyddiadau Newydd',
          content: language === 'en'
            ? 'Click this button to create a new calendar event. You can add details like title, date, description, and even attach files.'
            : 'Cliciwch y botwm hwn i greu digwyddiad calendr newydd. Gallwch ychwanegu manylion fel teitl, dyddiad, disgrifiad, a hyd yn oed atodi ffeiliau.',
          position: 'left',
          action: 'click'
        },
        {
          id: 'search-events',
          target: '[data-tutorial="search-input"]',
          title: language === 'en' ? 'Searching Events' : 'Chwilio Digwyddiadau',
          content: language === 'en'
            ? 'Use this search box to quickly find specific events by typing part of the event title.'
            : 'Defnyddiwch y blwch chwilio hwn i ddod o hyd i ddigwyddiadau penodol yn gyflym drwy deipio rhan o deitl y digwyddiad.',
          position: 'bottom'
        },
        {
          id: 'sort-events',
          target: '[data-tutorial="sort-button"]',
          title: language === 'en' ? 'Sorting Events' : 'Trefnu Digwyddiadau',
          content: language === 'en'
            ? 'Click this button to toggle between ascending and descending date order for your events.'
            : 'Cliciwch y botwm hwn i newid rhwng trefn dyddiad esgynnol a disgynnol ar gyfer eich digwyddiadau.',
          position: 'left'
        },
        {
          id: 'event-actions',
          target: '[data-tutorial="event-actions"]',
          title: language === 'en' ? 'Managing Events' : 'Rheoli Digwyddiadau',
          content: language === 'en'
            ? 'Each event has an actions menu where you can edit details or delete the event. Click the three dots to see options.'
            : 'Mae gan bob digwyddiad ddewislen gweithredoedd lle gallwch olygu manylion neu ddileu\'r digwyddiad. Cliciwch y tri dot i weld opsiynau.',
          position: 'left',
          tip: language === 'en'
            ? 'Deleting an event will also remove any attached files and cannot be undone.'
            : 'Bydd dileu digwyddiad hefyd yn dileu unrhyw ffeiliau atodol ac ni ellir ei ddadwneud.'
        },
        {
          id: 'event-badges',
          target: '[data-tutorial="event-status"]',
          title: language === 'en' ? 'Event Status Badges' : 'Bathodynnau Statws Digwyddiad',
          content: language === 'en'
            ? 'These badges show important event properties: "Urgent" for critical announcements and "Homepage" for events displayed on the main site.'
            : 'Mae\'r bathodynnau hyn yn dangos priodweddau pwysig digwyddiadau: "Brys" ar gyfer cyhoeddiadau critigol a "Tudalen Gartref" ar gyfer digwyddiadau a ddangosir ar y brif wefan.',
          position: 'right'
        }
      ]
    }
  ];

  // Auto-start tutorial for new users
  useEffect(() => {
    if (autoStartForNewUsers && !isTutorialCompleted('calendar-basics') && events.length === 0 && !isLoading) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        // Only start if there are no events (likely a new user)
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStartForNewUsers, isTutorialCompleted, events.length, isLoading]);

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
    <>
      <div className="space-y-6" data-tutorial="calendar-overview">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                <p className="text-muted-foreground">Create, edit, and manage all school events.</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
              setIsDialogOpen(isOpen);
              if (!isOpen) setSelectedEvent(null);
            }}>
              <DialogTrigger asChild>
                <Button data-tutorial="add-event-button">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                </Button>
              </DialogTrigger>
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
                          data-tutorial="search-input"
                      />
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    data-tutorial="sort-button"
                  >
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
                           <TableCell data-tutorial="event-status">
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
                                    <Button variant="ghost" className="h-8 w-8 p-0" data-tutorial="event-actions">
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
      
      {/* Tutorial Help Button */}
      <HelpButton 
        tutorials={calendarTutorials}
        position="bottom-right"
      />
    </>
  );
}
