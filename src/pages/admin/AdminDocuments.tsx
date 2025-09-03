

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, MoreHorizontal, Download, Eye, Trash2, Upload, FileText, Image, File, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { HelpButton } from '@/components/tutorial/HelpButton';
import { useTutorial } from '@/contexts/TutorialProvider';

interface Document {
  id: string;
  name: string;
  type: 'policy' | 'form' | 'newsletter' | 'report' | 'other';
  category: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  isPublic: boolean;
}

const documentsTutorials = [
  {
    id: 'documents-overview',
    title: 'Document Management',
    description: 'Learn how to manage school documents and files',
    target: '[data-tutorial="documents-overview"]',
    content: 'This is your document management center. Here you can upload, organize, and share important school documents like policies, forms, and newsletters.',
    position: 'bottom' as const,
    tip: 'Keep documents organized by using categories and clear naming'
  },
  {
    id: 'upload-document',
    title: 'Upload Documents',
    description: 'Add new documents to the system',
    target: '[data-tutorial="upload-document"]',
    content: 'Click here to upload new documents. You can add policies, forms, newsletters, reports, and other important files.',
    position: 'left' as const,
    tip: 'Always add a clear description to help others find documents'
  },
  {
    id: 'document-actions',
    title: 'Document Actions',
    description: 'Manage individual documents',
    target: '[data-tutorial="document-actions"]',
    content: 'Use these actions to view, download, or delete documents. You can also toggle public visibility.',
    position: 'left' as const,
    tip: 'Make documents public to share them with parents and staff'
  }
];

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'School Admissions Policy 2024',
    type: 'policy',
    category: 'Policies',
    description: 'Updated admissions policy for the 2024 academic year',
    fileUrl: '/documents/admissions-policy-2024.pdf',
    fileName: 'admissions-policy-2024.pdf',
    fileSize: 245760,
    uploadedBy: 'Admin User',
    uploadedAt: new Date('2024-01-15'),
    isPublic: true
  },
  {
    id: '2',
    name: 'Parent Consent Form',
    type: 'form',
    category: 'Forms',
    description: 'General consent form for school activities',
    fileUrl: '/documents/parent-consent-form.pdf',
    fileName: 'parent-consent-form.pdf',
    fileSize: 156432,
    uploadedBy: 'Admin User',
    uploadedAt: new Date('2024-01-10'),
    isPublic: true
  },
  {
    id: '3',
    name: 'January Newsletter',
    type: 'newsletter',
    category: 'Communications',
    description: 'Monthly newsletter for January 2024',
    fileUrl: '/documents/january-newsletter.pdf',
    fileName: 'january-newsletter.pdf',
    fileSize: 892345,
    uploadedBy: 'Admin User',
    uploadedAt: new Date('2024-01-01'),
    isPublic: true
  }
];

const documentTypes = [
  { value: 'policy', label: 'Policy' },
  { value: 'form', label: 'Form' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'report', label: 'Report' },
  { value: 'other', label: 'Other' }
];

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return <FileText className="h-4 w-4" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <Image className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'other' as Document['type'],
    category: '',
    description: '',
    isPublic: false
  });
  
  const { toast } = useToast();
  const { startTutorial } = useTutorial();

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleUploadDocument = async () => {
    if (!newDocument.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a document name.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const document: Document = {
        id: Date.now().toString(),
        name: newDocument.name,
        type: newDocument.type,
        category: newDocument.category || 'Uncategorized',
        description: newDocument.description,
        fileUrl: `/documents/${newDocument.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        fileName: `${newDocument.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        fileSize: Math.floor(Math.random() * 1000000) + 100000,
        uploadedBy: 'Admin User',
        uploadedAt: new Date(),
        isPublic: newDocument.isPublic
      };
      
      setDocuments(prev => [document, ...prev]);
      setNewDocument({
        name: '',
        type: 'other',
        category: '',
        description: '',
        isPublic: false
      });
      setIsDialogOpen(false);
      
      toast({
        title: 'Document uploaded',
        description: 'The document has been uploaded successfully.'
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast({
        title: 'Document deleted',
        description: 'The document has been removed successfully.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document.',
        variant: 'destructive'
      });
    }
  };

  const toggleDocumentVisibility = async (documentId: string) => {
    try {
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId ? { ...doc, isPublic: !doc.isPublic } : doc
      ));
      toast({
        title: 'Visibility updated',
        description: 'Document visibility has been changed.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update document visibility.',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <div className="space-y-6" data-tutorial="documents-overview">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
            <p className="text-muted-foreground">Upload, organize, and manage school documents</p>
          </div>
          <div className="flex items-center gap-4">
            <HelpButton 
              tutorials={documentsTutorials}
              onStartTutorial={() => startTutorial(documentsTutorials)}
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-tutorial="upload-document">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
                <DialogDescription>
                  Add a new document to the school's document library
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-name">Document Name</Label>
                  <Input
                    id="doc-name"
                    value={newDocument.name}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter document name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="doc-type">Document Type</Label>
                  <Select value={newDocument.type} onValueChange={(value: Document['type']) => setNewDocument(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="doc-category">Category</Label>
                  <Input
                    id="doc-category"
                    value={newDocument.category}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Policies, Forms, Communications"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="doc-description">Description</Label>
                  <Textarea
                    id="doc-description"
                    value={newDocument.description}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the document"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="doc-public"
                    checked={newDocument.isPublic}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="doc-public">Make document publicly accessible</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="doc-file">Select File</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUploadDocument} disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Document'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {documentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]" data-tutorial="document-actions">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getFileIcon(document.fileName)}
                      <div>
                        <p className="font-medium">{document.name}</p>
                        <p className="text-sm text-muted-foreground">{document.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {documentTypes.find(t => t.value === document.type)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{document.category}</TableCell>
                  <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{format(document.uploadedAt, 'MMM d, yyyy')}</p>
                      <p className="text-xs text-muted-foreground">by {document.uploadedBy}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={document.isPublic ? 'default' : 'secondary'}>
                      {document.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleDocumentVisibility(document.id)}>
                          {document.isPublic ? 'Make Private' : 'Make Public'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteDocument(document.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredDocuments.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No documents found</p>
              <p className="text-muted-foreground mb-4">
                {searchQuery || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Upload your first document to get started'
                }
              </p>
              {!searchQuery && typeFilter === 'all' && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  );
}
