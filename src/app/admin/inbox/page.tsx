

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Loader2, Eye, Mail, ClipboardCheck, ArrowUp, ArrowDown, Search, Reply, Send } from 'lucide-react';
import { db } from '@/lib/db';
import type { InboxMessageWithId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';


type SortableField = 'createdAt' | 'sender.name' | 'subject';

const replyFormSchema = z.object({
  replyMessage: z.string().min(1, 'Reply cannot be empty.'),
});

export default function InboxAdminPage() {
  const [messages, setMessages] = useState<InboxMessageWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<InboxMessageWithId | null>(null);
  const [messageToView, setMessageToView] = useState<InboxMessageWithId | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortableField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const { toast } = useToast();

  const replyForm = useForm<z.infer<typeof replyFormSchema>>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: { replyMessage: '' },
  });


  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const allMessages = await db.getInboxMessages();
      setMessages(allMessages);
    } catch (error) {
      console.error("Failed to fetch inbox messages:", error);
      toast({
        title: "Error",
        description: "Could not load inbox messages.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const processedMessages = useMemo(() => {
    let filtered = [...messages];

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(m => m.type === typeFilter);
    }

    // Apply search query
    if (searchQuery) {
        filtered = filtered.filter(m => 
            m.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.subject.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      if (sortBy === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else if (sortBy === 'sender.name') {
        valA = a.sender.name;
        valB = b.sender.name;
      } else { // subject
        valA = a.subject;
        valB = b.subject;
      }
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      }
    });
  }, [messages, typeFilter, searchQuery, sortBy, sortOrder]);


  const openDeleteAlert = (message: InboxMessageWithId) => {
    setMessageToDelete(message);
    setIsDeleteAlertOpen(true);
  }

  const handleDelete = async () => {
    if (!messageToDelete) return;

    try {
      await db.deleteInboxMessage(messageToDelete.id);
      toast({
        title: "Success",
        description: "Message deleted successfully.",
      });
      fetchMessages(); // Refetch after deletion
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteAlertOpen(false);
      setMessageToDelete(null);
    }
  };

  const handleViewMessage = async (message: InboxMessageWithId) => {
    setMessageToView(message);
    replyForm.reset();
    setIsViewDialogOpen(true);
    if (!message.isReadByAdmin) {
        try {
            await db.updateInboxMessage(message.id, { isReadByAdmin: true });
            // Optimistically update UI
            setMessages(prev => prev.map(m => m.id === message.id ? {...m, isReadByAdmin: true} : m));
        } catch (error) {
            console.error("Failed to mark message as read:", error);
        }
    }
  }

   const handleSendReply = async (values: z.infer<typeof replyFormSchema>) => {
    if (!messageToView) return;
    setIsSending(true);

    try {
        const adminUser = { id: 'admin-1', name: 'School Admin', email: 'admin@example.com', type: 'admin' as const };

        await db.addInboxMessage({
            type: 'reply',
            subject: `Re: ${messageToView.subject}`,
            body: values.replyMessage,
            sender: adminUser,
            recipient: messageToView.sender, // The parent becomes the recipient
            isRead: false,
            isReadByAdmin: true, // Admin has "read" their own message
            isReadByParent: false,
            createdAt: new Date().toISOString(),
            threadId: messageToView.threadId || messageToView.id,
        });

        toast({
            title: "Reply Sent",
            description: `Your reply has been sent to ${messageToView.sender.name}.`,
        });

        replyForm.reset();
        setIsViewDialogOpen(false); // Close dialog on success
        setMessageToView(null);
        fetchMessages(); // Refresh the inbox
    } catch (error) {
       toast({
        title: "Error Sending Reply",
        description: "Could not send the reply. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  }
  
  const unreadCount = useMemo(() => messages.filter(m => !m.isReadByAdmin).length, [messages]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
              <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
              <p className="text-muted-foreground">
                  {unreadCount > 0 ? `You have ${unreadCount} unread messages.` : 'No unread messages.'}
              </p>
          </div>
      </div>
      
       <div className="rounded-lg border">
        <div className="p-4 flex flex-col sm:flex-row gap-2 bg-muted/50 border-b">
            <div className="relative w-full sm:flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by sender or subject..."
                    className="w-full pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-2 sm:flex gap-2">
                 <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className='w-full sm:w-[150px]'>
                        <SelectValue placeholder="Filter by type..."/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="absence">Absence</SelectItem>
                        <SelectItem value="contact">Contact</SelectItem>
                        <SelectItem value="reply">Reply</SelectItem>
                    </SelectContent>
                </Select>
                 <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortableField)}>
                    <SelectTrigger className='w-full sm:w-[150px]'>
                        <SelectValue placeholder="Sort by..."/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="createdAt">Date</SelectItem>
                        <SelectItem value="sender.name">From</SelectItem>
                        <SelectItem value="subject">Subject</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                    <span className="sr-only">Toggle sort order</span>
                </Button>
            </div>
        </div>
        <div className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[150px]">Received</TableHead>
                  <TableHead className="text-right w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedMessages.length > 0 ? (
                  processedMessages.map((message) => (
                    <TableRow 
                        key={message.id} 
                        className={`cursor-pointer ${!message.isReadByAdmin ? 'bg-secondary/40 font-bold' : ''}`}
                        onClick={() => handleViewMessage(message)}
                    >
                      <TableCell>{message.sender.name}</TableCell>
                      <TableCell className="font-medium">{message.subject}</TableCell>
                      <TableCell>
                          <Badge variant={message.type === 'absence' ? 'destructive' : 'outline'}>
                              {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                          </Badge>
                      </TableCell>
                      <TableCell>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewMessage(message)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    {message.isReadByAdmin ? 'View' : 'View & Mark Read'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openDeleteAlert(message)} className="text-destructive focus:text-destructive">
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
                      Your inbox is empty or no messages match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </div>
      </div>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this message.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-xl">
               <DialogHeader>
                  <DialogTitle>{messageToView?.subject}</DialogTitle>
                  <DialogDescription>
                      Received on {messageToView && format(new Date(messageToView.createdAt), 'PPP p')}
                  </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-4">
                  {messageToView && (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-4 p-3 bg-muted rounded-md">
                            {messageToView.type === 'absence' ? (
                                <ClipboardCheck className="h-6 w-6 text-primary" />
                            ) : (
                                <Mail className="h-6 w-6 text-primary" />
                            )}
                            <div>
                                <p className="font-semibold">{messageToView.sender.name}</p>
                                <p className="text-sm text-muted-foreground">{messageToView.sender.email}</p>
                            </div>
                        </div>
                        <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                            {messageToView.body}
                        </div>

                         <Separator className="my-4" />

                        <Form {...replyForm}>
                            <form onSubmit={replyForm.handleSubmit(handleSendReply)} className="space-y-4">
                                <FormField
                                control={replyForm.control}
                                name="replyMessage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold flex items-center gap-2">
                                            <Reply className="h-4 w-4" /> Reply to {messageToView.sender.name}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Type your reply here..." rows={5} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={isSending}>
                                        {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Reply
                                    </Button>
                                </div>
                            </form>
                        </Form>

                    </div>
                  )}
              </ScrollArea>
          </DialogContent>
      </Dialog>
    </div>
  );
}
