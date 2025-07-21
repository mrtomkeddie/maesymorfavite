
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { bulkUpdateChildren, ParentWithId } from '@/lib/firebase/firestore';
import { ChildWithId } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { yearGroups } from './ChildForm';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  yearGroup: z.string().optional(),
  parentId: z.string().optional(),
});

type BulkEditFormValues = z.infer<typeof formSchema>;

interface BulkEditChildFormProps {
  onSuccess: () => void;
  selectedIds: string[];
  parents: ParentWithId[];
}

export function BulkEditChildForm({ onSuccess, selectedIds, parents }: BulkEditChildFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BulkEditFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yearGroup: '',
      parentId: '',
    },
  });

  const onSubmit = async (values: BulkEditFormValues) => {
    setIsLoading(true);

    try {
      const updateData: Partial<ChildWithId> = {};
      if (values.yearGroup) {
          updateData.yearGroup = values.yearGroup;
      }
      if (values.parentId) {
          // Handle the special '__none__' value to unlink a parent
          updateData.parentId = values.parentId === '__none__' ? '' : values.parentId;
      }
      
      if (Object.keys(updateData).length === 0) {
        toast({
          title: 'No changes',
          description: 'Please select a value for at least one field to update.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      await bulkUpdateChildren(selectedIds, updateData);

      toast({
        title: 'Success!',
        description: `${selectedIds.length} children have been updated.`,
      });
      
      form.reset();
      onSuccess();

    } catch (error) {
      console.error('Error submitting bulk edit form:', error);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
         <FormField
            control={form.control}
            name="yearGroup"
            render={({ field }) => (
            <FormItem>
                <FormLabel>New Year Group</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Leave unchanged" />
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
        
        <Separator />

        <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
            <FormItem>
                <FormLabel>New Linked Parent</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Leave unchanged" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="__none__">Unlink Parent</SelectItem>
                    {parents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                        {parent.name} ({parent.email})
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apply Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}

    