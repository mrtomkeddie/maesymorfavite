
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { MoreHorizontal, Trash2, Loader2, Eye, Mail, ClipboardCheck, ArrowUp, ArrowDown } from 'lucide-react';
import { getInboxMessages, updateInboxMessage, deleteInboxMessage, InboxMessageWithId } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function InboxAdminPage() {
  const [messages, setMessages] = useState<InboxMessageWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<InboxMessageWithId | null>(null);
  const [messageToView, setMessageToView] = useState<InboxMessageWithId | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const { toast } = useToast();

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const allMessages = await getInboxMessages();
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
  }, []);
  
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - a.createdAt;
    });
  }, [messages, sortOrder]);


  const openDeleteAlert = (message: InboxMessageWithId) => {
    setMessageToDelete(message);
    setIsDeleteAlertOpen(true);
  }

  const handleDelete = async () => {
    if (!messageToDelete) return;

    try {
      await deleteInboxMessage(messageToDelete.id);
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
    setIsViewDialogOpen(true);
    if (!message.isRead) {
        try {
            await updateInboxMessage(message.id, { isRead: true });
            fetchMessages(); // Optimistically update UI
        } catch (error) {
            console.error("Failed to mark message as read:", error);
        }
    }
  }
  
  const unreadCount = useMemo(() => messages.filter(m => !m.isRead).length, [messages]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
              <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
              <p className="text-muted-foreground">
                  {unreadCount > 0 ? `You have ${unreadCount} unread messages.` : 'No unread messages.'}
              </p>
          </div>
           <Button variant="outline" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                Sort by Date
                {sortOrder === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUp className="ml-2 h-4 w-4" />}
                <span className="sr-only">Toggle sort order</span>
            </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
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
                {sortedMessages.length > 0 ? (
                  sortedMessages.map((message) => (
                    <TableRow key={message.id} className={cn(!message.isRead && 'bg-secondary font-bold')}>
                      <TableCell>{message.sender.name}</TableCell>
                      <TableCell className="font-medium">{message.subject}</TableCell>
                      <TableCell>
                          <Badge variant={message.type === 'absence' ? 'destructive' : 'outline'}>
                              {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                          </Badge>
                      </TableCell>
                      <TableCell>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</TableCell>
                      <TableCell className="text-right">
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
                                    {message.isRead ? 'View' : 'View & Mark Read'}
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
                      Your inbox is empty.
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
                                <a href={`mailto:${messageToView.sender.email}`} className="text-sm text-muted-foreground hover:underline">
                                    {messageToView.sender.email}
                                </a>
                            </div>
                        </div>
                        <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                            {messageToView.body}
                        </div>
                    </div>
                  )}
              </ScrollArea>
          </DialogContent>
      </Dialog>
    </div>
  );
}
