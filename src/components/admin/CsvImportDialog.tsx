
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, FileUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { bulkAddChildren } from '@/lib/firebase/firestore'; // This will need to be generalized
import { Child } from '@/lib/types';


interface CsvImportDialogProps<T> {
  onSuccess: () => void;
  requiredFields: (keyof T)[];
  templateUrl: string;
  templateName: string;
}

export function CsvImportDialog<T extends object>({ onSuccess, requiredFields, templateUrl, templateName }: CsvImportDialogProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setError(null);
    setData([]);
    const file = acceptedFiles[0];

    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          return;
        }

        const headers = results.meta.fields || [];
        const missingHeaders = requiredFields.filter(field => !headers.includes(field as string));
        if (missingHeaders.length > 0) {
          setError(`CSV file is missing required columns: ${missingHeaders.join(', ')}.`);
          return;
        }
        
        // Basic validation for required fields on each row
        const validatedData = results.data.filter(row => {
            return requiredFields.every(field => row[field] && (row[field] as string).trim() !== '');
        });

        if(validatedData.length !== results.data.length) {
            toast({
                title: "Skipped Rows",
                description: `${results.data.length - validatedData.length} rows were skipped due to missing required data.`,
                variant: 'default',
            })
        }

        setData(validatedData);
      },
      error: (err) => {
        setError(`Failed to parse CSV file: ${err.message}`);
      }
    });
  }, [requiredFields, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });

  const handleImport = async () => {
    setIsLoading(true);
    try {
        // This is specific to children, needs generalization for other types
        await bulkAddChildren(data as Child[]);
        toast({
            title: "Import Successful",
            description: `${data.length} records have been successfully imported.`,
        });
        onSuccess();
    } catch(err) {
        console.error("Import failed: ", err);
        setError("An error occurred during the import process. Please check the data and try again.");
    } finally {
        setIsLoading(false);
    }
  }

  const tableHeaders = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Import Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {data.length === 0 ? (
        <>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                ${isDragActive ? 'border-primary bg-secondary' : 'border-border hover:border-primary/50'}`}>
                <input {...getInputProps()} />
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                {isDragActive ? (
                <p>Drop the files here ...</p>
                ) : (
                <p>Drag 'n' drop a CSV file here, or click to select a file</p>
                )}
            </div>
            <div className="text-center">
                 <Button variant="link" asChild>
                    <a href={templateUrl} download={templateName}>
                        Download CSV template
                    </a>
                </Button>
            </div>
        </>
      ) : (
        <div className="space-y-4">
            <h3 className="font-semibold">Data Preview ({data.length} records)</h3>
            <ScrollArea className="h-64 w-full rounded-md border">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            {tableHeaders.map(header => <TableHead key={header}>{header}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {tableHeaders.map(header => <TableCell key={header}>{String(row[header as keyof T] ?? '')}</TableCell>)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => setData([])}>
                    Cancel
                </Button>
                <Button onClick={handleImport} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm and Import
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}
