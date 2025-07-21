
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
import { addStaffMember, updateStaffMember } from '@/lib/firebase/firestore';
import { uploadFile, deleteFile } from '@/lib/firebase/storage';
import { StaffMemberWithId } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '../ui/progress';

export const staffTeams = [
    "Leadership Team",
    "Nursery & Reception",
    "Year 1",
    "Year 2",
    "Year 3",
    "Year 4",
    "Year 5",
    "Year 6",
    "Support Staff"
];

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  role: z.string().min(2, { message: 'Role must be at least 2 characters.' }),
  team: z.string({ required_error: 'Please select a team.' }),
  bio: z.string().optional(),
  photo: z.any().optional(),
});

type StaffFormValues = z.infer<typeof formSchema>;

interface StaffFormProps {
  onSuccess: () => void;
  existingStaff?: StaffMemberWithId | null;
}

export function StaffForm({ onSuccess, existingStaff }: StaffFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: existingStaff?.name || '',
      role: existingStaff?.role || '',
      team: existingStaff?.team || '',
      bio: existingStaff?.bio || '',
      photo: undefined,
    },
  });

  const onSubmit = async (values: StaffFormValues) => {
    setIsLoading(true);

    try {
      let photoUrl = existingStaff?.photoUrl || '';
      const fileToUpload = values.photo instanceof File ? values.photo : null;

      if (fileToUpload) {
        setUploadProgress(0);
        // If there's an old photo, delete it
        if (existingStaff?.photoUrl) {
          await deleteFile(existingStaff.photoUrl);
        }
        // Upload the new one
        photoUrl = await uploadFile(fileToUpload, 'staff-photos', (progress) => {
          setUploadProgress(progress);
        });
        setUploadProgress(100);
      }

      const staffData = {
        name: values.name,
        role: values.role,
        team: values.team,
        bio: values.bio,
        photoUrl: photoUrl,
      };

      if (existingStaff) {
        await updateStaffMember(existingStaff.id, staffData);
        toast({
          title: 'Success!',
          description: 'Staff member has been updated.',
        });
      } else {
        await addStaffMember(staffData);
        toast({
          title: 'Success!',
          description: 'New staff member has been added.',
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
      setUploadProgress(null);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role / Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Headteacher" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="team"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Team / Year Group</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {staffTeams.map((team) => (
                    <SelectItem key={team} value={team}>
                        {team}
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
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A short introduction..."
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
          name="photo"
          render={({ field: { onChange, ...rest } }) => (
            <FormItem>
              <FormLabel>Profile Photo (Optional)</FormLabel>
              <FormControl>
                 <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => onChange(e.target.files?.[0])}
                    {...rest}
                />
              </FormControl>
              <FormDescription>
                Upload a photo of the staff member.
              </FormDescription>
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

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingStaff ? 'Update Staff' : 'Add Staff'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
