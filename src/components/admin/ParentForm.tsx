

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { ParentWithId, ChildWithId, Child, LinkedParent } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

const linkedChildSchema = z.object({
  childId: z.string(),
  relationship: z.string().min(2, { message: "Relationship is required." })
});

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'A valid email is required.' }),
  phone: z.string().optional(),
  linkedChildren: z.array(linkedChildSchema).default([]),
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
  const [childSearch, setChildSearch] = useState('');


  const form = useForm<ParentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      linkedChildren: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
      control: form.control,
      name: "linkedChildren"
  });
  
  useEffect(() => {
    if (existingParent) {
        const currentlyLinkedChildren = allChildren
            .filter(c => c.linkedParents?.some(lp => lp.parentId === existingParent.id))
            .map(c => {
                const relationship = c.linkedParents?.find(lp => lp.parentId === existingParent.id)?.relationship || '';
                return { childId: c.id, relationship };
            });

        form.reset({
            name: existingParent?.name || '',
            email: existingParent?.email || '',
            phone: existingParent?.phone || '',
            linkedChildren: currentlyLinkedChildren,
        });
    } else {
        form.reset({
            name: '',
            email: '',
            phone: '',
            linkedChildren: [],
        });
    }
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
      
      const newLinks = new Map(values.linkedChildren.map(lc => [lc.childId, lc.relationship]));
      const originalLinks = new Map(
        allChildren
          .filter(c => c.linkedParents?.some(lp => lp.parentId === parentId))
          .map(c => [c.id, c.linkedParents?.find(lp => lp.parentId === parentId)?.relationship || ''])
      );
     
      // Process all children to update links
      for (const child of allChildren) {
          const wasLinked = originalLinks.has(child.id);
          const isLinked = newLinks.has(child.id);
          const currentLinkedParents = child.linkedParents || [];

          if (wasLinked && !isLinked) {
              // Unlink
              const updatedLinks = currentLinkedParents.filter(lp => lp.parentId !== parentId);
              await updateChild(child.id, { linkedParents: updatedLinks });
          } else if (!wasLinked && isLinked) {
              // Link
              const updatedLinks = [...currentLinkedParents, { parentId, relationship: newLinks.get(child.id)! }];
              await updateChild(child.id, { linkedParents: updatedLinks });
          } else if (wasLinked && isLinked) {
              // Relationship might have changed
              const newRelationship = newLinks.get(child.id)!;
              const originalRelationship = originalLinks.get(child.id)!;
              if (newRelationship !== originalRelationship) {
                  const updatedLinks = currentLinkedParents.map(lp => 
                    lp.parentId === parentId ? { ...lp, relationship: newRelationship } : lp
                  );
                  await updateChild(child.id, { linkedParents: updatedLinks });
              }
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

  const filteredChildren = allChildren.filter(child => 
    child.name.toLowerCase().includes(childSearch.toLowerCase())
  );


  return (
    <ScrollArea className="max-h-[80vh] pr-6">
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
        
        <div className="space-y-2">
            <FormLabel>Linked Children</FormLabel>
            <FormDescription>Select children and specify the relationship.</FormDescription>
            
            <Input 
                placeholder="Search for a child to link..."
                value={childSearch}
                onChange={(e) => setChildSearch(e.target.value)}
                className="mb-2"
            />
            <ScrollArea className="h-40 w-full rounded-md border">
                <div className="p-4">
                 {filteredChildren.map((child, index) => {
                     const linkedIndex = fields.findIndex(f => f.childId === child.id);
                     const isLinked = linkedIndex !== -1;
                     return (
                         <div key={child.id} className="flex flex-row items-center gap-4 mb-2">
                             <Checkbox
                                id={`child-${child.id}`}
                                checked={isLinked}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        append({ childId: child.id, relationship: '' });
                                    } else {
                                        remove(linkedIndex);
                                    }
                                }}
                             />
                             <label htmlFor={`child-${child.id}`} className="text-sm font-normal flex-grow">{child.name} ({child.yearGroup})</label>
                             {isLinked && (
                                <FormField
                                    control={form.control}
                                    name={`linkedChildren.${linkedIndex}.relationship`}
                                    render={({ field }) => (
                                        <FormControl>
                                            <Input {...field} placeholder="Relationship" className="h-8"/>
                                        </FormControl>
                                    )}
                                />
                             )}
                         </div>
                     )
                 })}
                </div>
            </ScrollArea>
        </div>


        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingParent ? 'Update Parent' : 'Add Parent'}
          </Button>
        </div>
      </form>
    </Form>
    </ScrollArea>
  );
}
