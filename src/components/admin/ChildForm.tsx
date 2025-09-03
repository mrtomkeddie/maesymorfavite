



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
import { db } from '@/lib/db';
import type { ParentWithId, ChildWithId, Child, Parent, LinkedParent } from '@/lib/types';
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
import { DatePicker } from '../ui/date-picker';
import { useLanguage } from '@/contexts/LanguageProvider';

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

const newParentSchema = (t: any) => z.object({
    name: z.string().min(2, { message: t.name_message }),
    email: z.string().email({ message: t.email_message }),
    phone: z.string().optional(),
    relationship: z.string().min(2, { message: t.relationship_message }),
});

const existingParentLinkSchema = (t: any) => z.object({
    parentId: z.string(),
    relationship: z.string().min(2, { message: t.relationship_message })
});


const formSchema = (t: any) => z.object({
  name: z.string().min(2, { message: t.child_name_message }),
  yearGroup: z.string({ required_error: t.yearGroup_required_error }),
  dob: z.date().optional(),
  linkedParents: z.array(existingParentLinkSchema(t)).default([]),
  newParents: z.array(newParentSchema(t)).default([]),
});

const content = {
    en: {
        formSchema: {
            name_message: 'Name is required.',
            email_message: 'A valid email is required.',
            relationship_message: "Relationship is required.",
            child_name_message: "Child's name must be at least 2 characters.",
            yearGroup_required_error: 'Please select a year group.',
        },
        childDetails: "Child's Details",
        fullName: "Full Name",
        fullNamePlaceholder: "e.g., Tom Jones",
        yearGroup: "Year Group",
        yearGroupPlaceholder: "Select a year group",
        dob: "Date of Birth",
        parents: "Parents/Guardians",
        linkExisting: "Link Existing Parents",
        linkExistingPlaceholder: "Search for existing parents...",
        linkButton: "Link",
        linkedParents: "Linked Parents",
        relationshipPlaceholder: "Relationship, e.g., Mother",
        addNew: "Add New Parents",
        parentName: "Parent Name",
        parentEmail: "Parent Email",
        parentPhone: "Parent Phone (Optional)",
        parentPhonePlaceholder: "Mobile Number",
        childRelationship: "Relationship to Child",
        childRelationshipPlaceholder: "e.g., Mother, Guardian",
        addNewButton: "Add a New Parent",
        toastSuccess: {
            update: { title: "Success!", description: "Child has been updated." },
            add: { title: "Success!", description: "Child has been enrolled." }
        },
        toastError: {
            title: "Error",
            description: "Something went wrong. Please try again."
        },
        submitUpdate: "Update Child",
        submitEnrol: "Enrol Child"
    },
    cy: {
        formSchema: {
            name_message: 'Mae angen enw.',
            email_message: 'Mae angen cyfeiriad e-bost dilys.',
            relationship_message: "Mae angen perthynas.",
            child_name_message: "Rhaid i enw'r plentyn fod o leiaf 2 nod.",
            yearGroup_required_error: 'Dewiswch grŵp blwyddyn.',
        },
        childDetails: "Manylion y Plentyn",
        fullName: "Enw Llawn",
        fullNamePlaceholder: "e.e., Tomos Jones",
        yearGroup: "Grŵp Blwyddyn",
        yearGroupPlaceholder: "Dewiswch grŵp blwyddyn",
        dob: "Dyddiad Geni",
        parents: "Rhieni/Gwarcheidwaid",
        linkExisting: "Cysylltu Rhieni Presennol",
        linkExistingPlaceholder: "Chwilio am rieni presennol...",
        linkButton: "Cysylltu",
        linkedParents: "Rhieni Cysylltiedig",
        relationshipPlaceholder: "Perthynas, e.e., Mam",
        addNew: "Ychwanegu Rhieni Newydd",
        parentName: "Enw'r Rhiant",
        parentEmail: "E-bost y Rhiant",
        parentPhone: "Ffôn y Rhiant (Dewisol)",
        parentPhonePlaceholder: "Rhif Ffôn Symudol",
        childRelationship: "Perthynas â'r Plentyn",
        childRelationshipPlaceholder: "e.e., Mam, Gwarcheidwad",
        addNewButton: "Ychwanegu Rhiant Newydd",
        toastSuccess: {
            update: { title: "Llwyddiant!", description: "Mae'r plentyn wedi'i ddiweddaru." },
            add: { title: "Llwyddiant!", description: "Mae'r plentyn wedi'i gofrestru." }
        },
        toastError: {
            title: "Gwall",
            description: "Aeth rhywbeth o'i le. Ceisiwch eto."
        },
        submitUpdate: "Diweddaru Plentyn",
        submitEnrol: "Cofrestru Plentyn"
    }
}


