
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
import { Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addPhoto } from '@/lib/firebase/firestore';
import { uploadFile } from '@/lib/firebase/storage';
import { Progress } from '../ui/progress';
import { yearGroups as allYearGroups } from './ChildForm';
import { Checkbox } from '../ui/checkbox';

const yearGroupOptions = ['All', ...allYearGroups];

const formSchema = z.object({
  caption: z.string().min(3, { message: 'Caption must be at least 3 characters.' }),
  image: z.any().refine((file) => file instanceof File, {
    message: 'An image file is required.',
  }),
  yearGroups: z.array(z.string()).refine((value) => value.some(item => item), {
      message: "You have to select at least one year group.",
  }),
});

type PhotoFormValues = z.infer<typeof formSchema>;

interface PhotoFormProps {
  onSuccess: () => void;
}

export function PhotoForm({ onSuccess }: PhotoFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const form = useForm<PhotoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caption: '',
      yearGroups: [],
    },
  });

  const onSubmit = async (values: PhotoFormValues) => {
    setIsLoading(true);

    try {
      const fileToUpload = values.image;

      setUploadProgress(0);
      const imageUrl = await uploadFile(fileToUpload, 'gallery-photos', (progress) => {
        setUploadProgress(progress);
      });
      setUploadProgress(100);

      const photoData = {
        caption: values.caption,
        imageUrl,
        yearGroups: values.yearGroups.includes('All') ? ['All'] : values.yearGroups,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin@example.com' // Replace with actual admin user later
      };

      await addPhoto(photoData);

      toast({
        title: 'Success!',
        description: 'Photo has been uploaded successfully.',
      });
      
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
          name="image"
          render={({ field: { onChange, ...rest } }) => (
            <FormItem>
              <FormLabel>Image File</FormLabel>
              <FormControl>
                <Input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => onChange(e.target.files?.[0])}
                    {...rest}
                />
              </FormControl>
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
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Caption</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Year 2's trip to the museum" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="yearGroups"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Tag Year Groups</FormLabel>
                <FormDescription>
                  Select which year groups this photo should be visible to.
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {yearGroupOptions.map((item) => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="yearGroups"
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
                                  newValues.push(item);
                                  const allIndex = newValues.indexOf('All');
                                  if (allIndex > -1) {
                                    newValues.splice(allIndex, 1);
                                  }
                                  return field.onChange(newValues);
                                } else {
                                  return field.onChange(
                                    newValues?.filter(
                                      (value) => value !== item
                                    )
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{item}</FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload Photo
          </Button>
        </div>
      </form>
    </Form>
  );
}
