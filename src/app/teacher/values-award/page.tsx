

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Award, Check, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ChildWithId, StaffMemberWithId } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, startOfWeek, endOfWeek } from 'date-fns';

const valuesAwardFormSchema = z.object({
  childIds: z.array(z.string()).refine((value) => value.length > 0, {
    message: "Please select at least one student.",
  }),
  message: z.string().min(10, {
    message: "The message must be at least 10 characters.",
  }),
});


export default function ValuesAwardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [teacher, setTeacher] = useState<StaffMemberWithId | null>(null);
  const [myClass, setMyClass] = useState<ChildWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekString = `w/c ${format(weekStart, 'do MMMM yyyy')}`;

  const defaultMessageTemplate = `Dear Parent/Guardian,\n\nWe are delighted to inform you that for the week of ${format(weekStart, 'do MMM')}, [STUDENT_NAME] has received a school values award for demonstrating exceptional kindness and respect. We are very proud!\n\nWell done,\n[TEACHER_NAME]`;


  useEffect(() => {
    const fetchTeacherData = async () => {
        setIsPageLoading(true);
        try {
            let userId = 'mock-teacher-id-1'; // Default for non-supabase env
            if (isSupabaseConfigured) {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) { throw new Error("Not authenticated"); }
                userId = session.user.id;
            }
            const teacherData = await db.getTeacherAndClass(userId);
            if (teacherData) {
                setTeacher(teacherData.teacher);
                setMyClass(teacherData.myClass);
                form.setValue('message', defaultMessageTemplate.replace('[TEACHER_NAME]', teacherData.teacher.name));
            }
        } catch (error) {
            console.error("Error fetching teacher data:", error);
            toast({
                title: "Error",
                description: "Could not load your class data. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsPageLoading(false);
        }
    };
    fetchTeacherData();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, isSupabaseConfigured]);

  const form = useForm<z.infer<typeof valuesAwardFormSchema>>({
    resolver: zodResolver(valuesAwardFormSchema),
    defaultValues: {
      childIds: [],
      message: defaultMessageTemplate,
    },
  });

  async function onSubmit(values: z.infer<typeof valuesAwardFormSchema>) {
    setIsLoading(true);

    try {
        const { childIds, message } = values;
        for (const childId of childIds) {
            const child = myClass.find(c => c.id === childId);
            if (!child) continue;

            const personalizedMessage = message.replace(/\[STUDENT_NAME\]/g, child.name);
            
            await db.addParentNotification({
                childId: child.id,
                childName: child.name,
                parentId: 'parent-1', // Simplified: In reality, look up parent from child.linkedParents
                teacherId: teacher?.id || 'teacher-1',
                teacherName: teacher?.name || 'Teacher',
                date: new Date().toISOString(),
                type: 'Values Award',
                notes: personalizedMessage,
                isRead: false,
            });
        }
        
        toast({
            title: "Notifications Sent!",
            description: `A values award notification has been sent to the parents of ${childIds.length} student(s).`,
        });
        
        router.push('/teacher/dashboard');

    } catch (error) {
        console.error("Failed to send notifications:", error);
        toast({
            title: "Submission Failed",
            description: "Could not send the notifications. Please try again.",
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  }

  if (isPageLoading) {
      return <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <Link href="/teacher/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
      </Link>
      <div>
        <h1 className="text-3xl font-bold font-headline">Send Values Award</h1>
        <p className="text-muted-foreground">
           Select multiple students from your class to send a pre-written award notification.
        </p>
      </div>

      <Card className="max-w-4xl">
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle>1. Select Students</CardTitle>
                     <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Award for week commencing: <span className="font-semibold">{format(weekStart, 'EEEE, do MMMM yyyy')}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="childIds"
                        render={() => (
                            <FormItem>
                                <ScrollArea className="h-64 rounded-md border">
                                    <div className="p-4">
                                        {myClass.map((item) => (
                                        <FormField
                                            key={item.id}
                                            control={form.control}
                                            name="childIds"
                                            render={({ field }) => {
                                            return (
                                                <FormItem
                                                    key={item.id}
                                                    className="flex flex-row items-center space-x-3 space-y-0 py-2"
                                                >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(item.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                            ? field.onChange([...(field.value || []), item.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                    (value) => value !== item.id
                                                                )
                                                            )
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal w-full cursor-pointer">
                                                    {item.name}
                                                </FormLabel>
                                                </FormItem>
                                            )
                                            }}
                                        />
                                        ))}
                                    </div>
                                </ScrollArea>
                                <FormMessage className="mt-2"/>
                            </FormItem>
                        )}
                    />
                </CardContent>

                <CardHeader>
                    <CardTitle>2. Notification Message</CardTitle>
                    <CardDescription>
                        This pre-written message will be sent. The `[STUDENT_NAME]` and `[TEACHER_NAME]` tags will be automatically replaced.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                            <Textarea
                                {...field}
                                rows={6}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>

                <div className="p-6 flex justify-end">
                    <Button type="submit" disabled={isLoading || form.getValues('childIds').length === 0}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Award className="mr-2 h-4 w-4" />
                        Send Award to {form.watch('childIds').length} Student(s)
                    </Button>
                </div>
            </form>
         </Form>
      </Card>
    </div>
  );
}


    