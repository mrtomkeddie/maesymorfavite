
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

interface LoginFormProps {
  userRole: 'parent' | 'admin';
}

export function LoginForm({ userRole }: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Mock authentication
    console.log(`Attempting login for ${userRole} with email: ${values.email}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would verify credentials against a backend (e.g., Firebase Auth)
    // and check the user's role.
    
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', userRole);

    if (userRole === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
    router.refresh();
  }
  
  async function socialLogin(provider: 'google' | 'apple') {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // This logic would also need to handle roles
    if (userRole === 'parent') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'parent');
      router.push('/dashboard');
      router.refresh();
    } else {
        // Handle admin social login if necessary, or disable it.
        console.error("Admin social login not configured.");
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder={userRole === 'admin' ? "admin@example.com" : "parent@example.com"} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In with Email
          </Button>
        </form>
      </Form>
      
      {userRole === 'parent' && (
        <>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" onClick={() => socialLogin('google')} disabled={isLoading}>
                Sign in with Google
                </Button>
            </div>
        </>
      )}
    </div>
  );
}
