import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export default function TeacherLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="absolute top-4 left-4">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Back to Public Site</Link>
      </div>
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pt-8 pb-6">
          <Link to="/" className="mx-auto mb-4 flex items-center justify-center">
            <img src="/logo.png" alt="School logo" className="h-16 w-16" />
          </Link>
          <CardTitle className="font-headline text-2xl mb-2">Teacher Portal Login</CardTitle>
          <CardDescription>Access your teacher dashboard and manage your classroom activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm userRole="teacher" />
        </CardContent>
      </Card>
    </div>
  );
}
