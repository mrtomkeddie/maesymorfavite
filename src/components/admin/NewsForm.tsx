


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
import { Loader2, Upload, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import type { NewsPostWithId } from '@/lib/types';
import { uploadFile } from '@/lib/storage';
import { Progress } from '../ui/progress';
import { useLanguage } from '@/contexts/LanguageProvider';

const formSchema = (t: any) => z.object({
  title_en: z.string().min(5, { message: t.title_message }),
  body_en: z.string().min(10, { message: t.body_message }),
  isUrgent: z.boolean().default(false),
  attachment: z.any().optional(),
});

const content = {
    en: {
        formSchema: {
            title_message: 'Title must be at least 5 characters.',
            body_message: 'Body must be at least 10 characters.',
        },
        titleLabel: 'Title',
        titlePlaceholder: 'e.g., School Sports Day',
        bodyLabel: 'Body',
        bodyPlaceholder: 'Full text of the announcement...',
        urgentLabel: 'Urgent Alert',
        urgentDesc: 'Mark this as an urgent announcement. The title will appear as a banner on the homepage. Only one news post can be urgent at a time.',
        attachmentLabel: 'Attachment (Optional)',
        attachmentDesc: 'Upload a PDF or image if needed.',
        uploadComplete: 'Upload complete!',
        toastSuccessUpdate: {
            title: 'Success!',
            description: 'News post has been updated.',
        },
        toastSuccessAdd: {
            title: 'Success!',
            description: 'New news post has been created.',
        },
        toastError: {
            title: 'Error',
            description: 'Something went wrong. Please try again.',
        },
        submitButtonUpdate: 'Update Post',
        submitButtonCreate: 'Create Post',
    },
    cy: {
        formSchema: {
            title_message: 'Rhaid i\'r teitl fod o leiaf 5 nod.',
            body_message: 'Rhaid i\'r corff fod o leiaf 10 nod.',
        },
        titleLabel: 'Teitl',
        titlePlaceholder: 'e.e., Diwrnod Chwaraeon Ysgol',
        bodyLabel: 'Corff',
        bodyPlaceholder: 'Testun llawn y cyhoeddiad...',
        urgentLabel: 'Hysbysiad Brys',
        urgentDesc: 'Nodwch hwn fel cyhoeddiad brys. Bydd y teitl yn ymddangos fel baner ar y dudalen gartref. Dim ond un post newyddion all fod yn frys ar y tro.',
        attachmentLabel: 'Atodiad (Dewisol)',
        attachmentDesc: 'Uwchlwythwch PDF neu ddelwedd os oes angen.',
        uploadComplete: 'Wedi\'i uwchlwytho\'n llwyddiannus!',
        toastSuccessUpdate: {
            title: 'Llwyddiant!',
            description: 'Mae\'r cofnod newyddion wedi\'i ddiweddaru.',
        },
        toastSuccessAdd: {
            title: 'Llwyddiant!',
            description: 'Mae cofnod newyddion newydd wedi\'i greu.',
        },
        toastError: {
            title: 'Gwall',
            description: 'Aeth rhywbeth o\'i le. Rhowch gynnig arall arni.',
        },
        submitButtonUpdate: 'Diweddaru\'r Cofnod',
        submitButtonCreate: 'Creu Cofnod',
    }
}


interface NewsFormProps {
  onSuccess: () => void;
  existingNews?: NewsPostWithId | null;
}

export function NewsForm({ onSuccess, existingNews }: NewsFormProps) {
  const { language } = useLanguage();
  const t = content[language];
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(t.formSchema)),
    defaultValues: {
      title_en: existingNews?.title_en || '',
      body_en: existingNews?.body_en || '',
      isUrgent: existingNews?.isUrgent || false,
      attachment: undefined,
    },
  });

  const onSubmit = async (values: z.infer<ReturnType<typeof formSchema>>) => {
    setIsLoading(true);

    try {
      let attachmentUrl = existingNews?.attachmentUrl || '';
      const fileToUpload = values.attachment instanceof File ? values.attachment : null;
      
      if (fileToUpload) {
        setUploadProgress(0);
        attachmentUrl = await uploadFile(fileToUpload, 'news-attachments', (progress) => {
            setUploadProgress(progress);
        });
        setUploadProgress(100);
      }

      const newsData = {
        title_en: values.title_en,
        title_cy: values.title_en, // For now, Welsh title is same as English
        body_en: values.body_en,
        body_cy: values.body_en, // For now, Welsh body is same as English
        isUrgent: values.isUrgent,
        attachmentUrl: attachmentUrl,
        attachmentName: fileToUpload ? fileToUpload.name : existingNews?.attachmentName || '',
        date: existingNews?.date || new Date().toISOString(),
        slug: existingNews?.slug || values.title_en.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        published: true,
        category: values.isUrgent ? 'Urgent' as const : 'General' as const,
        createdBy: 'admin@example.com',
        lastEdited: new Date().toISOString(),
      };

      if (existingNews) {
        await db.updateNews(existingNews.id, newsData);
        toast(t.toastSuccessUpdate);
      } else {
        await db.addNews(newsData);
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
          name="body_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.bodyLabel}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t.bodyPlaceholder}
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 pr-6">
                <FormLabel>{t.urgentLabel}</FormLabel>
                <FormDescription>
                    {t.urgentDesc}
                </FormDescription>
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
            {existingNews ? t.submitButtonUpdate : t.submitButtonCreate}
          </Button>
        </div>
      </form>
    </Form>
  );
}
