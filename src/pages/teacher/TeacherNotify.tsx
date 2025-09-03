import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { StaffMemberWithId } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageProvider';

const formSchema = (t: any) => z.object({
  type: z.enum(['Incident', 'Achievement', 'General'], {
    required_error: t.type_required,
  }),
  notes: z.string().min(10, {
    message: t.notes_message,
  }),
  treatmentGiven: z.string().optional(),
});

const content = {
  en: {
    formSchema: {
      type_required: 'Please select a notification type.',
      notes_message: 'Notes must be at least 10 characters.',
    },
    title: 'Send Parent Notification',
    description: 'Send a one-way notification to the parent/guardian of {childName}.',
    backLink: 'Back to Class List',
    noChild: 'No child selected.',
    goBack: 'Go back to dashboard',
    form: {
      title: 'Notification Details',
      description: "This will appear on the parent's dashboard immediately.",
      typeLabel: 'Notification Type',
      typePlaceholder: 'Select a type...',
      typeAchievement: 'Achievement',
      typeIncident: 'Incident (e.g., head bump)',
      typeGeneral: 'General Note',
      notesLabel: 'Notes',
      notesPlaceholder: 'Provide details about the achievement, incident, or general note...',
      treatmentLabel: 'Treatment Given (Optional)',
      treatmentPlaceholder: 'e.g., Cold compress applied, cleaned with wipe',
      submitButton: 'Send Notification',
    },
    toast: {
      noChildError: 'No child selected.',
      success: 'A notification has been sent to the parent/guardian of {childName}.',
      error: 'Could not send the notification. Please try again.',
    },
  },
  cy: {
    formSchema: {
      type_required: 'Dewiswch fath o hysbysiad.',
      notes_message: "Rhaid i'r nodiadau fod o leiaf 10 nod.",
    },
    title: 'Anfon Hysbysiad at Riant',
    description: "Anfonwch hysbysiad unffordd at riant/gwarcheidwad {childName}.",
    backLink: "Yn ôl i Restr y Dosbarth",
    noChild: 'Ni ddewiswyd plentyn.',
    goBack: "Ewch yn ôl i'r dangosfwrdd",
    form: {
      title: 'Manylion yr Hysbysiad',
      description: "Bydd hyn yn ymddangos ar ddangosfwrdd y rhiant ar unwaith.",
      typeLabel: 'Math o Hysbysiad',
      typePlaceholder: 'Dewiswch fath...',
      typeAchievement: 'Cyflawniad',
      typeIncident: 'Digwyddiad (e.e., bump pen)',
      typeGeneral: 'Nodyn Cyffredinol',
      notesLabel: 'Nodiadau',
      notesPlaceholder: "Rhowch fanylion am y cyflawniad, y digwyddiad, neu'r nodyn cyffredinol...",
      treatmentLabel: 'Triniaeth a Roddwyd (Dewisol)',
      treatmentPlaceholder: "e.e., Rhoddwyd cywasgiad oer, glanhawyd â chadach",
      submitButton: 'Anfon Hysbysiad',
    },
    toast: {
      noChildError: 'Ni ddewiswyd plentyn.',
      success: "Mae hysbysiad wedi'i anfon at riant/gwarcheidwad {childName}.",
      error: 'Ni ellid anfon yr hysbysiad. Rhowch gynnig arall arni.',
    },
  },
};

function NotifyPageContent() {
  const { language } = useLanguage();
  const t = content[language];
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [teacher, setTeacher] = useState<StaffMemberWithId | null>(null);
  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  const childId = searchParams.get('childId') || undefined;
  const childName = searchParams.get('childName') || undefined;

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        let userId = 'mock-teacher-id-1';
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            userId = session.user.id;
          } else {
            const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
            const role = localStorage.getItem('userRole');
            if (isAuthenticated && role === 'teacher') {
              userId = 'mock-teacher-id-1';
            } else {
              // If not authenticated at all, exit early and allow ProtectedRoute to handle
              return;
            }
          }
        }
        const teacherData = await db.getTeacherAndClass(userId);
        if (teacherData) setTeacher(teacherData.teacher);
      } catch (e) {
        // Fail silently; we fallback to mock ids
      }
    };
    fetchTeacher();
  }, [isSupabaseConfigured]);

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(t.formSchema)),
    defaultValues: {
      notes: '',
      treatmentGiven: '',
    },
  });

  const notificationType = form.watch('type');

  async function onSubmit(values: z.infer<ReturnType<typeof formSchema>>) {
    if (!childId || !childName) {
      toast({ title: 'Error', description: t.toast.noChildError, variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const parentId = 'parent-1';
      await db.addParentNotification({
        childId,
        childName,
        parentId,
        teacherId: teacher?.userId || 'mock-teacher-id-1',
        teacherName: teacher?.name || 'Teacher',
        date: new Date().toISOString(),
        type: values.type,
        notes: values.notes,
        treatmentGiven: values.treatmentGiven,
        isRead: false,
      });

      toast({ title: 'Notification Sent', description: t.toast.success.replace('{childName}', childName) });
      navigate('/teacher/outbox');
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast({ title: 'Submission Failed', description: t.toast.error, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  if (!childName) {
    return (
      <div className="text-center">
        <p>{t.noChild}</p>
        <Button asChild variant="link">
          <Link to="/teacher/dashboard">{t.goBack}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/teacher/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t.backLink}
      </Link>
      <div>
        <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
        <p className="text-muted-foreground">{t.description.replace('{childName}', childName)}</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t.form.title}</CardTitle>
          <CardDescription>{t.form.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.form.typeLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.form.typePlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Achievement">{t.form.typeAchievement}</SelectItem>
                        <SelectItem value="Incident">{t.form.typeIncident}</SelectItem>
                        <SelectItem value="General">{t.form.typeGeneral}</SelectItem>
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
                    <FormLabel>{t.form.notesLabel}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t.form.notesPlaceholder} {...field} />
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
                      <FormLabel>{t.form.treatmentLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.form.treatmentPlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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

export default function TeacherNotify() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotifyPageContent />
    </Suspense>
  );
}
