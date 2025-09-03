import { useEffect, useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ArrowLeft, Award } from 'lucide-react';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { StaffMemberWithId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageProvider';
import { format, startOfWeek } from 'date-fns';
import { cy as cyLocale, enGB } from 'date-fns/locale';

const valuesAwardFormSchema = (t: any) => z.object({
  childIds: z.array(z.string()).min(1, {
    message: t.childIds_message,
  }),
  message: z.string().min(10, {
    message: t.message_message,
  }),
});

const content = {
  en: {
    formSchema: {
      childIds_message: 'Please select at least one student.',
      message_message: 'The message must be at least 10 characters.',
    },
    title: 'Values Award',
    description: "Send a personalised values award message to selected students' parents.",
    backLink: 'Back to Dashboard',
    form: {
      title: 'Create Values Award',
      description: 'Select students and personalise the message. Use [STUDENT_NAME] and [TEACHER_NAME] placeholders.',
      studentsLabel: 'Select Students',
      messageLabel: 'Personalised Message',
      messagePlaceholder: "e.g., [STUDENT_NAME] has demonstrated excellent perseverance in class today. - [TEACHER_NAME]",
    },
    weekOf: 'Award for week commencing:',
    toast: {
      success: "Values award sent successfully to selected students' parents.",
      error: 'Failed to send values award. Please try again.',
    },
    submitButton: 'Send Award to {count} Student(s)',
    noStudents: 'No students found for your class.',
  },
  cy: {
    formSchema: {
      childIds_message: 'Dewiswch o leiaf un plentyn.',
      message_message: "Rhaid i'r neges fod yn o leiaf 10 nod.",
    },
    title: 'Gwobr Gwerthoedd',
    description: "Anfonwch neges gwobr gwerthoedd wedi'i phersonoli at rieni'r myfyrwyr a ddewiswyd.",
    backLink: "Yn ôl i'r Dangosfwrdd",
    form: {
      title: 'Creu Gwobr Gwerthoedd',
      description: "Dewiswch fyfyrwyr a phersonoleiddiwch y neges. Defnyddiwch [STUDENT_NAME] a [TEACHER_NAME].",
      studentsLabel: 'Dewiswch Fyfyrwyr',
      messageLabel: "Neges wedi'i Phersonoli",
      messagePlaceholder: "e.e., Mae [STUDENT_NAME] wedi dangos dyfalbarhad rhagorol yn y dosbarth heddiw. - [TEACHER_NAME]",
    },
    weekOf: 'Gwobr am yr wythnos yn dechrau:',
    toast: {
      success: "Anfonwyd y wobr gwerthoedd yn llwyddiannus at rieni'r myfyrwyr a ddewiswyd.",
      error: 'Methwyd â anfon y wobr gwerthoedd. Rhowch gynnig arall arni.',
    },
    submitButton: 'Anfon Gwobr i {count} Myfyriwr',
    noStudents: 'Heb ddod o hyd i fyfyrwyr ar gyfer eich dosbarth.',
  },
};

function ValuesAwardContent() {
  const { language } = useLanguage();
  const t = content[language];
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [teacher, setTeacher] = useState<StaffMemberWithId | null>(null);
  const [students, setStudents] = useState<{ id: string; name: string; parentId?: string }[]>([]);

  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const locale = language === 'cy' ? cyLocale : enGB;
  const defaultMessageTemplate = language === 'cy'
    ? `Annwyl Riant/Gwarcheidwad,\n\nRydym yn falch iawn o'ch hysbysu, am wythnos ${format(weekStart, 'do MMM', { locale })}, bod [STUDENT_NAME] wedi derbyn gwobr gwerthoedd yr ysgol am ddangos caredigrwydd a pharch eithriadol. Rydym yn falch iawn!\n\nDa iawn,\n[TEACHER_NAME]`
    : `Dear Parent/Guardian,\n\nWe are delighted to inform you that for the week of ${format(weekStart, 'do MMM', { locale })}, [STUDENT_NAME] has received a school values award for demonstrating exceptional kindness and respect. We are very proud!\n\nWell done,\n[TEACHER_NAME]`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        let userId = 'mock-teacher-id-1';
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) userId = session.user.id;
        }
        const res = await db.getTeacherAndClass(userId);
        if (!res) return;
        setTeacher(res.teacher);
        setStudents(res.myClass.map((c) => ({ id: c.id, name: c.name, parentId: c.linkedParents?.[0]?.parentId })));
      } catch (e) {
        // ignore
      }
    };
    fetchData();
  }, [isSupabaseConfigured]);

  const form = useForm<z.infer<ReturnType<typeof valuesAwardFormSchema>>>({
    resolver: zodResolver(valuesAwardFormSchema(t.formSchema)),
    defaultValues: {
      childIds: [],
      message: defaultMessageTemplate,
    },
  });

  useEffect(() => {
    form.setValue('message', defaultMessageTemplate.replace(/\[TEACHER_NAME\]|\[ENW_ATHRO\]/g, teacher?.name || 'Teacher'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher?.name, language]);

  const selectedCount = form.watch('childIds')?.length || 0;

  const onSubmit = async (values: z.infer<ReturnType<typeof valuesAwardFormSchema>>) => {
    setIsLoading(true);
    try {
      const selected = students.filter((s) => values.childIds.includes(s.id));
      const date = new Date().toISOString();

      for (const s of selected) {
        const personalised = values.message
          .replace(/\[STUDENT_NAME\]|\[ENW_MYFYRIWR\]/g, s.name)
          .replace(/\[TEACHER_NAME\]|\[ENW_ATHRO\]/g, teacher?.name || 'Teacher');

        await db.addParentNotification({
          childId: s.id,
          childName: s.name,
          parentId: s.parentId || 'parent-1',
          teacherId: teacher?.userId || 'mock-teacher-id-1',
          teacherName: teacher?.name || 'Teacher',
          date,
          type: 'Values Award',
          notes: personalised,
          isRead: false,
        });
      }

      toast({ title: 'Success', description: t.toast.success });
      navigate('/teacher/dashboard');
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: t.toast.error, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/teacher/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t.backLink}
      </Link>
      <div>
        <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
        <p className="text-muted-foreground">{t.description}</p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t.form.title}</CardTitle>
          <CardDescription>
            {t.form.description}
            <span className="block mt-1 text-sm">{t.weekOf} {format(weekStart, 'EEEE, do MMMM yyyy', { locale })}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="childIds"
                render={() => (
                  <FormItem>
                    <FormLabel>{t.form.studentsLabel}</FormLabel>
                    <ScrollArea className="h-64 rounded-md border p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {students.length === 0 ? (
                          <p className="text-sm text-muted-foreground">{t.noStudents}</p>
                        ) : (
                          students.map((student) => (
                            <FormField
                              key={student.id}
                              control={form.control}
                              name="childIds"
                              render={({ field }) => {
                                const checked = field.value?.includes(student.id);
                                return (
                                  <FormItem className="flex items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={(v) => {
                                          const val = v === true;
                                          if (val) field.onChange([...(field.value || []), student.id]);
                                          else field.onChange((field.value || []).filter((id: string) => id !== student.id));
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{student.name}</FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.form.messageLabel}</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder={t.form.messagePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading || selectedCount === 0}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Award className="mr-2 h-4 w-4" />
                {t.submitButton.replace('{count}', String(selectedCount))}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TeacherValuesAward() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ValuesAwardContent />
    </Suspense>
  );
}
