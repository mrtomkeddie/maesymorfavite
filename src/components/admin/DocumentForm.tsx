
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDocument, updateDocument } from '@/lib/firebase/firestore';
import { uploadFile, deleteFile } from '@/lib/firebase/storage';
import { DocumentWithId } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const documentCategories = [
    "Policy",
    "Term Dates",
    "Lunch Menu",
    "Newsletter",
    "Permission Slip",
    "Other"
];

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  category: z.string({ required_error: 'Please select a category.' }),
  file: z.any().refine(file => file instanceof File || typeof file === 'string', {
    message: 'A file upload is required.',
  }),
});

type DocumentFormValues = z.infer<typeof formSchema>;

interface DocumentFormProps {
  onSuccess: () => void;
  existingDocument?: DocumentWithId | null;
}

export function DocumentForm({ onSuccess, existingDocument }: DocumentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: existingDocument?.title || '',
      category: existingDocument?.category || '',
      file: existingDocument?.fileUrl || undefined,
    },
  });

  const onSubmit = async (values: DocumentFormValues) => {
    setIsLoading(true);

    try {
      let fileUrl = existingDocument?.fileUrl || '';

      if (values.file && values.file instanceof File) {
        if (existingDocument?.fileUrl) {
          await deleteFile(existingDocument.fileUrl);
        }
        fileUrl = await uploadFile(values.file, 'documents');
      }

      if (!fileUrl) {
          toast({
            title: 'File Error',
            description: 'A file is required. Please upload a PDF.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
      }

      const documentData = {
        title: values.title,
        category: values.category,
        fileUrl: fileUrl,
        uploadedAt: existingDocument?.uploadedAt || new Date().toISOString(),
      };

      if (existingDocument) {
        await updateDocument(existingDocument.id, documentData);
        toast({
          title: 'Success!',
          description: 'Document has been updated.',
        });
      } else {
        await addDocument(documentData);
        toast({
          title: 'Success!',
          description: 'New document has been uploaded.',
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Autumn Term Lunch Menu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {documentCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                        {cat}
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
          name="file"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>{existingDocument ? 'Replace File' : 'File Upload'}</FormLabel>
              <FormControl>
                 <Input 
                    type="file" 
                    accept="application/pdf"
                    onChange={(e) => onChange(e.target.files?.[0])}
                />
              </FormControl>
              <FormDescription>
                Please upload PDF files only. Max size 5MB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingDocument ? 'Update Document' : 'Upload Document'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

    