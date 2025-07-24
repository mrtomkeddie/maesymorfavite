
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
import { Switch } from '@/components/ui/switch';
import { Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addCalendarEvent, updateCalendarEvent, CalendarEventWithId } from '@/lib/firebase/firestore';
import { uploadFile } from '@/lib/firebase/storage';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Progress } from '../ui/progress';
import { Checkbox } from '../ui/checkbox';
import { yearGroups as allYearGroups } from './ChildForm';

const yearGroupOptions = ['All', ...allYearGroups];

const formSchema = z.object({
  title_en: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  start: z.date({ required_error: 'An event date is required.' }),
  description_en: z.string().optional(),
  relevantTo: z.array(z.string()).refine(value => value.some(item => item), {
      message: "You have to select at least one year group.",
  }),
  isUrgent: z.boolean().default(false),
  showOnHomepage: z.boolean().default(false),
  attachment: z.any().optional(),
  crossPostToNews: z.boolean().default(false),
});

type CalendarFormValues = z.infer<typeof formSchema>;

interface CalendarFormProps {
  onSuccess: () => void;
  existingEvent?: CalendarEventWithId | null;
}

export function CalendarForm({ onSuccess, existingEvent }: CalendarFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const form = useForm<CalendarFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title_en: existingEvent?.title_en || '',
      start: existingEvent ? new Date(existingEvent.start) : new Date(),
      description_en: existingEvent?.description_en || '',
      relevantTo: existingEvent?.relevantTo || ['All'],
      isUrgent: existingEvent?.isUrgent || false,
      showOnHomepage: existingEvent?.showOnHomepage || false,
      attachment: undefined,
      crossPostToNews: !!existingEvent?.linkedNewsPostId,
    },
  });

  const onSubmit = async (values: CalendarFormValues) => {
    setIsLoading(true);

    try {
      let attachmentUrl = existingEvent?.attachmentUrl || '';
      let attachmentName = existingEvent?.attachmentName || '';
      const fileToUpload = values.attachment instanceof File ? values.attachment : null;

      if (fileToUpload) {
        setUploadProgress(0);
        attachmentUrl = await uploadFile(fileToUpload, 'calendar-attachments', (progress) => {
            setUploadProgress(progress);
        });
        attachmentName = fileToUpload.name;
        setUploadProgress(100);
      }

      const eventPayload = {
        title_en: values.title_en,
        title_cy: values.title_en, // For now, Welsh is same as English
        description_en: values.description_en,
        description_cy: values.description_en,
        start: values.start.toISOString(),
        allDay: true, // Simplified for now
        isUrgent: values.isUrgent,
        showOnHomepage: values.showOnHomepage,
        relevantTo: values.relevantTo,
        attachmentUrl: attachmentUrl,
        attachmentName: attachmentName,
        tags: [], // Simplified for now
        published: true,
        linkedNewsPostId: existingEvent?.linkedNewsPostId, // Preserve existing link
      };


      if (existingEvent) {
        await updateCalendarEvent(existingEvent.id, eventPayload, values.crossPostToNews);
        toast({
          title: 'Success!',
          description: 'Calendar event has been updated.',
        });
      } else {
        await addCalendarEvent(eventPayload, values.crossPostToNews);
        toast({
          title: 'Success!',
          description: 'New calendar event has been created.',
        });
      }
      
      form.reset();
      onSuccess();

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., School Sports Day" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="start"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Event</FormLabel>
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
          name="description_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide more details about the event..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         <FormField
          control={form.control}
          name="relevantTo"
          render={({ field }) => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Relevant To</FormLabel>
                <FormDescription>
                  Select which year groups this event applies to.
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {yearGroupOptions.map((item) => (
                <FormField
                  key={item}
                  control={form.control}
                  name="relevantTo"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item)}
                            onCheckedChange={(checked) => {
                              const newValues = field.value ? [...field.value] : [];
                              if (checked) {
                                  if (item === 'All') {
                                    return field.onChange(['All']);
                                  }
                                  // Add item, and remove 'All' if it exists
                                  newValues.push(item);
                                  const allIndex = newValues.indexOf('All');
                                  if (allIndex > -1) {
                                      newValues.splice(allIndex, 1);
                                  }
                                  return field.onChange(newValues);
                              } else {
                                  // Remove item
                                  return field.onChange(
                                    newValues?.filter(
                                      (value) => value !== item
                                    )
                                  )
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />


        <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <FormLabel>Urgent Alert</FormLabel>
                    <FormDescription>
                        Mark this as an urgent announcement.
                    </FormDescription>
                </div>
                <FormField control={form.control} name="isUrgent" render={({ field }) => (
                    <FormItem><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <FormLabel>Show on Homepage</FormLabel>
                    <FormDescription>
                        Display this event on the public homepage.
                    </FormDescription>
                </div>
                <FormField control={form.control} name="showOnHomepage" render={({ field }) => (
                    <FormItem><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <FormLabel>Cross-post to News</FormLabel>
                    <FormDescription>
                        Automatically create a news item for this event.
                    </FormDescription>
                </div>
                <FormField control={form.control} name="crossPostToNews" render={({ field }) => (
                    <FormItem><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />
            </div>
        </div>
        
         <FormField
          control={form.control}
          name="attachment"
          render={({ field: { onChange, ...rest } }) => (
            <FormItem>
              <FormLabel>Attachment (Optional)</FormLabel>
              <FormControl>
                 <div className="relative">
                    <Input 
                        type="file" 
                        accept="application/pdf,image/*" 
                        onChange={(e) => onChange(e.target.files?.[0])}
                        {...rest}
                    />
                </div>
              </FormControl>
              <FormDescription>
                Upload a PDF or image if needed (e.g., a permission slip).
              </FormDescription>
              {uploadProgress !== null && uploadProgress < 100 && (
                <Progress value={uploadProgress} className="w-full mt-2" />
              )}
              {uploadProgress === 100 && (
                <div className="flex items-center text-sm text-green-600 mt-2">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Upload complete!</span>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingEvent ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
