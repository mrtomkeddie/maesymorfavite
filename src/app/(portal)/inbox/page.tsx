
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Inbox, ArrowRight, ChevronsUpDown, Mail, Reply } from 'lucide-react';
import { db } from '@/lib/db';
import type { InboxMessageWithId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/app/(public)/LanguageProvider';
import { LanguageToggle } from '../layout';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const content = {
    en: {
        title: 'Inbox',
        description: 'Messages and replies from the school.',
        noMessages: 'Your inbox is empty.',
        noMessagesDesc: "You don't have any messages yet.",
        from: "From:",
        you: "You"
    },
    cy: {
        title: 'Mewnflwch',
        description: 'Negeseuon ac atebion gan yr ysgol.',
        noMessages: 'Mae eich mewnflwch yn wag.',
        noMessagesDesc: "Nid oes gennych unrhyw negeseuon eto.",
        from: "Oddi wrth:",
        you: "Chi"
    }
}

export default function ParentInboxPage() {
    const { language } = useLanguage();
    const t = content[language];
    const [threads, setThreads] = useState<Record<string, InboxMessageWithId[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(undefined);

    // Mocked user ID for development
    const currentUserId = 'parent-1'; 

    useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                const userMessages = await db.getInboxMessagesForUser(currentUserId);
                
                // Group messages by threadId
                const groupedByThread: Record<string, InboxMessageWithId[]> = {};
                userMessages.forEach(msg => {
                    const threadId = msg.threadId || msg.id;
                    if (!groupedByThread[threadId]) {
                        groupedByThread[threadId] = [];
                    }
                    groupedByThread[threadId].push(msg);
                });
                
                // Sort messages within each thread by date
                for (const threadId in groupedByThread) {
                    groupedByThread[threadId].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                }

                // Sort threads by the date of the last message
                const sortedThreadIds = Object.keys(groupedByThread).sort((a, b) => {
                    const lastMessageA = groupedByThread[a][groupedByThread[a].length - 1];
                    const lastMessageB = groupedByThread[b][groupedByThread[b].length - 1];
                    return new Date(lastMessageB.createdAt).getTime() - new Date(lastMessageA.createdAt).getTime();
                });
                
                const sortedThreads: Record<string, InboxMessageWithId[]> = {};
                sortedThreadIds.forEach(id => {
                    sortedThreads[id] = groupedByThread[id];
                });

                setThreads(sortedThreads);

            } catch (error) {
                console.error("Failed to fetch inbox messages:", error);
                toast({
                    title: "Error",
                    description: "Could not load your messages.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [toast]);

    const handleAccordionChange = async (value: string) => {
        setActiveAccordionItem(value);
        const threadMessages = threads[value];
        if (!threadMessages) return;

        // Find unread messages in this thread and mark them as read
        for (const message of threadMessages) {
            if (message.recipient.id === currentUserId && !message.isReadByParent) {
                try {
                    await db.updateInboxMessage(message.id, { isReadByParent: true });
                    // Optimistically update the UI
                    setThreads(prev => {
                        const newThreads = {...prev};
                        const threadToUpdate = newThreads[value].map(m => 
                            m.id === message.id ? {...m, isReadByParent: true } : m
                        );
                        newThreads[value] = threadToUpdate;
                        return newThreads;
                    });
                } catch (error) {
                    console.error("Failed to mark message as read:", error);
                }
            }
        }
    };
    
    const hasUnread = (thread: InboxMessageWithId[]) => {
        return thread.some(m => m.recipient.id === currentUserId && !m.isReadByParent);
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
                    <p className="text-muted-foreground">{t.description}</p>
                </div>
                <LanguageToggle />
            </div>

            {Object.keys(threads).length === 0 ? (
                 <Card className="text-center p-12 border-dashed">
                    <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-semibold">{t.noMessages}</h2>
                    <p className="mt-2 text-muted-foreground">{t.noMessagesDesc}</p>
                </Card>
            ) : (
                 <Accordion 
                    type="single" 
                    collapsible 
                    className="w-full space-y-4"
                    value={activeAccordionItem}
                    onValueChange={handleAccordionChange}
                >
                    {Object.entries(threads).map(([threadId, messages]) => {
                        const firstMessage = messages[0];
                        const lastMessage = messages[messages.length - 1];
                        return (
                            <AccordionItem value={threadId} key={threadId} className="border rounded-lg bg-card">
                                <AccordionTrigger className={cn("p-4 hover:no-underline", hasUnread(messages) && 'font-bold')}>
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="flex-grow text-left">
                                            <p className="truncate">{firstMessage.subject}</p>
                                            <p className="text-sm text-muted-foreground font-normal">
                                                {messages.length > 1 ? `${messages.length} messages` : '1 message'} - Last update {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                         {hasUnread(messages) && <Badge>New</Badge>}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 border-t">
                                    <div className="space-y-6">
                                        {messages.map(message => (
                                            <div key={message.id} className={cn(
                                                "p-4 rounded-md flex gap-4",
                                                message.sender.type === 'admin' ? "bg-muted" : "bg-primary/10"
                                            )}>
                                                <div className="shrink-0">
                                                    {message.sender.type === 'admin' ? <Reply className="h-5 w-5 text-primary" /> : <Mail className="h-5 w-5 text-primary" />}
                                                </div>
                                                <div className="flex-grow">
                                                     <div className="flex justify-between items-baseline">
                                                        <p className="font-semibold">
                                                            {message.sender.type === 'admin' ? message.sender.name : t.you}
                                                        </p>
                                                         <p className="text-xs text-muted-foreground">
                                                            {format(new Date(message.createdAt), 'dd MMM yyyy, p')}
                                                        </p>
                                                    </div>
                                                    <p className="mt-2 text-sm whitespace-pre-wrap">{message.body}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            )}
        </div>
    );
}

