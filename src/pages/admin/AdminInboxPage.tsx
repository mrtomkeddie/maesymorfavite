import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { db } from '@/lib/db'
import type { InboxMessageWithId } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Loader2, MoreHorizontal, Trash2, Eye, Mail, Reply, Send, Search } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const replyFormSchema = z.object({
  replyMessage: z.string().min(1, 'Reply cannot be empty.'),
})

export default function AdminInboxPage() {
  const [threads, setThreads] = useState<Record<string, InboxMessageWithId[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null)
  const [threadToView, setThreadToView] = useState<string | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const { toast } = useToast()

  const replyForm = useForm<z.infer<typeof replyFormSchema>>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: { replyMessage: '' },
  })

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const allMessages = await db.getInboxMessages()

      const groupedByThread: Record<string, InboxMessageWithId[]> = {}
      allMessages.forEach((msg) => {
        const threadId = msg.threadId || msg.id
        if (!groupedByThread[threadId]) groupedByThread[threadId] = []
        groupedByThread[threadId].push(msg)
      })

      for (const threadId in groupedByThread) {
        groupedByThread[threadId].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
      }

      setThreads(groupedByThread)
    } catch (error) {
      console.error('Failed to fetch inbox messages:', error)
      toast({ title: 'Error', description: 'Could not load inbox messages.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const processedThreads = useMemo(() => {
    let entries = Object.entries(threads)

    if (typeFilter !== 'all') {
      entries = entries.filter(([, messages]) => messages[0].type === typeFilter)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      entries = entries.filter(([, messages]) => {
        const first = messages[0]
        return (
          first.sender.name.toLowerCase().includes(q) ||
          first.subject.toLowerCase().includes(q)
        )
      })
    }

    entries.sort(([, a], [, b]) => {
      const lastA = a[a.length - 1]
      const lastB = b[b.length - 1]
      return new Date(lastB.createdAt).getTime() - new Date(lastA.createdAt).getTime()
    })

    return entries
  }, [threads, typeFilter, searchQuery])

  const openDeleteAlert = (threadId: string) => {
    setThreadToDelete(threadId)
    setIsDeleteAlertOpen(true)
  }

  const handleDelete = async () => {
    if (!threadToDelete) return
    const msgs = threads[threadToDelete] || []
    try {
      for (const m of msgs) {
        await db.deleteInboxMessage(m.id)
      }
      toast({ title: 'Success', description: 'Message thread deleted successfully.' })
      fetchMessages()
    } catch (error) {
      console.error('Error deleting message thread:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete message thread. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleteAlertOpen(false)
      setThreadToDelete(null)
    }
  }

  const markThreadAsReadByAdmin = async (threadId: string) => {
    const threadMessages = threads[threadId]
    if (!threadMessages) return

    for (const message of threadMessages) {
      if (!message.isReadByAdmin) {
        try {
          await db.updateInboxMessage(message.id, { isReadByAdmin: true })
          setThreads((prev) => {
            const next = { ...prev }
            next[threadId] = next[threadId].map((m) => (m.id === message.id ? { ...m, isReadByAdmin: true } : m))
            return next
          })
        } catch (error) {
          console.error('Failed to mark message as read:', error)
        }
      }
    }
  }

  const handleViewThread = async (threadId: string) => {
    setThreadToView(threadId)
    replyForm.reset()
    setIsViewDialogOpen(true)
    await markThreadAsReadByAdmin(threadId)
  }

  const handleSendReply = async (values: z.infer<typeof replyFormSchema>) => {
    if (!threadToView) return
    const currentThread = threads[threadToView]
    if (!currentThread || currentThread.length === 0) return

    const firstMessage = currentThread[0]
    const parent = firstMessage.sender.type === 'parent' ? firstMessage.sender : firstMessage.recipient

    setIsSending(true)
    try {
      const adminUser = { id: 'admin-1', name: 'School Admin', email: 'admin@example.com', type: 'admin' as const }
      await db.addInboxMessage({
        type: 'reply',
        subject: `Re: ${firstMessage.subject}`,
        body: values.replyMessage,
        sender: adminUser,
        recipient: parent,
        isReadByAdmin: true,
        isReadByParent: false,
        createdAt: new Date().toISOString(),
        threadId: threadToView,
      })

      toast({ title: 'Reply Sent', description: `Your reply has been sent to ${parent.name}.` })
      replyForm.reset()
      fetchMessages()
    } catch (error) {
      toast({ title: 'Error Sending Reply', description: 'Could not send the reply. Please try again.', variant: 'destructive' })
    } finally {
      setIsSending(false)
    }
  }

  const hasUnread = (thread: InboxMessageWithId[]) => thread.some((m) => !m.isReadByAdmin)
  const unreadCount = useMemo(() => Object.values(threads).filter(hasUnread).length, [threads])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread message threads.` : 'No unread messages.'}
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
          <div className="grid grid-cols-1 sm:flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter by type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="absence">Absence</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
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
                    <TableHead className="w-[150px]">Last Update</TableHead>
                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedThreads.length > 0 ? (
                    processedThreads.map(([threadId, messages]) => {
                      const firstMessage = messages[0]
                      const lastMessage = messages[messages.length - 1]
                      const isUnread = hasUnread(messages)
                      return (
                        <TableRow
                          key={threadId}
                          className={cn('cursor-pointer', isUnread && 'bg-secondary/40 font-bold')}
                          onClick={() => handleViewThread(threadId)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isUnread && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                              <span>{firstMessage.sender.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{firstMessage.subject}</TableCell>
                          <TableCell>
                            {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewThread(threadId)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  {isUnread ? 'View & Mark Read' : 'View'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openDeleteAlert(threadId)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Thread
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
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
              This action cannot be undone. This will permanently delete this entire message thread.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{threadToView ? threads[threadToView][0].subject : ''}</DialogTitle>
            <DialogDescription>
              Conversation with {threadToView ? threads[threadToView][0].sender.name : ''}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow pr-4 -mr-6">
            {threadToView && threads[threadToView] && (
              <div className="space-y-4 py-4">
                {threads[threadToView].map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'p-4 rounded-md flex gap-4',
                      message.sender.type === 'admin' ? 'bg-primary/10' : 'bg-card border',
                    )}
                  >
                    <div className="shrink-0 mt-1">
                      {message.sender.type === 'admin' ? (
                        <Reply className="h-5 w-5 text-primary" />
                      ) : (
                        <Mail className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-baseline">
                        <p className="font-semibold">{message.sender.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(message.createdAt), 'dd MMM yyyy, p')}
                        </p>
                      </div>
                      <p className="mt-2 text-sm whitespace-pre-wrap">{message.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="flex-shrink-0 pt-4 border-t">
            <Form {...replyForm}>
              <form onSubmit={replyForm.handleSubmit(handleSendReply)} className="space-y-4">
                <FormField
                  control={replyForm.control}
                  name="replyMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold flex items-center gap-2">
                        <Reply className="h-4 w-4" /> Reply
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Type your reply here..." rows={4} />
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
        </DialogContent>
      </Dialog>
    </div>
  )
}
