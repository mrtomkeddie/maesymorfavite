
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addParent, updateParent, bulkUpdateChildren, updateChild } from '@/lib/firebase/firestore';
import { ParentWithId, ChildWithId, Child } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'A valid email is required.' }),
  phone: z.string().optional(),
  linkedChildrenIds: z.array(z.string()).default([]),
});

type ParentFormValues = z.infer<typeof formSchema>;

interface ParentFormProps {
  onSuccess: () => void;
  existingParent?: ParentWithId | null;
  allChildren: ChildWithId[];
}

export function ParentForm({ onSuccess, existingParent, allChildren }: ParentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ParentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      linkedChildrenIds: [],
    },
  });
  
  useEffect(() => {
    form.reset({
        name: existingParent?.name || '',
        email: existingParent?.email || '',
        phone: existingParent?.phone || '',
        linkedChildrenIds: existingParent
            ? allChildren.filter(c => c.parentIds?.includes(existingParent.id)).map(c => c.id)
            : [],
    })
  }, [existingParent, allChildren, form])

  const onSubmit = async (values: ParentFormValues) => {
    setIsLoading(true);

    try {
      const parentData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
      };

      let parentId: string;
      
      if (existingParent) {
        parentId = existingParent.id;
        await updateParent(parentId, parentData);
      } else {
        parentId = await addParent(parentData);
      }
      
      const originalLinkedChildren = allChildren.filter(c => c.parentIds?.includes(parentId));
      const newLinkedChildrenIds = new Set(values.linkedChildrenIds);

      // Unlink children who are no longer selected for this parent
      const childrenToUnlink = originalLinkedChildren.filter(c => !newLinkedChildrenIds.has(c.id));
      for (const child of childrenToUnlink) {
          const updatedParentIds = child.parentIds?.filter(id => id !== parentId);
          await updateChild(child.id, { parentIds: updatedParentIds });
      }

      // Link children who are newly selected for this parent
      const childrenToLink = allChildren.filter(c => newLinkedChildrenIds.has(c.id));
       for (const child of childrenToLink) {
           if (!child.parentIds?.includes(parentId)) {
               const updatedParentIds = [...(child.parentIds || []), parentId];
               await updateChild(child.id, { parentIds: updatedParentIds });
           }
       }


      toast({
        title: 'Success!',
        description: `Parent account has been ${existingParent ? 'updated' : 'created'}.`,
      });
      
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

  // A child is available to be linked if they are not already linked to this parent.
  // We don't restrict based on other parents, as a child can have multiple.
  const availableChildren = allChildren;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent's Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent's Email Address</FormLabel>
              <FormControl>
                <Input placeholder="e.g., jane.doe@email.com" type="email" {...field} />
              </FormControl>
               <FormDescription>
                    This will be their username for the Parent Portal.
                </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 07123456789" type="tel" {...field} />
              </FormControl>
               <FormDescription>
                    Used for SMS alerts in the future.
                </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator />

        <FormField
            control={form.control}
            name="linkedChildrenIds"
            render={() => (
                <FormItem>
                     <div className="mb-4">
                        <FormLabel className="text-base">Linked Children</FormLabel>
                        <FormDescription>
                           Select the children associated with this parent.
                        </FormDescription>
                    </div>
                    {availableChildren.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No children available. Add a new child first.</p>
                    ) : (
                        <ScrollArea className="h-40 w-full rounded-md border p-4">
                            <div className="space-y-2">
                            {availableChildren.map((child) => (
                                <FormField
                                    key={child.id}
                                    control={form.control}
                                    name="linkedChildrenIds"
                                    render={({ field }) => {
                                    return (
                                        <FormItem
                                        key={child.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                        <FormControl>
                                            <Checkbox
                                            checked={field.value?.includes(child.id)}
                                            onCheckedChange={(checked) => {
                                                return checked
                                                ? field.onChange([...(field.value || []), child.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                    (value) => value !== child.id
                                                    )
                                                )
                                            }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal text-sm">
                                            {child.name} ({child.yearGroup})
                                        </FormLabel>
                                        </FormItem>
                                    )
                                    }}
                                />
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                     <FormMessage />
                </FormItem>
            )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingParent ? 'Update Parent' : 'Add Parent'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
