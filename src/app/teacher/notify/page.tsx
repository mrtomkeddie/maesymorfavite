

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, Suspense } from 'react';
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
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const formSchema = z.object({
  type: z.enum(['Incident', 'Achievement', 'General'], {
    required_error: "Please select a notification type.",
  }),
  notes: z.string().min(10, {
    message: "Notes must be at least 10 characters.",
  }),
  treatmentGiven: z.string().optional(),
});

function NotifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const childId = searchParams.get('childId');
  const childName = searchParams.get('childName');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
      treatmentGiven: "",
    },
  });

  const notificationType = form.watch('type');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!childId || !childName) {
        toast({ title: "Error", description: "No child selected.", variant: "destructive" });
        return;
    }
    
    setIsLoading(true);

    try {
        // This logic is simplified. In a real app, you'd fetch parent and teacher details.
        const parentId = 'parent-1'; // This should be dynamically fetched based on childId
        const teacherId = 'teacher-1'; // This should come from the logged-in user's session
        const teacherName = "Teacher"; // Logged-in teacher's name

        await db.addParentNotification({
            childId,
            childName,
            parentId,
            teacherId,
            teacherName,
            date: new Date().toISOString(),
            type: values.type,
            notes: values.notes,
            treatmentGiven: values.treatmentGiven,
            isRead: false,
        });
        
        toast({
            title: "Notification Sent",
            description: `A notification has been sent to the parent/guardian of ${childName}.`,
        });
        
        router.push('/teacher/dashboard');

    } catch (error) {
        console.error("Failed to send notification:", error);
        toast({
            title: "Submission Failed",
            description: "Could not send the notification. Please try again.",
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  }

  if (!childName) {
      return (
          <div className="text-center">
              <p>No child selected.</p>
              <Button asChild variant="link"><Link href="/teacher/dashboard">Go back to dashboard</Link></Button>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <Link href="/teacher/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
      </Link>
      <div>
        <h1 className="text-3xl font-bold font-headline">Send Parent Notification</h1>
        <p className="text-muted-foreground">
           Send a one-way notification to the parent/guardian of <span className="font-semibold text-primary">{childName}</span>.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Notification Details</CardTitle>
          <CardDescription>
            This will appear on the parent's dashboard immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          <SelectItem value="Achievement">Achievement (e.g., certificate)</SelectItem>
                          <SelectItem value="Incident">Incident (e.g., head bump)</SelectItem>
                          <SelectItem value="General">General Note</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide details about the achievement, incident, or general note..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

             {notificationType === 'Incident' && (
                  <FormField
                    control={form.control}
                    name="treatmentGiven"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Treatment Given (Optional)</FormLabel>
                        <FormControl>
                        <Input
                            placeholder="e.g., Cold compress applied, cleaned with wipe"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
             )}

              <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Notification
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NotifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NotifyPageContent />
        </Suspense>
    )
}
