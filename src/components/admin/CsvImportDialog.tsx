

'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, FileUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import type { ParentWithId } from '@/lib/firebase/firestore'; 
import { Child } from '@/lib/types';
import { yearGroups } from './ChildForm';
import { Input } from '../ui/input';
import { useLanguage } from '@/app/(public)/LanguageProvider';


interface CsvImportDialogProps<T> {
  onSuccess: () => void;
  requiredFields: (keyof T)[];
  templateUrl: string;
  templateName: string;
}

type ValidatedRow<T> = {
    data: T;
    isValid: boolean;
    errors: string[];
}

const content = {
    en: {
        error: {
            parsing: "Error parsing CSV: ",
            missingColumns: "CSV file is missing required columns: ",
            requiredField: "' is a required field.",
            invalidYear: "Invalid Year Group: '",
            importFailed: "An error occurred during the import process. Please check the data and try again."
        },
        fileSelect: "Please select a file to process.",
        importErrorTitle: "Import Error",
        csvFileLabel: "CSV File",
        processButton: "Process and Preview",
        templateLink: "Download CSV template",
        previewTitle: "Import Preview",
        validationErrorTitle: "Validation Errors Found",
        validationErrorDesc: "{invalidCount} rows have errors and will be skipped. Only {validCount} valid rows will be imported.",
        validationSuccessDesc: "All {validCount} rows are valid and ready to be imported.",
        statusHeader: "Status",
        statusValid: "Valid",
        startOverButton: "Start Over",
        importButton: "Import {validCount} Valid Records",
        toastSuccess: {
            title: "Import Successful",
            description: "{validCount} records have been successfully imported."
        }
    },
    cy: {
        error: {
            parsing: "Gwall wrth ddosrannu CSV: ",
            missingColumns: "Mae colofnau gofynnol ar goll o'r ffeil CSV: ",
            requiredField: "' yn faes gofynnol.",
            invalidYear: "Grŵp Blwyddyn Annilys: '",
            importFailed: "Digwyddodd gwall yn ystod y broses fewnforio. Gwiriwch y data a cheisiwch eto."
        },
        fileSelect: "Dewiswch ffeil i'w phrosesu.",
        importErrorTitle: "Gwall Mewnforio",
        csvFileLabel: "Ffeil CSV",
        processButton: "Prosesu a Rhagolwg",
        templateLink: "Lawrlwytho templed CSV",
        previewTitle: "Rhagolwg Mewnforio",
        validationErrorTitle: "Canfuwyd Gwallau Dilysu",
        validationErrorDesc: "Mae gan {invalidCount} res wallau a chânt eu hepgor. Dim ond {validCount} rhes ddilys a fewnforir.",
        validationSuccessDesc: "Mae pob un o'r {validCount} rhes yn ddilys ac yn barod i'w mewnforio.",
        statusHeader: "Statws",
        statusValid: "Dilys",
        startOverButton: "Dechrau Drosodd",
        importButton: "Mewnforio {validCount} Cofnod Dilys",
        toastSuccess: {
            title: "Mewnforio'n Llwyddiannus",
            description: "Mae {validCount} cofnod wedi'u mewnforio'n llwyddiannus."
        }
    }
}


