import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, User } from 'lucide-react';

export default function StaffLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary">&larr; Back to Public Site</Link>
      </div>
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto mb-4 flex items-center justify-center">
            <img src="/icon.png" alt="School logo" width={40} height={40} className="h-10 w-10" />
          </Link>
          <CardTitle className="font-headline text-2xl">Staff Login</CardTitle>
          <CardDescription>Please select your login portal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild size="lg" className="w-full justify-center">
            <Link to="/admin/login">
              <Shield className="mr-2 h-5 w-5" /> Admin Portal
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full justify-center">
            <Link to="/teacher/login">
              <User className="mr-2 h-5 w-5" /> Teacher Portal
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
