
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function CalendarAdminPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Calendar Management</h1>
            <p className="text-muted-foreground">This section is under construction.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>A full interface for managing school calendar events will be available here.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Calendar className="w-16 h-16 mb-4" />
                <p>Event management is on its way!</p>
            </CardContent>
        </Card>
    </div>
  );
}
