
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
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

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
  parentIds: z.array(z.string()).default([]),
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
      parentIds: existingChild?.parentIds || [],
    },
  });

  const onSubmit = async (values: ChildFormValues) => {
    setIsLoading(true);

    try {
      const childData = {
        name: values.name,
        yearGroup: values.yearGroup,
        parentIds: values.parentIds || [],
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
            name="parentIds"
            render={() => (
                <FormItem>
                    <div className="mb-2">
                        <FormLabel>Link to Parent(s)</FormLabel>
                        <FormDescription>
                            Select one or more parents to link to this child.
                        </FormDescription>
                    </div>
                    <ScrollArea className="h-40 w-full rounded-md border p-4">
                        <div className="space-y-2">
                        {parents.map((parent) => (
                            <FormField
                            key={parent.id}
                            control={form.control}
                            name="parentIds"
                            render={({ field }) => (
                                <FormItem
                                    key={parent.id}
                                    className="flex flex-row items-center space-x-3 space-y-0"
                                >
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(parent.id)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), parent.id])
                                            : field.onChange(field.value?.filter(
                                                (value) => value !== parent.id
                                            ));
                                        }}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal text-sm">
                                    {parent.name} ({parent.email})
                                    </FormLabel>
                                </FormItem>
                            )}
                            />
                        ))}
                        </div>
                    </ScrollArea>
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
