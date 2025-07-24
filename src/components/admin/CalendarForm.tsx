
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
import { useLanguage } from '@/app/(public)/LanguageProvider';

const yearGroupOptions = ['All', ...allYearGroups];

const formSchema = (t: any) => z.object({
  title_en: z.string().min(5, { message: t.title_en_message }),
  start: z.date({ required_error: t.start_required_error }),
  description_en: z.string().optional(),
  relevantTo: z.array(z.string()).refine(value => value.some(item => item), {
      message: t.relevantTo_message,
  }),
  isUrgent: z.boolean().default(false),
  showOnHomepage: z.boolean().default(false),
  attachment: z.any().optional(),
  crossPostToNews: z.boolean().default(false),
});

const content = {
    en: {
        formSchema: {
            title_en_message: 'Title must be at least 5 characters.',
            start_required_error: 'An event date is required.',
            relevantTo_message: "You have to select at least one year group.",
        },
        titleLabel: 'Event Title',
        titlePlaceholder: 'e.g., School Sports Day',
        dateLabel: 'Date of Event',
        datePlaceholder: 'Pick a date',
        descriptionLabel: 'Description (Optional)',
        descriptionPlaceholder: 'Provide more details about the event...',
        relevantToLabel: 'Relevant To',
        relevantToDesc: 'Select which year groups this event applies to.',
        urgentLabel: 'Urgent Alert',
        urgentDesc: 'Mark this as an urgent announcement.',
        homepageLabel: 'Show on Homepage',
        homepageDesc: 'Display this event on the public homepage.',
        crossPostLabel: 'Cross-post to News',
        crossPostDesc: 'Automatically create a news item for this event.',
        attachmentLabel: 'Attachment (Optional)',
        attachmentDesc: "Upload a PDF or image if needed (e.g., a permission slip).",
        uploadComplete: 'Upload complete!',
        toastSuccessUpdate: {
            title: 'Success!',
            description: 'Calendar event has been updated.',
        },
        toastSuccessAdd: {
            title: 'Success!',
            description: 'New calendar event has been created.',
        },
        toastError: {
            title: 'Error',
            description: 'Something went wrong. Please try again.',
        },
        submitButtonUpdate: 'Update Event',
        submitButtonCreate: 'Create Event',
    },
    cy: {
        formSchema: {
            title_en_message: 'Rhaid i\'r teitl fod o leiaf 5 nod.',
            start_required_error: 'Mae angen dyddiad digwyddiad.',
            relevantTo_message: "Rhaid i chi ddewis o leiaf un grŵp blwyddyn.",
        },
        titleLabel: 'Teitl y Digwyddiad',
        titlePlaceholder: 'e.e., Diwrnod Chwaraeon Ysgol',
        dateLabel: 'Dyddiad y Digwyddiad',
        datePlaceholder: 'Dewiswch ddyddiad',
        descriptionLabel: 'Disgrifiad (Dewisol)',
        descriptionPlaceholder: 'Rhowch fwy o fanylion am y digwyddiad...',
        relevantToLabel: 'Perthnasol i',
        relevantToDesc: 'Dewiswch pa grwpiau blwyddyn y mae\'r digwyddiad hwn yn berthnasol iddynt.',
        urgentLabel: 'Hysbysiad Brys',
        urgentDesc: 'Nodwch hwn fel cyhoeddiad brys.',
        homepageLabel: 'Dangos ar y Tudalen Cartref',
        homepageDesc: 'Dangoswch y digwyddiad hwn ar y dudalen gartref gyhoeddus.',
        crossPostLabel: 'Traws-bostio i Newyddion',
        crossPostDesc: 'Creu eitem newyddion yn awtomatig ar gyfer y digwyddiad hwn.',
        attachmentLabel: 'Atodiad (Dewisol)',
        attachmentDesc: "Uwchlwythwch PDF neu ddelwedd os oes angen (e.e., slip caniatâd).",
        uploadComplete: 'Wedi\'i uwchlwytho\'n llwyddiannus!',
        toastSuccessUpdate: {
            title: 'Llwyddiant!',
            description: 'Mae digwyddiad y calendr wedi\'i ddiweddaru.',
        },
        toastSuccessAdd: {
            title: 'Llwyddiant!',
            description: 'Mae digwyddiad calendr newydd wedi\'i greu.',
        },
        toastError: {
            title: 'Gwall',
            description: 'Aeth rhywbeth o\'i le. Rhowch gynnig arall arni.',
        },
        submitButtonUpdate: 'Diweddaru Digwyddiad',
        submitButtonCreate: 'Creu Digwyddiad',
    }
};

interface CalendarFormProps {
  onSuccess: () => void;
  existingEvent?: CalendarEventWithId | null;
}

export function CalendarForm({ onSuccess, existingEvent }: CalendarFormProps) {
  const { language } = useLanguage();
  const t = content[language];
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(t.formSchema)),
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

  const onSubmit = async (values: z.infer<ReturnType<typeof formSchema>>) => {
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
        toast(t.toastSuccessUpdate);
      } else {
        await addCalendarEvent(eventPayload, values.crossPostToNews);
        toast(t.toastSuccessAdd);
      }
      
      form.reset();
      onSuccess();

    } catch (error) {
      console.error('Error submitting form:', error);
      toast(t.toastError);
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
              <FormLabel>{t.titleLabel}</FormLabel>
              <FormControl>
                <Input placeholder={t.titlePlaceholder} {...field} />
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
              <FormLabel>{t.dateLabel}</FormLabel>
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
                        <span>{t.datePlaceholder}</span>
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
              <FormLabel>{t.descriptionLabel}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t.descriptionPlaceholder}
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
                <FormLabel className="text-base">{t.relevantToLabel}</FormLabel>
                <FormDescription>
                  {t.relevantToDesc}
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
                    <FormLabel>{t.urgentLabel}</FormLabel>
                    <FormDescription>
                        {t.urgentDesc}
                    </FormDescription>
                </div>
                <FormField control={form.control} name="isUrgent" render={({ field }) => (
                    <FormItem><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <FormLabel>{t.homepageLabel}</FormLabel>
                    <FormDescription>
                        {t.homepageDesc}
                    </FormDescription>
                </div>
                <FormField control={form.control} name="showOnHomepage" render={({ field }) => (
                    <FormItem><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <FormLabel>{t.crossPostLabel}</FormLabel>
                    <FormDescription>
                        {t.crossPostDesc}
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
              <FormLabel>{t.attachmentLabel}</FormLabel>
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
                {t.attachmentDesc}
              </FormDescription>
              {uploadProgress !== null && uploadProgress < 100 && (
                <Progress value={uploadProgress} className="w-full mt-2" />
              )}
              {uploadProgress === 100 && (
                <div className="flex items-center text-sm text-green-600 mt-2">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>{t.uploadComplete}</span>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingEvent ? t.submitButtonUpdate : t.submitButtonCreate}
          </Button>
        </div>
      </form>
    </Form>
  );
}
