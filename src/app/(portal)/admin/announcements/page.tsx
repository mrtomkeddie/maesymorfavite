'use client';

import { suggestAnnouncementCopy } from '@/ai/flows/suggest-announcement-copy';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles, Copy } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { runFlow } from '@genkit-ai/next/client';


const formSchema = z.object({
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters.' }).max(200, {message: 'Prompt cannot exceed 200 characters.'}),
});

export default function AnnouncementsAiPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestion('');
    try {
      const result = await runFlow(suggestAnnouncementCopy, values.prompt);
      setSuggestion(result);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Generating Copy',
        description: 'There was a problem contacting the AI service. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = () => {
    if (!suggestion) return;
    navigator.clipboard.writeText(suggestion);
    toast({
        title: 'Copied to Clipboard!',
        description: 'The suggested announcement copy has been copied.'
    });
  }

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">AI Announcement Helper</h1>
            <p className="text-muted-foreground">Enter a simple prompt and let AI craft the perfect announcement for parents.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>1. Write your prompt</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="prompt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Announcement details</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="e.g., 'sports day is next friday, starts at 10am, parents welcome'"
                                                rows={5}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="mr-2 h-4 w-4" />
                                )}
                                Generate Copy
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>2. Review Suggestion</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    {isLoading && (
                        <div className="flex h-full min-h-[180px] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    {!isLoading && suggestion && (
                        <div className="relative">
                            <Textarea value={suggestion} onChange={(e) => setSuggestion(e.target.value)} rows={8} className="bg-secondary pr-12"/>
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleCopy}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    {!isLoading && !suggestion && (
                        <div className="flex h-full min-h-[180px] flex-col items-center justify-center rounded-md border-2 border-dashed bg-secondary/50 p-8 text-center">
                            <Sparkles className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-4 text-sm text-muted-foreground">Your suggested announcement will appear here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
