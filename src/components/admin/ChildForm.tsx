
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
import { addChild, updateChild, ParentWithId } from '@/lib/firebase/firestore';
import { ChildWithId } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const yearGroups = [
    "Nursery",
    "Reception",
    "Year 1",
    "Year 2",
    "Year 3",
    "Year 4",
    "Year 5",
    "Year 6",
];

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  yearGroup: z.string({ required_error: 'Please select a year group.' }),
  parentId: z.string().optional(),
});

type ChildFormValues = z.infer<typeof formSchema>;

interface ChildFormProps {
  onSuccess: () => void;
  existingChild?: ChildWithId | null;
  parents: ParentWithId[];
}

export function ChildForm({ onSuccess, existingChild, parents }: ChildFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChildFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: existingChild?.name || '',
      yearGroup: existingChild?.yearGroup || '',
      parentId: existingChild?.parentId || '',
    },
  });

  const onSubmit = async (values: ChildFormValues) => {
    setIsLoading(true);

    try {
      const childData = {
        name: values.name,
        yearGroup: values.yearGroup,
        parentId: values.parentId || '',
      };

      if (existingChild) {
        await updateChild(existingChild.id, childData);
        toast({
          title: 'Success!',
          description: 'Child record has been updated.',
        });
      } else {
        await addChild(childData);
        toast({
          title: 'Success!',
          description: 'New child record has been added.',
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Child's Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Tom Jones" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="yearGroup"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Year Group</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Select a year group" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {yearGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                        {group}
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
            name="parentId"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Link to Parent (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Select a parent" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {parents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                        {parent.name} ({parent.email})
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                 <FormDescription>
                    Linking a child to a parent allows the parent to report absences.
                </FormDescription>
                <FormMessage />
            </FormItem>
            )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingChild ? 'Update Child' : 'Add Child'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
