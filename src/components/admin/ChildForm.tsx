

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
import { Loader2, PlusCircle, Trash2, XCircle, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addParent, updateChild, addChild, ParentWithId } from '@/lib/firebase/firestore';
import { ChildWithId, Child, Parent, LinkedParent } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';

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

const newParentSchema = z.object({
    name: z.string().min(2, { message: 'Name is required.' }),
    email: z.string().email({ message: 'A valid email is required.' }),
    phone: z.string().optional(),
    relationship: z.string().min(2, { message: "Relationship is required." }),
});

const existingParentLinkSchema = z.object({
    parentId: z.string(),
    relationship: z.string().min(2, { message: "Relationship is required." })
});


const formSchema = z.object({
  name: z.string().min(2, { message: "Child's name must be at least 2 characters." }),
  yearGroup: z.string({ required_error: 'Please select a year group.' }),
  dob: z.date().optional(),
  linkedParents: z.array(existingParentLinkSchema).default([]),
  newParents: z.array(newParentSchema).default([]),
});

type EnrolFormValues = z.infer<typeof formSchema>;

interface ChildFormProps {
  onSuccess: () => void;
  existingChild?: ChildWithId | null;
  allParents: ParentWithId[];
}

export function ChildForm({ onSuccess, existingChild, allParents }: ChildFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [parentSearch, setParentSearch] = useState('');

  const form = useForm<EnrolFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      yearGroup: '',
      linkedParents: [],
      newParents: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "newParents",
  });
  
  const { fields: linkedParentFields, replace: replaceLinkedParents } = useFieldArray({
      control: form.control,
      name: "linkedParents",
  });

  useEffect(() => {
    if (existingChild) {
        form.reset({
            name: existingChild.name,
            yearGroup: existingChild.yearGroup,
            dob: existingChild.dob ? new Date(existingChild.dob) : undefined,
            linkedParents: existingChild.linkedParents || [],
            newParents: [],
        });
    } else {
        form.reset({
            name: '',
            yearGroup: '',
            dob: undefined,
            linkedParents: [],
            newParents: [],
        });
    }
  }, [existingChild, form]);


  const onSubmit = async (values: EnrolFormValues) => {
    setIsLoading(true);

    try {
        const finalLinkedParents: LinkedParent[] = [...values.linkedParents];

        // 1. Create any new parents
        for (const newParent of values.newParents) {
            const { relationship, ...parentData } = newParent;
            const parentId = await addParent(parentData);
            finalLinkedParents.push({ parentId, relationship });
        }
        
        const childData: Child = {
            name: values.name,
            yearGroup: values.yearGroup,
            dob: values.dob?.toISOString(),
            linkedParents: finalLinkedParents,
        };
        
        if (existingChild) {
            await updateChild(existingChild.id, childData);
        } else {
            await addChild(childData);
        }
        
        toast({
            title: 'Success!',
            description: `Child has been ${existingChild ? 'updated' : 'enrolled'}.`,
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

  const filteredParents = allParents.filter(parent => 
    parent.name.toLowerCase().includes(parentSearch.toLowerCase()) ||
    parent.email.toLowerCase().includes(parentSearch.toLowerCase())
  );

  const linkedParentIds = new Set(form.watch('linkedParents').map(p => p.parentId));

  return (
    <ScrollArea className="max-h-[80vh] pr-6">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h3 className="text-lg font-medium">Child's Details</h3>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Tom Jones" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              name="dob"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        captionLayout="dropdown-buttons"
                        fromYear={new Date().getFullYear() - 12}
                        toYear={new Date().getFullYear()}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        <Separator />

        <h3 className="text-lg font-medium">Parents/Guardians</h3>
        
        <div className="space-y-4 rounded-md border p-4">
            <FormLabel>Link Existing Parents</FormLabel>
             <Input 
                placeholder="Search for existing parents..."
                value={parentSearch}
                onChange={(e) => setParentSearch(e.target.value)}
                className="mb-2"
            />
            <ScrollArea className="h-32 w-full">
               {filteredParents
                .filter(p => !linkedParentIds.has(p.id))
                .map((parent) => (
                <div key={parent.id} className="flex items-center justify-between p-2">
                    <span className="text-sm">{parent.name} ({parent.email})</span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const current = form.getValues('linkedParents');
                            replaceLinkedParents([...current, { parentId: parent.id, relationship: '' }]);
                        }}
                    >
                        Link
                    </Button>
                </div>
               ))}
            </ScrollArea>
        </div>
        
        {linkedParentFields.length > 0 && (
            <div className="space-y-2">
                <FormLabel>Linked Parents</FormLabel>
                {linkedParentFields.map((field, index) => {
                    const parent = allParents.find(p => p.id === field.parentId);
                    return (
                        <div key={field.id} className="flex items-center gap-2 p-2 border rounded-md">
                            <span className="flex-grow text-sm font-medium">{parent?.name}</span>
                            <FormField
                                control={form.control}
                                name={`linkedParents.${index}.relationship`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input {...field} placeholder="Relationship, e.g., Mother" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => {
                                    const current = form.getValues('linkedParents');
                                    replaceLinkedParents(current.filter((_, i) => i !== index));
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                             <FormMessage>{form.formState.errors.linkedParents?.[index]?.relationship?.message}</FormMessage>
                        </div>
                    );
                })}
            </div>
        )}

        
        <Separator />

        <div>
            <FormLabel>Add New Parents</FormLabel>
            <div className="space-y-4 mt-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => remove(index)}
                        >
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>

                         <FormField
                            control={form.control}
                            name={`newParents.${index}.name`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Parent Name</FormLabel>
                                <FormControl><Input {...field} placeholder="Full Name" /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`newParents.${index}.email`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Parent Email</FormLabel>
                                <FormControl><Input {...field} placeholder="Email Address" type="email" /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`newParents.${index}.phone`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Parent Phone (Optional)</FormLabel>
                                <FormControl><Input {...field} placeholder="Mobile Number" type="tel" /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`newParents.${index}.relationship`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Relationship to Child</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., Mother, Guardian" /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                ))}
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ name: '', email: '', phone: '', relationship: '' })}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add a New Parent
            </Button>
        </div>


        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingChild ? 'Update Child' : 'Enrol Child'}
          </Button>
        </div>
      </form>
    </Form>
    </ScrollArea>
  );
}
