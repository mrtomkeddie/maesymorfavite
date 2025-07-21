
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function StaffAdminPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Staff Management</h1>
            <p className="text-muted-foreground">This section is under construction.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>A full interface for managing the staff directory will be available here.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Users className="w-16 h-16 mb-4" />
                <p>Staff directory management is on its way!</p>
            </CardContent>
        </Card>
    </div>
  );
}
