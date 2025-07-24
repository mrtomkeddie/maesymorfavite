
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getLunchMenu, updateLunchMenu } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  main: z.string().min(3, { message: 'Main course must be at least 3 characters.' }),
  alt: z.string().min(3, { message: 'Alternative course must be at least 3 characters.' }),
  dessert: z.string().min(3, { message: 'Dessert must be at least 3 characters.' }),
});

type MenuFormValues = z.infer<typeof formSchema>;

export default function MenuAdminPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      main: '',
      alt: '',
      dessert: '',
    },
  });

  useEffect(() => {
    const fetchMenu = async () => {
        setIsFetching(true);
        try {
            const menu = await getLunchMenu();
            if (menu) {
                form.reset(menu);
            }
        } catch (error) {
            console.error("Error fetching lunch menu: ", error);
            toast({
                title: "Error",
                description: "Could not fetch current lunch menu.",
                variant: "destructive"
            });
        } finally {
            setIsFetching(false);
        }
    };
    fetchMenu();
  }, [form, toast]);

  const onSubmit = async (values: MenuFormValues) => {
    setIsLoading(true);
    try {
        await updateLunchMenu(values);
        toast({
          title: 'Success!',
          description: 'Lunch menu has been updated successfully.',
        });
    } catch (error) {
        console.error('Error updating menu:', error);
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
            <h1 className="text-3xl font-bold tracking-tight">Lunch Menu</h1>
            <p className="text-muted-foreground">Manage the "Today's Lunch" card on the parent dashboard.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Today's Menu</CardTitle>
                <CardDescription>
                    Enter the menu items below. This information is displayed on the parent dashboard.
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
                        <FormField
                            control={form.control}
                            name="main"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Main Course</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Shepherd's Pie" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="alt"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Vegetarian / Alternative</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Jacket Potato with Tuna" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="dessert"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Dessert</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Apple Crumble & Custard" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Menu
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
