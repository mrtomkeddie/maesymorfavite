import { supabase } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="absolute top-4 left-4">
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">&larr; Back to Login</Link>
            </div>
            <Card className="w-full max-w-md shadow-2xl border-0">
                <CardHeader className="text-center">
                     <Link href="/" className="mx-auto mb-4 flex items-center justify-center">
                        <Image src="/icon.png" alt="School logo" width={40} height={40} className="h-10 w-10" />
                    </Link>
                    <CardTitle className="font-headline text-2xl">Parent Portal</CardTitle>
                    <CardDescription>Create an account or reset your password</CardDescription>
                </CardHeader>
                <CardContent>
                    <Auth
                        supabaseClient={supabase}
                        appearance={{ theme: ThemeSupa }}
                        providers={[]}
                        view="sign_up"
                        redirectTo={`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`}
                        showLinks={true}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

