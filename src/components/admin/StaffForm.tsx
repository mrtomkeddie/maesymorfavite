

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
import { Loader2, CheckCircle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { uploadFile, deleteFile } from '@/lib/firebase/storage';
import { StaffMemberWithId, UserRole } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '../ui/progress';
import { useLanguage } from '@/app/(public)/LanguageProvider';
import { Separator } from '../ui/separator';

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

const formSchema = (t: any) => z.object({
  name: z.string().min(2, { message: t.name_message }),
  role: z.string().min(2, { message: t.role_message }),
  team: z.string({ required_error: t.team_required_error }),
  bio: z.string().optional(),
  photo: z.any().optional(),
  email: z.string().email({ message: t.email_message }).optional().or(z.literal('')),
  portalAccess: z.enum(['none', 'teacher', 'admin']).default('none'),
}).refine(data => {
    if (data.portalAccess !== 'none' && !data.email) {
        return false;
    }
    return true;
}, {
    message: "Email is required to grant portal access.",
    path: ["email"],
});


const content = {
    en: {
        formSchema: {
            name_message: 'Name must be at least 2 characters.',
            role_message: 'Role must be at least 2 characters.',
            team_required_error: 'Please select a team.',
            email_message: "Please enter a valid email address."
        },
        nameLabel: 'Full Name',
        namePlaceholder: 'e.g., Jane Doe',
        roleLabel: 'Role / Title',
        rolePlaceholder: 'e.g., Headteacher',
        teamLabel: 'Team / Year Group',
        teamPlaceholder: 'Select a team',
        bioLabel: 'Bio (Optional)',
        bioPlaceholder: 'A short introduction...',
        photoLabel: 'Profile Photo (Optional)',
        photoDesc: 'Upload a photo of the staff member.',
        portalAccessLabel: 'Portal Access',
        emailLabel: "Staff Member's Email Address",
        portalAccessRoleLabel: 'Portal Role',
        portalAccessRoleDesc: "Grant this user access to the Teacher or Admin portal.",
        uploadComplete: 'Upload complete!',
        toastSuccess: {
            update: { title: "Success!", description: "Staff member has been updated." },
            add: { title: "Success!", description: "New staff member has been added." }
        },
        toastError: {
            title: "Error",
            description: "Something went wrong. Please try again."
        },
        submitButton: {
            update: 'Update Staff',
            add: 'Add Staff'
        }
    },
    cy: {
        formSchema: {
            name_message: 'Rhaid i\'r enw fod o leiaf 2 nod.',
            role_message: 'Rhaid i\'r rôl fod o leiaf 2 nod.',
            team_required_error: 'Dewiswch dîm.',
             email_message: "Mewnbynnwch gyfeiriad e-bost dilys."
        },
        nameLabel: 'Enw Llawn',
        namePlaceholder: 'e.e., Siân Jones',
        roleLabel: 'Rôl / Teitl',
        rolePlaceholder: 'e.e., Pennaeth',
        teamLabel: 'Tîm / Grŵp Blwyddyn',
        teamPlaceholder: 'Dewiswch dîm',
        bioLabel: 'Bywgraffiad (Dewisol)',
        bioPlaceholder: 'Cyflwyniad byr...',
        photoLabel: 'Llun Proffil (Dewisol)',
        photoDesc: 'Uwchlwythwch lun o\'r aelod staff.',
        portalAccessLabel: 'Mynediad Porth',
        emailLabel: "Cyfeiriad E-bost yr Aelod o Staff",
        portalAccessRoleLabel: 'Rôl y Porth',
        portalAccessRoleDesc: "Caniatáu i'r defnyddiwr hwn gael mynediad i borth yr Athro neu'r Gweinyddwr.",
        uploadComplete: 'Wedi\'i uwchlwytho\'n llwyddiannus!',
        toastSuccess: {
            update: { title: "Llwyddiant!", description: "Mae aelod staff wedi'i ddiweddaru." },
            add: { title: "Llwyddiant!", description: "Mae aelod staff newydd wedi'i ychwanegu." }
        },
        toastError: {
            title: "Gwall",
            description: "Aeth rhywbeth o'i le. Ceisiwch eto."
        },
        submitButton: {
            update: 'Diweddaru Staff',
            add: 'Ychwanegu Staff'
        }
    }
};

interface StaffFormProps {
  onSuccess: () => void;
  existingStaff?: StaffMemberWithId | null;
}

export function StaffForm({ onSuccess, existingStaff }: StaffFormProps) {
  const { language } = useLanguage();
  const t = content[language];
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(t.formSchema)),
    defaultValues: {
      name: existingStaff?.name || '',
      role: existingStaff?.role || '',
      team: existingStaff?.team || '',
      bio: existingStaff?.bio || '',
      photo: undefined,
      email: existingStaff?.email || '',
      portalAccess: 'none',
    },
  });

  const onSubmit = async (values: z.infer<ReturnType<typeof formSchema>>) => {
    setIsLoading(true);

    try {
      let photoUrl = existingStaff?.photoUrl || '';
      const fileToUpload = values.photo instanceof File ? values.photo : null;
      let userId = existingStaff?.userId || undefined;

      if (fileToUpload) {
        setUploadProgress(0);
        if (existingStaff?.photoUrl) {
          await deleteFile(existingStaff.photoUrl);
        }
        photoUrl = await uploadFile(fileToUpload, 'staff-photos', (progress) => {
          setUploadProgress(progress);
        });
        setUploadProgress(100);
      }
      
      if (!existingStaff && values.portalAccess !== 'none' && values.email) {
          const newUser = await db.createUser(values.email, values.portalAccess as UserRole);
          userId = newUser.user.id;
      }

      const staffData = {
        name: values.name,
        role: values.role,
        team: values.team,
        bio: values.bio,
        photoUrl: photoUrl,
        email: values.email,
        userId: userId,
      };

      if (existingStaff) {
        await db.updateStaffMember(existingStaff.id, staffData);
        if (existingStaff.userId && values.portalAccess !== 'none') {
             await db.updateUserRole(existingStaff.userId, values.portalAccess as UserRole);
        }
        toast(t.toastSuccess.update);
      } else {
        await db.addStaffMember(staffData);
        toast(t.toastSuccess.add);
      }
      
      form.reset();
      onSuccess();

    } catch (error) {
      console.error('Error submitting form:', error);
      toast(t.toastError);
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
              <FormLabel>{t.nameLabel}</FormLabel>
              <FormControl>
                <Input placeholder={t.namePlaceholder} {...field} />
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
              <FormLabel>{t.roleLabel}</FormLabel>
              <FormControl>
                <Input placeholder={t.rolePlaceholder} {...field} />
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
                <FormLabel>{t.teamLabel}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder={t.teamPlaceholder} />
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
              <FormLabel>{t.bioLabel}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t.bioPlaceholder}
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
              <FormLabel>{t.photoLabel}</FormLabel>
              <FormControl>
                 <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => onChange(e.target.files?.[0])}
                    {...rest}
                />
              </FormControl>
              <FormDescription>
                {t.photoDesc}
              </FormDescription>
               {uploadProgress !== null && uploadProgress < 100 && (
                <Progress value={uploadProgress} className="w-full mt-2" />
              )}
              {uploadProgress === 100 && (
                <div className="flex items-center text-sm text-green-600 mt-2">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>{t.uploadComplete}</span>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />
        
        <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> {t.portalAccessLabel}</h3>
             <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t.emailLabel}</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="staff.member@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="portalAccess"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t.portalAccessRoleLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select a role..." />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="none">No Access</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                    </Select>
                     <FormDescription>
                        {t.portalAccessRoleDesc}
                    </FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>


        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingStaff ? t.submitButton.update : t.submitButton.add}
          </Button>
        </div>
      </form>
    </Form>
  );
}

