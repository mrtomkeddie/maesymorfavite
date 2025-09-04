

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useMemo } from 'react';
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
import { cn } from '@/lib/utils';
import { Upload, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { parentChildren as mockChildren } from '@/lib/mockData';
import { useLanguage } from '@/contexts/LanguageProvider';
import { cy } from 'date-fns/locale';

const absenceFormSchema = (t: any) => z.object({
  childId: z.string({
    required_error: t.childId.required_error,
  }),
  day: z.string().min(1, { message: "Day is required" }),
  month: z.string().min(1, { message: "Month is required" }),
  year: z.string().min(1, { message: "Year is required" }),
  reason: z.string().min(10, {
    message: t.reason.message,
  }),
  document: z.any().optional(),
}).refine((data) => {
  const date = new Date(parseInt(data.year), parseInt(data.month) - 1, parseInt(data.day));
  return date.getDate() == parseInt(data.day) && date.getMonth() == parseInt(data.month) - 1;
}, {
  message: "Please enter a valid date",
  path: ["day"]
});

const content = {
  en: {
    title: "Report an Absence",
    description: "Please complete the form below to report your child's absence.",
    form: {
      title: "Absence Form",
      description: "For security, you can only select children linked to your account.",
      childLabel: "Child's Name",
      childPlaceholder: "Select your child",
      dateLabel: "Date of Absence",
      datePlaceholder: "Pick a date",
      dayLabel: "Day",
      monthLabel: "Month",
      yearLabel: "Year",
      dayPlaceholder: "Select day",
      monthPlaceholder: "Select month",
      yearPlaceholder: "Select year",
      todayButton: "Today",
      yesterdayButton: "Yesterday",
      reasonLabel: "Reason for Absence",
      reasonPlaceholder: "e.g., Unwell with a cold.",
      documentLabel: "Upload a Document (Optional)",
      documentDescription: "e.g., a doctor's note or appointment confirmation.",
      submitButton: "Submit Report",
    },
    success: {
        title: "Absence Reported Successfully",
        description: "We've received the absence report for {childName}. The school office has been notified.",
    },
    error: {
        title: "Submission Failed",
        description: "Could not submit the absence report. Please try again later or contact the school office directly.",
    },
    formSchema: {
        childId: { required_error: 'Please select a child.' },
        absenceDate: { required_error: 'A date of absence is required.' },
        reason: { message: 'Please provide a brief reason for the absence (at least 10 characters).' }
    }
  },
  cy: {
    title: "Riportio Absenoldeb",
    description: "Cwblhewch y ffurflen isod i riportio absenoldeb eich plentyn.",
    form: {
      title: "Ffurflen Absenoldeb",
      description: "Er diogelwch, dim ond plant sy'n gysylltiedig â'ch cyfrif y gallwch eu dewis.",
      childLabel: "Enw'r Plentyn",
      childPlaceholder: "Dewiswch eich plentyn",
      dateLabel: "Dyddiad yr Absenoldeb",
      datePlaceholder: "Dewiswch ddyddiad",
      dayLabel: "Diwrnod",
      monthLabel: "Mis",
      yearLabel: "Blwyddyn",
      dayPlaceholder: "Dewiswch ddiwrnod",
      monthPlaceholder: "Dewiswch fis",
      yearPlaceholder: "Dewiswch flwyddyn",
      todayButton: "Heddiw",
      yesterdayButton: "Ddoe",
      reasonLabel: "Rheswm dros Absenoldeb",
      reasonPlaceholder: "e.e., Yn sâl gydag annwyd.",
      documentLabel: "Uwchlwytho Dogfen (Dewisol)",
      documentDescription: "e.e., nodyn meddyg neu gadarnhad apwyntiad.",
      submitButton: "Cyflwyno'r Adroddiad",
    },
    success: {
        title: "Absenoldeb Wedi'i Riportio'n Llwyddiannus",
        description: "Rydym wedi derbyn yr adroddiad absenoldeb ar gyfer {childName}. Mae swyddfa'r ysgol wedi'i hysbysu.",
    },
    error: {
        title: "Methiant Cyflwyno",
        description: "Ni ellid cyflwyno'r adroddiad absenoldeb. Rhowch gynnig arall arni yn nes ymlaen neu cysylltwch â swyddfa'r ysgol yn uniongyrchol.",
    },
    formSchema: {
        childId: { required_error: 'Dewiswch blentyn.' },
        absenceDate: { required_error: 'Mae angen dyddiad absenoldeb.' },
        reason: { message: 'Rhowch reswm byr dros yr absenoldeb (o leiaf 10 nod).' }
    }
  }
};

export default function AbsencePage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const t = content[language];
  const locale = language === 'cy' ? cy : undefined;
  const currentYear = new Date().getFullYear();

  // Stabilize and memoize messages + schema with safe fallback
  const messages = useMemo(
    () => (content[language]?.formSchema ?? content.en.formSchema),
    [language]
  );
  const schema = useMemo(() => absenceFormSchema(messages), [messages]);

  const form = useForm<z.infer<ReturnType<typeof absenceFormSchema>>>({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: "",
      day: "",
      month: "",
      year: ""
    }
  });

  // Generate options for dropdowns
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: "1", label: language === 'cy' ? "Ionawr" : "January" },
    { value: "2", label: language === 'cy' ? "Chwefror" : "February" },
    { value: "3", label: language === 'cy' ? "Mawrth" : "March" },
    { value: "4", label: language === 'cy' ? "Ebrill" : "April" },
    { value: "5", label: language === 'cy' ? "Mai" : "May" },
    { value: "6", label: language === 'cy' ? "Mehefin" : "June" },
    { value: "7", label: language === 'cy' ? "Gorffennaf" : "July" },
    { value: "8", label: language === 'cy' ? "Awst" : "August" },
    { value: "9", label: language === 'cy' ? "Medi" : "September" },
    { value: "10", label: language === 'cy' ? "Hydref" : "October" },
    { value: "11", label: language === 'cy' ? "Tachwedd" : "November" },
    { value: "12", label: language === 'cy' ? "Rhagfyr" : "December" }
  ];
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i);

  async function onSubmit(values: z.infer<ReturnType<typeof absenceFormSchema>>) {
    setIsLoading(true);
    
    // Convert dropdown values to date
    const absenceDate = new Date(parseInt(values.year), parseInt(values.month) - 1, parseInt(values.day));
    
    // In a real app, you'd get the logged-in parent's info
    const parentInfo = { name: "Jane Doe", email: "parent@example.com" };
    const childName = mockChildren.find(c => c.id === values.childId)?.name || 'Unknown Child';

    const messageBody = `
Child: ${childName}
Date of Absence: ${format(absenceDate, 'PPP', { locale })}
Reason: ${values.reason}
---
Submitted by: ${parentInfo.name} (${parentInfo.email})
    `;
    
    try {
        await db.addInboxMessage({
            type: 'absence',
            subject: `Absence Report for ${childName}`,
            body: messageBody,
            sender: parentInfo,
            isRead: false,
            createdAt: new Date().toISOString(),
        });
        
        toast({
            title: t.success.title,
            description: t.success.description.replace('{childName}', childName),
            variant: 'default',
        });
        
        form.reset();

    } catch (error) {
        console.error("Failed to submit absence report:", error);
        toast({
            title: t.error.title,
            description: t.error.description,
            variant: 'destructive',
        });
    }

    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
        <p className="text-muted-foreground">
           {t.description}
        </p>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{t.form.title}</CardTitle>
          <CardDescription>
            {t.form.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Make Child + Date fields full-width and stacked */}
              <FormField
                control={form.control}
                name="childId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.form.childLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.form.childPlaceholder} />
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

              {/* Date selection with dropdown selectors */}
              <div className="space-y-3">
                <FormLabel>{t.form.dateLabel}</FormLabel>
                
                {/* Quick date buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      form.setValue('day', today.getDate().toString());
                      form.setValue('month', (today.getMonth() + 1).toString());
                      form.setValue('year', today.getFullYear().toString());
                    }}
                    className="text-sm hover:bg-red-50 hover:text-red-900 hover:border-red-300"
                  >
                    {t.form.todayButton}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      form.setValue('day', yesterday.getDate().toString());
                      form.setValue('month', (yesterday.getMonth() + 1).toString());
                      form.setValue('year', yesterday.getFullYear().toString());
                    }}
                    className="text-sm hover:bg-red-50 hover:text-red-900 hover:border-red-300"
                  >
                    {t.form.yesterdayButton}
                  </Button>
                </div>

                {/* Date dropdown selectors */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.form.dayLabel}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t.form.dayPlaceholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {days.map((day) => (
                              <SelectItem key={day} value={day.toString()}>
                                {day}
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
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.form.monthLabel}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t.form.monthPlaceholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
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
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.form.yearLabel}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t.form.yearPlaceholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {/* End stacked fields */}

              <div className="space-y-6">
                {/* Reason and Document unchanged */}
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.form.reasonLabel}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t.form.reasonPlaceholder}
                          className="resize-none min-h-[120px]"
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
                      <FormLabel>{t.form.documentLabel}</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Input type="file" className="pl-12" onChange={(e) => field.onChange(e.target.files && e.target.files[0])} />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Upload className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        {t.form.documentDescription}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.form.submitButton}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
