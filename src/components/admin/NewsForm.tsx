
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
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addNews, updateNews, NewsPostWithId } from '@/lib/firebase/firestore';
import { uploadFile } from '@/lib/firebase/storage';

const formSchema = z.object({
  title_en: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  body_en: z.string().min(10, { message: 'Body must be at least 10 characters.' }),
  isUrgent: z.boolean().default(false),
  attachment: z.instanceof(File).optional(),
});

type NewsFormValues = z.infer<typeof formSchema>;

interface NewsFormProps {
  onSuccess: () => void;
  existingNews?: NewsPostWithId | null;
}

export function NewsForm({ onSuccess, existingNews }: NewsFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title_en: existingNews?.title_en || '',
      body_en: existingNews?.body_en || '',
      isUrgent: existingNews?.isUrgent || false,
      attachment: undefined,
    },
  });

  const onSubmit = async (values: NewsFormValues) => {
    setIsLoading(true);

    try {
      let attachmentUrl = existingNews?.attachmentUrl || '';

      if (values.attachment) {
        // A new file is uploaded, upload it to storage
        attachmentUrl = await uploadFile(values.attachment, 'news-attachments');
      }

      const newsData = {
        title_en: values.title_en,
        title_cy: values.title_en, // For now, Welsh title is same as English
        body_en: values.body_en,
        body_cy: values.body_en, // For now, Welsh body is same as English
        isUrgent: values.isUrgent,
        attachmentUrl: attachmentUrl,
        attachmentName: values.attachment ? values.attachment.name : existingNews?.attachmentName || '',
        date: existingNews?.date || new Date().toISOString(),
        slug: existingNews?.slug || values.title_en.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        published: true,
        category: values.isUrgent ? 'Urgent' as const : 'General' as const,
        createdBy: 'admin@example.com',
        lastEdited: new Date().toISOString(),
      };

      if (existingNews) {
        await updateNews(existingNews.id, newsData);
        toast({
          title: 'Success!',
          description: 'News post has been updated.',
        });
      } else {
        await addNews(newsData);
        toast({
          title: 'Success!',
          description: 'New news post has been created.',
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
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., School Sports Day" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Full text of the announcement..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
                <FormLabel>Urgent Alert</FormLabel>
                <FormDescription>
                    Mark this as an urgent announcement (e.g., school closure).
                </FormDescription>
            </div>
            <FormField
            control={form.control}
            name="isUrgent"
            render={({ field }) => (
                <FormItem>
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
        
         <FormField
          control={form.control}
          name="attachment"
          render={({ field: { onChange, value, ...rest } }) => (
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
                Upload a PDF or image if needed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingNews ? 'Update Post' : 'Create Post'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
