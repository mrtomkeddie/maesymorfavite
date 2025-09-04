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
import { Loader2, CheckCircle, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import type { NewsPostWithId, CalendarEventWithId } from '@/lib/types';
import { uploadFile } from '@/lib/storage';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { Progress } from '../ui/progress';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { yearGroups as allYearGroups } from './ChildForm';
import { useLanguage } from '@/contexts/LanguageProvider';

const yearGroupOptions = ['All', ...allYearGroups];

// Flexible schema that allows either date OR body (or both)
const formSchema = (t: any) => z.object({
  title_en: z.string().min(5, { message: t.title_message }),
  eventDate: z.date().optional(), // Optional - if filled, creates calendar event
  body_en: z.string().optional(), // Optional - if filled, creates news post
  relevantTo: z.array(z.string()).default(['All']),
  isUrgent: z.boolean().default(false),
  showOnHomepage: z.boolean().default(false),
  attachment: z.any().optional(),
}).refine((data) => {
  // Must have either a date (for calendar) or body text (for news) or both
  return data.eventDate || (data.body_en && data.body_en.length >= 10);
}, {
  message: t.validation_message,
  path: ['body_en'], // Show error on body field
});

const content = {
  en: {
    formSchema: {
      title_message: 'Title must be at least 5 characters.',
      validation_message: 'Either select a date (for calendar event) or write body text (for news post), or both.',
    },
    titleLabel: 'Announcement Title',
    titlePlaceholder: 'e.g., School Sports Day',
    dateLabel: 'Event Date (Optional)',
    datePlaceholder: 'Pick a date to create a calendar event',
    bodyLabel: 'Body Text (Optional)',
    bodyPlaceholder: 'Write announcement details to create a news post...',
    relevantToLabel: 'Relevant To',
    relevantToDesc: 'Select which year groups this applies to.',
    urgentLabel: 'Urgent Alert',
    urgentDesc: 'Mark as urgent - creates a homepage banner regardless of other settings.',
    homepageLabel: 'Show on Homepage',
    homepageDesc: 'Display this announcement prominently on the public homepage.',
    attachmentLabel: 'Attachment (Optional)',
    attachmentDesc: 'Upload a PDF or image if needed.',
    uploadComplete: 'Upload complete!',
    logicExplanation: {
      title: 'How This Works:',
      dateOnly: '📅 Date only → Creates calendar event',
      bodyOnly: '📰 Body text only → Creates news post',
      both: '📅📰 Date + Body → Creates both calendar event and news post',
      urgent: '🚨 Urgent → Always creates news post with homepage banner',
    },
    toastSuccess: {
      newsOnly: { title: 'Success!', description: 'News post created.' },
      eventOnly: { title: 'Success!', description: 'Calendar event created.' },
      both: { title: 'Success!', description: 'News post and calendar event created.' },
      update: { title: 'Success!', description: 'Announcement updated.' },
    },
    toastError: {
      title: 'Error',
      description: 'Something went wrong. Please try again.',
    },
    submitButton: 'Create Announcement',
    submitButtonUpdate: 'Update Announcement',
  },
  cy: {
    formSchema: {
      title_message: 'Rhaid i\'r teitl fod o leiaf 5 nod.',
      validation_message: 'Naill ai dewiswch ddyddiad (ar gyfer digwyddiad calendr) neu ysgrifennwch destun corff (ar gyfer post newyddion), neu\'r ddau.',
    },
    titleLabel: 'Teitl y Cyhoeddiad',
    titlePlaceholder: 'e.e., Diwrnod Chwaraeon Ysgol',
    dateLabel: 'Dyddiad Digwyddiad (Dewisol)',
    datePlaceholder: 'Dewiswch ddyddiad i greu digwyddiad calendr',
    bodyLabel: 'Testun Corff (Dewisol)',
    bodyPlaceholder: 'Ysgrifennwch fanylion y cyhoeddiad i greu post newyddion...',
    relevantToLabel: 'Perthnasol i',
    relevantToDesc: 'Dewiswch pa grwpiau blwyddyn y mae hyn yn berthnasol iddynt.',
    urgentLabel: 'Hysbysiad Brys',
    urgentDesc: 'Nodwch fel brys - yn creu baner tudalen gartref beth bynnag fo\'r gosodiadau eraill.',
    homepageLabel: 'Dangos ar y Tudalen Gartref',
    homepageDesc: 'Dangoswch y cyhoeddiad hwn yn amlwg ar y dudalen gartref gyhoeddus.',
    attachmentLabel: 'Atodiad (Dewisol)',
    attachmentDesc: 'Uwchlwythwch PDF neu ddelwedd os oes angen.',
    uploadComplete: 'Wedi\'i uwchlwytho\'n llwyddiannus!',
    logicExplanation: {
      title: 'Sut Mae Hyn yn Gweithio:',
      dateOnly: '📅 Dyddiad yn unig → Creu digwyddiad calendr',
      bodyOnly: '📰 Testun corff yn unig → Creu post newyddion',
      both: '📅📰 Dyddiad + Corff → Creu digwyddiad calendr a post newyddion',
      urgent: '🚨 Brys → Bob amser yn creu post newyddion gyda baner tudalen gartref',
    },
    toastSuccess: {
      newsOnly: { title: 'Llwyddiant!', description: 'Post newyddion wedi\'i greu.' },
      eventOnly: { title: 'Llwyddiant!', description: 'Digwyddiad calendr wedi\'i greu.' },
      both: { title: 'Llwyddiant!', description: 'Post newyddion a digwyddiad calendr wedi\'u creu.' },
      update: { title: 'Llwyddiant!', description: 'Cyhoeddiad wedi\'i ddiweddaru.' },
    },
    toastError: {
      title: 'Gwall',
      description: 'Aeth rhywbeth o\'i le. Rhowch gynnig arall arni.',
    },
    submitButton: 'Creu Cyhoeddiad',
    submitButtonUpdate: 'Diweddaru Cyhoeddiad',
  }
};

interface AnnouncementFormProps {
  onSuccess: () => void;
  existingAnnouncement?: (NewsPostWithId | CalendarEventWithId) | null;
}

export function AnnouncementForm({ onSuccess, existingAnnouncement }: AnnouncementFormProps) {
  const { language } = useLanguage();
  const t = content[language];
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(t.formSchema)),
    defaultValues: {
      title_en: existingAnnouncement?.title_en || '',
      eventDate: existingAnnouncement && 'start' in existingAnnouncement ? new Date(existingAnnouncement.start) : undefined,
      body_en: existingAnnouncement && 'body_en' in existingAnnouncement ? existingAnnouncement.body_en : '',
      relevantTo: existingAnnouncement && 'relevantTo' in existingAnnouncement ? existingAnnouncement.relevantTo : ['All'],
      isUrgent: existingAnnouncement?.isUrgent || false,
      showOnHomepage: existingAnnouncement?.showOnHomepage || false,
    },
  });

  const watchedDate = form.watch('eventDate');
  const watchedBody = form.watch('body_en');
  const watchedUrgent = form.watch('isUrgent');

  // Determine what will be created based on form state
  const getCreationPreview = () => {
    const hasDate = !!watchedDate;
    const hasBody = watchedBody && watchedBody.length >= 10;
    const isUrgent = watchedUrgent;

    if (isUrgent) {
      return hasDate ? 'both' : 'newsOnly'; // Urgent always creates news, plus event if date provided
    }
    if (hasDate && hasBody) return 'both';
    if (hasDate) return 'eventOnly';
    if (hasBody) return 'newsOnly';
    return null;
  };

  const onSubmit = async (values: z.infer<ReturnType<typeof formSchema>>) => {
    setIsLoading(true);
    try {
      let attachmentUrl = '';
      
      // Handle file upload
      if (values.attachment) {
        setUploadProgress(0);
        attachmentUrl = await uploadFile(values.attachment, (progress) => {
          setUploadProgress(progress);
        });
        setUploadProgress(100);
      }

      const hasDate = !!values.eventDate;
      const hasBody = values.body_en && values.body_en.length >= 10;
      const isUrgent = values.isUrgent;

      let createdNews = false;
      let createdEvent = false;

      // Logic: Urgent always creates news post
      if (isUrgent || hasBody) {
        const newsData = {
          title_en: values.title_en,
          body_en: values.body_en || values.title_en, // Use title as body if no body provided (for urgent-only posts)
          isUrgent: values.isUrgent,
          attachmentUrl,
          createdAt: new Date().toISOString(),
        };

        if (existingAnnouncement && 'body_en' in existingAnnouncement) {
          await db.updateNews(existingAnnouncement.id, newsData);
        } else {
          await db.addNews(newsData);
        }
        createdNews = true;
      }

      // Logic: Date always creates calendar event
      if (hasDate) {
        const eventData = {
          title_en: values.title_en,
          start: values.eventDate!.toISOString(),
          description_en: values.body_en || '', // Use body as description if provided
          relevantTo: values.relevantTo,
          isUrgent: values.isUrgent,
          showOnHomepage: values.showOnHomepage,
          attachmentUrl,
          createdAt: new Date().toISOString(),
        };

        if (existingAnnouncement && 'start' in existingAnnouncement) {
          await db.updateCalendarEvent(existingAnnouncement.id, eventData);
        } else {
          await db.addCalendarEvent(eventData);
        }
        createdEvent = true;
      }

      // Show appropriate success message
      let successMessage;
      if (existingAnnouncement) {
        successMessage = t.toastSuccess.update;
      } else if (createdNews && createdEvent) {
        successMessage = t.toastSuccess.both;
      } else if (createdEvent) {
        successMessage = t.toastSuccess.eventOnly;
      } else {
        successMessage = t.toastSuccess.newsOnly;
      }

      toast({
        title: successMessage.title,
        description: successMessage.description,
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: t.toastError.title,
        description: t.toastError.description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
    }
  };

  const creationPreview = getCreationPreview();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Logic Explanation Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">{t.logicExplanation.title}</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>{t.logicExplanation.dateOnly}</div>
            <div>{t.logicExplanation.bodyOnly}</div>
            <div>{t.logicExplanation.both}</div>
            <div>{t.logicExplanation.urgent}</div>
          </div>
          {creationPreview && (
            <div className="mt-3 p-2 bg-blue-100 rounded text-sm font-medium text-blue-900">
              ✨ This will create: {creationPreview === 'both' ? 'News Post + Calendar Event' : 
                                  creationPreview === 'eventOnly' ? 'Calendar Event' : 'News Post'}
            </div>
          )}
        </div>

        {/* Title Field */}
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

        {/* Event Date Field */}
        <FormField
          control={form.control}
          name="eventDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t.dateLabel}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
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
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Leave empty if this is just a news announcement without a specific date.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Body Text Field */}
        <FormField
          control={form.control}
          name="body_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.bodyLabel}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t.bodyPlaceholder}
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Leave empty if this is just a calendar event without detailed news content.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Year Groups */}
        <FormField
          control={form.control}
          name="relevantTo"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">{t.relevantToLabel}</FormLabel>
                <FormDescription>{t.relevantToDesc}</FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-2">
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
                                return checked
                                  ? field.onChange([...field.value, item])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
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

        {/* Urgent Switch */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">{t.urgentLabel}</FormLabel>
            <FormDescription>{t.urgentDesc}</FormDescription>
          </div>
          <FormField
            control={form.control}
            name="isUrgent"
            render={({ field }) => (
              <FormItem className="ml-4">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Homepage Switch */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">{t.homepageLabel}</FormLabel>
            <FormDescription>{t.homepageDesc}</FormDescription>
          </div>
          <FormField
            control={form.control}
            name="showOnHomepage"
            render={({ field }) => (
              <FormItem className="ml-4">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Attachment Field */}
        <FormField
          control={form.control}
          name="attachment"
          render={({ field: { onChange, ...rest } }) => (
            <FormItem>
              <FormLabel>{t.attachmentLabel}</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept="application/pdf,image/*" 
                  onChange={(e) => onChange(e.target.files?.[0])}
                  {...rest}
                />
              </FormControl>
              <FormDescription>{t.attachmentDesc}</FormDescription>
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
            {existingAnnouncement ? t.submitButtonUpdate : t.submitButton}
          </Button>
        </div>
      </form>
    </Form>
  );
}