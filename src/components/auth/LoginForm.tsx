
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

// Dummy credentials for development
const DUMMY_CREDENTIALS = {
  parent: { email: 'parent@example.com', password: 'password123' },
  teacher: { email: 'teacher@example.com', password: 'password123' },
  admin: { email: 'admin@example.com', password: 'password123' }
};

interface LoginFormProps {
  userRole?: 'parent' | 'admin' | 'teacher';
}

export function LoginForm({ userRole = 'parent' }: LoginFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  const strictSupabaseMode = import.meta.env.VITE_DB_PROVIDER === 'supabase' && import.meta.env.VITE_USE_DUMMY_ONLY !== 'true';
  const showDemoPanel = !strictSupabaseMode; // Hide demo creds when enforcing Supabase-only mode

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    const dummyCreds = DUMMY_CREDENTIALS[userRole];

    if (isSupabaseConfigured) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        // When strictly using Supabase, do NOT allow demo fallback
        if (strictSupabaseMode) {
          setError(signInError.message);
          setIsLoading(false);
          return;
        }
        // Otherwise allow fallback for local dev convenience
        if (values.email === dummyCreds.email && values.password === dummyCreds.password) {
          await new Promise(resolve => setTimeout(resolve, 600));
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', userRole);
          localStorage.setItem('userEmail', values.email);
        } else {
          setError(signInError.message);
          setIsLoading(false);
          return;
        }
      } else {
        // Supabase login succeeded - ensure the Vite app's local auth flags are set for routing guards
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userEmail', values.email);
      }
     } else {
       // Mock login for development environment when Supabase is not configured
       if (values.email === dummyCreds.email && values.password === dummyCreds.password) {
         await new Promise(resolve => setTimeout(resolve, 600));
         localStorage.setItem('isAuthenticated', 'true');
         localStorage.setItem('userRole', userRole);
         localStorage.setItem('userEmail', values.email);
       } else {
         setError(`Invalid credentials. Use ${dummyCreds.email} / ${dummyCreds.password}`);
         setIsLoading(false);
         return;
       }
     }

     setIsLoading(false);

     toast({
       title: "Login Successful",
       description: `Welcome to the ${userRole} portal!`,
     });

     let destination = '/dashboard';
     if (userRole === 'admin') {
       destination = '/admin/dashboard';
     } else if (userRole === 'teacher') {
       destination = '/teacher/dashboard';
     }

     navigate(destination);
   }

   return (
     <div className="space-y-6">
       {/* Dummy Credentials Info - hidden in strict Supabase mode */}
       {showDemoPanel && (
         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
           <h4 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials</h4>
           <div className="text-xs text-blue-700">
             <p><strong>Email:</strong> {DUMMY_CREDENTIALS[userRole].email}</p>
             <p><strong>Password:</strong> {DUMMY_CREDENTIALS[userRole].password}</p>
           </div>
         </div>
       )}

       {error && (
         <Alert variant="destructive">
           <AlertTitle>Login Failed</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
       )}

       <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
           <FormField
             control={form.control}
             name="email"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Email Address</FormLabel>
                 <FormControl>
                   <Input 
                     placeholder={DUMMY_CREDENTIALS[userRole].email} 
                     {...field} 
                   />
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
                   <Input 
                     type="password" 
                     placeholder="••••••••" 
                     {...field} 
                   />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
           <Button type="submit" className="w-full" disabled={isLoading}>
             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             Sign In
           </Button>
         </form>
       </Form>

       <div className="text-center text-sm text-muted-foreground">
         {userRole === 'parent' ? (
           <>
             <p>Don't have an account? <Link to="/signup" className="underline">Sign up</Link></p>
             <p>Forgot your password? <Link to="/signup" className="underline">Reset it</Link></p>
           </>
         ) : (
           <p>Contact your system administrator for access.</p>
         )}
       </div>
     </div>
   );
}
