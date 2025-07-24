
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { addInboxMessage } from '@/lib/firebase/firestore';

const mockChildren = [
  { id: 'child_1', name: 'Charlie K.' },
  { id: 'child_2', name: 'Sophie K.' },
];

const absenceFormSchema = z.object({
  childId: z.string({
    required_error: 'Please select a child.',
  }),
  absenceDate: z.date({
    required_error: 'A date of absence is required.',
  }),
  reason: z.string().min(10, {
    message: 'Please provide a brief reason for the absence (at least 10 characters).',
  }),
  document: z.any().optional(),
});

export default function AbsencePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof absenceFormSchema>>({
    resolver: zodResolver(absenceFormSchema),
    defaultValues: {
        reason: "",
    }
  });

  async function onSubmit(values: z.infer<typeof absenceFormSchema>) {
    setIsLoading(true);
    
    // In a real app, you'd get the logged-in parent's info
    const parentInfo = { name: "Jane Doe", email: "parent@example.com" };
    const childName = mockChildren.find(c => c.id === values.childId)?.name || 'Unknown Child';

    const messageBody = `
Child: ${childName}
Date of Absence: ${format(values.absenceDate, 'PPP')}
Reason: ${values.reason}
---
Submitted by: ${parentInfo.name} (${parentInfo.email})
    `;
    
    try {
        await addInboxMessage({
            type: 'absence',
            subject: `Absence Report for ${childName}`,
            body: messageBody,
            sender: parentInfo,
            isRead: false,
            createdAt: new Date().toISOString(),
        });
        
        toast({
            title: "Absence Reported Successfully",
            description: `We've received the absence report for ${childName}. The school office has been notified.`,
            variant: 'default',
        });
        
        form.reset();

    } catch (error) {
        console.error("Failed to submit absence report:", error);
        toast({
            title: "Submission Failed",
            description: "Could not submit the absence report. Please try again later or contact the school office directly.",
            variant: 'destructive',
        });
    }


    setIsLoading(false);
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Report an Absence</CardTitle>
        <CardDescription>
          Please complete the form below to report your child's absence.
          For security, you can only select children linked to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="childId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Child's Name</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your child" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockChildren.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="absenceDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Absence</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-[240px] pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('2023-09-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Absence</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Unwell with a cold."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload a Document (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Input type="file" className="pl-12" onChange={(e) => field.onChange(e.target.files && e.target.files[0])} />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    e.g., a doctor's note or appointment confirmation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Report
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
