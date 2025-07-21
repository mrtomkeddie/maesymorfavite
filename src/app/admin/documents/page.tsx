
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function DocumentsAdminPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Document Management</h1>
            <p className="text-muted-foreground">This section is under construction.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>A full interface for uploading and managing school documents will be available here.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <FileText className="w-16 h-16 mb-4" />
                <p>Document management is on its way!</p>
            </CardContent>
        </Card>
    </div>
  );
}