export function CsvImportDialog<T extends object>({ onSuccess, requiredFields, templateUrl, templateName }: CsvImportDialogProps<T>) {
  const { language } = useLanguage();
  const t = content[language];
  const [file, setFile] = useState<File | null>(null);
  const [validatedData, setValidatedData] = useState<ValidatedRow<T>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setValidatedData([]);
    }
  };

  const processFile = useCallback(async () => {
    if (!file) {
      setError(t.fileSelect);
      return;
    }
    setIsProcessing(true);
    setError(null);
    setValidatedData([]);

    // This part is specific to children and might need generalization
    const parents = await db.getParents();

    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`${t.error.parsing}${results.errors[0].message}`);
          setIsProcessing(false);
          return;
        }

        const headers = results.meta.fields || [];
        const missingHeaders = requiredFields.filter(field => !headers.includes(field as string));
        if (missingHeaders.length > 0) {
          setError(`${t.error.missingColumns}${missingHeaders.join(', ')}.`);
          setIsProcessing(false);
          return;
        }

        const processedRows: ValidatedRow<T>[] = results.data.map(row => {
            const rowErrors: string[] = [];

            // Required field validation
            requiredFields.forEach(field => {
                if (!row[field] || String(row[field]).trim() === '') {
                    rowErrors.push(`'${String(field)}${t.error.requiredField}`);
                }
            });

            // Child-specific validation
            const childRow = row as unknown as Child;
            if (childRow.yearGroup && !yearGroups.includes(childRow.yearGroup)) {
                rowErrors.push(`${t.error.invalidYear}${childRow.yearGroup}'.`);
            }
            
            return {
                data: row,
                isValid: rowErrors.length === 0,
                errors: rowErrors
            };
        });
        
        setValidatedData(processedRows);
        setIsProcessing(false);
      },
      error: (err) => {
        setError(`Failed to parse CSV file: ${err.message}`);
        setIsProcessing(false);
      }
    });
  }, [file, requiredFields, t]);

  const handleImport = async () => {
    setIsProcessing(true);
    const validRows = validatedData.filter(row => row.isValid).map(row => row.data);

    try {
        // This is specific to children, needs generalization for other types
        await db.bulkAddChildren(validRows as Child[]);
        toast({
            title: t.toastSuccess.title,
            description: t.toastSuccess.description.replace('{validCount}', String(validRows.length)),
        });
        onSuccess();
    } catch(err) {
        console.error("Import failed: ", err);
        setError(t.error.importFailed);
    } finally {
        setIsProcessing(false);
    }
  }

  const resetState = () => {
    setFile(null);
    setValidatedData([]);
    setError(null);
  }

  const tableHeaders = validatedData.length > 0 ? Object.keys(validatedData[0].data) : [];
  const validCount = validatedData.filter(r => r.isValid).length;
  const invalidCount = validatedData.length - validCount;

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t.importErrorTitle}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {validatedData.length === 0 ? (
        <div className='space-y-4'>
            <div className='grid grid-cols-1 space-y-2'>
                <label htmlFor="csv-upload" className='text-sm font-medium'>{t.csvFileLabel}</label>
                <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} />
            </div>
             <Button onClick={processFile} disabled={!file || isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.processButton}
            </Button>
            <div className="text-center mt-2">
                 <Button variant="link" asChild>
                    <a href={templateUrl}>
                        {t.templateLink}
                    </a>
                </Button>
            </div>
        </div>
      ) : (
        <div className="space-y-4">
            <h3 className="font-semibold">{t.previewTitle}</h3>
            {invalidCount > 0 && <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t.validationErrorTitle}</AlertTitle>
                <AlertDescription>{t.validationErrorDesc.replace('{invalidCount}', String(invalidCount)).replace('{validCount}', String(validCount))}</AlertDescription>
            </Alert>}
            {validCount > 0 && invalidCount === 0 && <Alert variant="default">
                <AlertDescription>{t.validationSuccessDesc.replace('{validCount}', String(validCount))}</AlertDescription>
            </Alert>}

            <ScrollArea className="h-64 w-full rounded-md border">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            {tableHeaders.map(header => <TableHead key={header}>{header}</TableHead>)}
                             <TableHead>{t.statusHeader}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {validatedData.map((row, rowIndex) => (
                            <TableRow key={rowIndex} className={!row.isValid ? 'bg-destructive/10' : ''}>
                                {tableHeaders.map(header => <TableCell key={header}>{String(row.data[header as keyof T] ?? '')}</TableCell>)}
                                <TableCell>
                                    {row.isValid ? <span className='text-green-600'>{t.statusValid}</span> : 
                                    <div className='text-destructive text-xs'>
                                        {row.errors.map((e,i) => <div key={i}>{e}</div>)}
                                    </div>}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={resetState} disabled={isProcessing}>
                    {t.startOverButton}
                </Button>
                <Button onClick={handleImport} disabled={isProcessing || validCount === 0}>
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t.importButton.replace('{validCount}', String(validCount))}
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}
