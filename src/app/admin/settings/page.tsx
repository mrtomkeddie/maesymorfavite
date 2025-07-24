
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState } from 'react';
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
import { getSiteSettings, updateSiteSettings, SiteSettings } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const urlValidation = z.string().url({ message: "Please enter a valid URL starting with https://" }).optional().or(z.literal(''));

const formSchema = z.object({
  address: z.string().min(10, { message: 'Address must be at least 10 characters.' }),
  phone: z.string().min(10, { message: 'A valid phone number is required.' }),
  email: z.string().email({ message: 'A valid email is required.' }),
  facebookUrl: urlValidation,
  twitterUrl: urlValidation,
  instagramUrl: urlValidation,
  youtubeUrl: urlValidation,
});

type SettingsFormValues = z.infer<typeof formSchema>;

export default function SettingsAdminPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: '',
      phone: '',
      email: '',
      facebookUrl: '',
      twitterUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
        setIsFetching(true);
        try {
            const settings = await getSiteSettings();
            if (settings) {
                form.reset(settings);
            }
        } catch (error) {
            console.error("Error fetching site settings: ", error);
            toast({
                title: "Error",
                description: "Could not fetch current site settings.",
                variant: "destructive"
            });
        } finally {
            setIsFetching(false);
        }
    };
    fetchSettings();
  }, [form, toast]);

  const onSubmit = async (values: SettingsFormValues) => {
    setIsLoading(true);
    try {
        await updateSiteSettings(values);
        toast({
          title: 'Success!',
          description: 'Site settings have been updated successfully.',
        });
    } catch (error) {
        console.error('Error updating settings:', error);
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
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
            <p className="text-muted-foreground">Manage global information for the website.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Global Information</CardTitle>
                <CardDescription>
                    This information is displayed on the public "Contact Us" page and in the footer.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isFetching ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Contact Details</h3>
                             <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>School Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Maes Y Morfa Primary School, School Road, Llanelli, SA15 1EX" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="01234 567890" {...field} />
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
                                    <FormLabel>Public Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="admin@maesymorfa.cymru" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                             <h3 className="text-lg font-medium">Social Media Links</h3>
                             <p className="text-sm text-muted-foreground">Enter the full URL for each social media profile. Leave blank to hide the icon.</p>
                              <FormField
                                control={form.control}
                                name="facebookUrl"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Facebook Page URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://facebook.com/yourschool" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                 <FormField
                                control={form.control}
                                name="twitterUrl"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>X (Twitter) URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://x.com/yourschool" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                 <FormField
                                control={form.control}
                                name="instagramUrl"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Instagram URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://instagram.com/yourschool" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                 <FormField
                                control={form.control}
                                name="youtubeUrl"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>YouTube Channel URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://youtube.com/yourschool" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </div>


                        <div className="flex justify-end">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Settings
                            </Button>
                        </div>
                    </form>
                    </Form>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
