
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
import { getWeeklyMenu, updateWeeklyMenu } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeeklyMenu } from '@/lib/types';

const daySchema = z.object({
  main: z.string().min(3, { message: 'Main course must be at least 3 characters.' }),
  alt: z.string().min(3, { message: 'Alternative course must be at least 3 characters.' }),
  dessert: z.string().min(3, { message: 'Dessert must be at least 3 characters.' }),
});

const formSchema = z.object({
  monday: daySchema,
  tuesday: daySchema,
  wednesday: daySchema,
  thursday: daySchema,
  friday: daySchema,
});

type MenuFormValues = z.infer<typeof formSchema>;

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

export default function MenuAdminPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monday: { main: '', alt: '', dessert: '' },
      tuesday: { main: '', alt: '', dessert: '' },
      wednesday: { main: '', alt: '', dessert: '' },
      thursday: { main: '', alt: '', dessert: '' },
      friday: { main: '', alt: '', dessert: '' },
    },
  });

  useEffect(() => {
    const fetchMenu = async () => {
        setIsFetching(true);
        try {
            const menu = await getWeeklyMenu();
            if (menu) {
                form.reset(menu);
            }
        } catch (error) {
            console.error("Error fetching weekly menu: ", error);
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
        await updateWeeklyMenu(values);
        toast({
          title: 'Success!',
          description: 'The weekly lunch menu has been updated successfully.',
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
            <h1 className="text-3xl font-bold tracking-tight">Weekly Lunch Menu</h1>
            <p className="text-muted-foreground">Manage the weekly menu for the parent portal.</p>
        </div>

        <Card>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Tabs defaultValue="monday">
                        <CardHeader>
                            <CardTitle>Edit Weekly Menu</CardTitle>
                            <CardDescription>
                                Select a day to edit the menu. The "Today's Lunch" card on the parent dashboard will automatically show the correct day.
                            </CardDescription>
                            <TabsList className="grid w-full grid-cols-5 mt-4">
                                {days.map(day => (
                                    <TabsTrigger key={day} value={day} className="capitalize">{day}</TabsTrigger>
                                ))}
                            </TabsList>
                        </CardHeader>
                        <CardContent>
                            {isFetching ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <>
                                    {days.map(day => (
                                        <TabsContent key={day} value={day}>
                                            <div className="space-y-4 pt-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`${day}.main` as keyof MenuFormValues}
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
                                                    name={`${day}.alt` as keyof MenuFormValues}
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
                                                    name={`${day}.dessert` as keyof MenuFormValues}
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
                                            </div>
                                        </TabsContent>
                                    ))}
                                </>
                            )}
                        </CardContent>
                    </Tabs>
                    <div className="flex justify-end p-6 border-t">
                        <Button type="submit" disabled={isLoading || isFetching}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Full Menu
                        </Button>
                    </div>
                </form>
            </Form>
        </Card>
    </div>
  );
}