interface ChildFormProps {
  onSuccess: () => void;
  existingChild?: ChildWithId | null;
  allParents: ParentWithId[];
}

export function ChildForm({ onSuccess, existingChild, allParents }: ChildFormProps) {
  const { language } = useLanguage();
  const t = content[language];
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [parentSearch, setParentSearch] = useState('');
  const currentYear = new Date().getFullYear();

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(t.formSchema)),
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


  const onSubmit = async (values: z.infer<ReturnType<typeof formSchema>>) => {
    setIsLoading(true);

    try {
        const finalLinkedParents: LinkedParent[] = [...values.linkedParents];

        // 1. Create any new parents
        for (const newParent of values.newParents) {
            const { relationship, ...parentData } = newParent;
            const parentId = await db.addParent(parentData as Parent);
            finalLinkedParents.push({ parentId, relationship });
        }
        
        const childData: Child = {
            name: values.name,
            yearGroup: values.yearGroup,
            dob: values.dob?.toISOString(),
            linkedParents: finalLinkedParents,
        };
        
        if (existingChild) {
            await db.updateChild(existingChild.id, childData);
             toast(t.toastSuccess.update);
        } else {
            await db.addChild(childData);
            toast(t.toastSuccess.add);
        }
        
        onSuccess();

    } catch (error) {
      console.error('Error submitting form:', error);
      toast(t.toastError);
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
    <ScrollArea className="max-h-[80vh]">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2 pb-6 px-6">
            <div>
                <h3 className="text-lg font-medium">{t.childDetails}</h3>
                <div className="space-y-4 mt-2">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t.fullName}</FormLabel>
                        <FormControl>
                            <Input placeholder={t.fullNamePlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <FormField
                            control={form.control}
                            name="yearGroup"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.yearGroup}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder={t.yearGroupPlaceholder} />
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
                                <FormItem>
                                    <FormLabel>{t.dob}</FormLabel>
                                    <FormControl>
                                       <DatePicker
                                            date={field.value}
                                            onDateChange={field.onChange}
                                            fromYear={currentYear - 12}
                                            toYear={currentYear - 3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </div>
            
            <Separator />

            <div>
                <h3 className="text-lg font-medium">{t.parents}</h3>
                <div className="space-y-4 mt-2">
                    <div className="space-y-4 rounded-md border p-4">
                        <FormLabel>{t.linkExisting}</FormLabel>
                        <Input 
                            placeholder={t.linkExistingPlaceholder}
                            value={parentSearch}
                            onChange={(e) => setParentSearch(e.target.value)}
                            className="mb-2"
                        />
                        <ScrollArea className="h-32 w-full">
                            <div className="pr-4">
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
                                            {t.linkButton}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                    
                    {linkedParentFields.length > 0 && (
                        <div className="space-y-2">
                            <FormLabel>{t.linkedParents}</FormLabel>
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
                                                        <Input {...field} placeholder={t.relationshipPlaceholder} />
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
                        <FormLabel>{t.addNew}</FormLabel>
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
                                            <FormLabel>{t.parentName}</FormLabel>
                                            <FormControl><Input {...field} placeholder={t.fullNamePlaceholder} /></FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`newParents.${index}.email`}
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>{t.parentEmail}</FormLabel>
                                            <FormControl><Input {...field} placeholder="email@example.com" type="email" /></FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`newParents.${index}.phone`}
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>{t.parentPhone}</FormLabel>
                                            <FormControl><Input {...field} placeholder={t.parentPhonePlaceholder} type="tel" /></FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`newParents.${index}.relationship`}
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>{t.childRelationship}</FormLabel>
                                            <FormControl><Input {...field} placeholder={t.childRelationshipPlaceholder} /></FormControl>
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
                            {t.addNewButton}
                        </Button>
                    </div>
                </div>
            </div>


            <div className="flex justify-end pt-4 border-t sticky bottom-0 bg-background z-10">
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {existingChild ? t.submitUpdate : t.submitEnrol}
            </Button>
            </div>
        </form>
        </Form>
    </ScrollArea>
  );
}
