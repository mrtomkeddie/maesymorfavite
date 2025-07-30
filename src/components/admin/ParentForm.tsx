

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
import { db } from '@/lib/db';
import type { ParentWithId, ChildWithId, LinkedParent } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { useLanguage } from '@/app/(public)/LanguageProvider';

const linkedChildSchema = (t: any) => z.object({
  childId: z.string(),
  relationship: z.string().min(2, { message: t.relationship_message })
});

const formSchema = (t: any) => z.object({
  name: z.string().min(2, { message: t.name_message }),
  email: z.string().email({ message: t.email_message }),
  phone: z.string().optional(),
  linkedChildren: z.array(linkedChildSchema(t)).default([]),
});

const content = {
    en: {
        formSchema: {
            relationship_message: "Relationship is required.",
            name_message: 'Name must be at least 2 characters.',
            email_message: 'A valid email is required.',
        },
        parentName: "Parent's Full Name",
        parentNamePlaceholder: "e.g., Jane Doe",
        parentEmail: "Parent's Email Address",
        parentEmailPlaceholder: "e.g., jane.doe@email.com",
        parentEmailDesc: "This will be their username for the Parent Portal.",
        parentPhone: "Mobile Number (Optional)",
        parentPhonePlaceholder: "e.g., 07123456789",
        parentPhoneDesc: "Used for SMS alerts in the future.",
        linkedChildren: "Linked Children",
        linkedChildrenDesc: "Select children and specify the relationship.",
        childSearchPlaceholder: "Search for a child to link...",
        relationshipPlaceholder: "Relationship",
        toastSuccess: {
            update: { title: "Success!", description: "Parent account has been updated." },
            add: { title: "Success!", description: "Parent account has been created." }
        },
        toastError: {
            title: "Error",
            description: "Something went wrong. Please try again."
        },
        submitUpdate: "Update Parent",
        submitAdd: "Add Parent"
    },
    cy: {
        formSchema: {
            relationship_message: "Mae angen perthynas.",
            name_message: 'Rhaid i\'r enw fod o leiaf 2 nod.',
            email_message: 'Mae angen cyfeiriad e-bost dilys.',
        },
        parentName: "Enw Llawn y Rhiant",
        parentNamePlaceholder: "e.e., Siân Jones",
        parentEmail: "Cyfeiriad E-bost y Rhiant",
        parentEmailPlaceholder: "e.e., sian.jones@email.com",
        parentEmailDesc: "Hwn fydd eu henw defnyddiwr ar gyfer Porth y Rieni.",
        parentPhone: "Rhif Ffôn Symudol (Dewisol)",
        parentPhonePlaceholder: "e.e., 07123456789",
        parentPhoneDesc: "Defnyddir ar gyfer rhybuddion SMS yn y dyfodol.",
        linkedChildren: "Plant Cysylltiedig",
        linkedChildrenDesc: "Dewiswch blant a nodwch y berthynas.",
        childSearchPlaceholder: "Chwilio am blentyn i'w gysylltu...",
        relationshipPlaceholder: "Perthynas",
        toastSuccess: {
            update: { title: "Llwyddiant!", description: "Mae cyfrif y rhiant wedi'i ddiweddaru." },
            add: { title: "Llwyddiant!", description: "Mae cyfrif rhiant newydd wedi'i greu." }
        },
        toastError: {
            title: "Gwall",
            description: "Aeth rhywbeth o'i le. Ceisiwch eto."
        },
        submitUpdate: "Diweddaru Rhiant",
        submitAdd: "Ychwanegu Rhiant"
    }
}


interface ParentFormProps {
  onSuccess: () => void;
  existingParent?: ParentWithId | null;
  allChildren: ChildWithId[];
}

export function ParentForm({ onSuccess, existingParent, allChildren }: ParentFormProps) {
  const { language } = useLanguage();
  const t = content[language];
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [childSearch, setChildSearch] = useState('');


  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(t.formSchema)),
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

  const onSubmit = async (values: z.infer<ReturnType<typeof formSchema>>) => {
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
        await db.updateParent(parentId, parentData);
      } else {
        parentId = await db.addParent(parentData);
      }
      
      const newLinks = new Map(values.linkedChildren.map(lc => [lc.childId, lc.relationship]));
      const originalLinks = new Map(
        allChildren
          .filter(c => c.linkedParents?.some(lp => lp.parentId === parentId))
          .map(c => [c.id, c.linkedParents?.find(lp => lp.parentId === parentId)?.relationship || ''])
      );
     
      for (const child of allChildren) {
          const wasLinked = originalLinks.has(child.id);
          const shouldBeLinked = newLinks.has(child.id);

          // Case 1: Child was linked, but now shouldn't be.
          if (wasLinked && !shouldBeLinked) {
              const updatedLinks = child.linkedParents?.filter(lp => lp.parentId !== parentId);
              await db.updateChild(child.id, { linkedParents: updatedLinks });
          }
          // Case 2: Child was not linked, but now should be.
          else if (!wasLinked && shouldBeLinked) {
              const newLink: LinkedParent = { parentId, relationship: newLinks.get(child.id)! };
              const updatedLinks = [...(child.linkedParents || []), newLink];
              await db.updateChild(child.id, { linkedParents: updatedLinks });
          }
          // Case 3: Child was and still is linked, check if relationship changed.
          else if (wasLinked && shouldBeLinked) {
              const newRelationship = newLinks.get(child.id);
              const oldRelationship = originalLinks.get(child.id);
              if (newRelationship !== oldRelationship) {
                  const updatedLinks = child.linkedParents?.map(lp => 
                    lp.parentId === parentId ? { ...lp, relationship: newRelationship! } : lp
                  );
                  await db.updateChild(child.id, { linkedParents: updatedLinks });
              }
          }
      }


      toast(existingParent ? t.toastSuccess.update : t.toastSuccess.add);
      
      onSuccess();

    } catch (error) {
      console.error('Error submitting form:', error);
      toast(t.toastError);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChildren = allChildren.filter(child => 
    child.name.toLowerCase().includes(childSearch.toLowerCase())
  );


  return (
    <ScrollArea className="max-h-[80vh] px-6">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2 pb-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.parentName}</FormLabel>
              <FormControl>
                <Input placeholder={t.parentNamePlaceholder} {...field} />
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
              <FormLabel>{t.parentEmail}</FormLabel>
              <FormControl>
                <Input placeholder={t.parentEmailPlaceholder} type="email" {...field} />
              </FormControl>
               <FormDescription>
                    {t.parentEmailDesc}
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
              <FormLabel>{t.parentPhone}</FormLabel>
              <FormControl>
                <Input placeholder={t.parentPhonePlaceholder} type="tel" {...field} />
              </FormControl>
               <FormDescription>
                    {t.parentPhoneDesc}
                </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator />
        
        <div className="space-y-2">
            <FormLabel>{t.linkedChildren}</FormLabel>
            <FormDescription>{t.linkedChildrenDesc}</FormDescription>
            
            <Input 
                placeholder={t.childSearchPlaceholder}
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
                                            <Input {...field} placeholder={t.relationshipPlaceholder} className="h-8"/>
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
            {existingParent ? t.submitUpdate : t.submitAdd}
          </Button>
        </div>
      </form>
    </Form>
    </ScrollArea>
  );
}
