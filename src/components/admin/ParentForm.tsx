
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
import { addParent, updateParent, updateChild } from '@/lib/firebase/firestore';
import { ParentWithId, ChildWithId } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'A valid email is required.' }),
  linkedChildren: z.array(z.string()).default([]),
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
      name: existingParent?.name || '',
      email: existingParent?.email || '',
      linkedChildren: existingParent
        ? allChildren.filter(c => c.parentId === existingParent.id).map(c => c.id)
        : [],
    },
  });
  
  // Re-initialize form if the parent or children list changes
  useEffect(() => {
    form.reset({
        name: existingParent?.name || '',
        email: existingParent?.email || '',
        linkedChildren: existingParent
            ? allChildren.filter(c => c.parentId === existingParent.id).map(c => c.id)
            : [],
    })
  }, [existingParent, allChildren, form])

  const onSubmit = async (values: ParentFormValues) => {
    setIsLoading(true);

    try {
      const parentData = {
        name: values.name,
        email: values.email,
      };

      let parentId: string;

      if (existingParent) {
        parentId = existingParent.id;
        await updateParent(parentId, parentData);
      } else {
        parentId = await addParent(parentData);
      }
      
      // Handle child linking/unlinking
      const previouslyLinked = allChildren.filter(c => c.parentId === parentId);
      const currentlyLinkedIds = new Set(values.linkedChildren);

      // Unlink children who are no longer selected
      for (const child of previouslyLinked) {
          if (!currentlyLinkedIds.has(child.id)) {
              await updateChild(child.id, { parentId: '' });
          }
      }

      // Link new children
      for (const childId of currentlyLinkedIds) {
          const child = allChildren.find(c => c.id === childId);
          if (child && child.parentId !== parentId) {
             // Unlink from old parent if any
             if(child.parentId) {
                // In a multi-parent scenario, this logic would need to be more complex
             }
             await updateChild(child.id, { parentId: parentId });
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

  const availableChildren = allChildren.filter(child => !child.parentId || child.parentId === existingParent?.id);

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
        
        <Separator />

        <FormField
            control={form.control}
            name="linkedChildren"
            render={() => (
                <FormItem>
                     <div className="mb-4">
                        <FormLabel className="text-base">Linked Children</FormLabel>
                        <FormDescription>
                           Select the children associated with this parent.
                        </FormDescription>
                    </div>
                    {availableChildren.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No unlinked children available. Add a new child first.</p>
                    ) : (
                        <div className="space-y-2">
                         {availableChildren.map((child) => (
                            <FormField
                                key={child.id}
                                control={form.control}
                                name="linkedChildren"
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
                                    <FormLabel className="font-normal">
                                        {child.name} ({child.yearGroup})
                                    </FormLabel>
                                    </FormItem>
                                )
                                }}
                            />
                            ))}
                        </div>
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
