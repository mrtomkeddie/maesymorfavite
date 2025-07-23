

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, ChevronsUp, UploadCloud, Eye, ArrowUpAZ, ArrowDownZA, Search } from 'lucide-react';
import { getChildren, deleteChild, getParents, promoteAllChildren, getPaginatedChildren } from '@/lib/firebase/firestore';
import type { ChildWithId, ParentWithId, LinkedParent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ChildForm, yearGroups } from '@/components/admin/ChildForm';
import { CsvImportDialog } from '@/components/admin/CsvImportDialog';
import { Child } from '@/lib/types';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { generateMockData } from '@/lib/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

export default function ChildrenAdminPage() {
  const [children, setChildren] = useState<ChildWithId[]>([]);
  const [parents, setParents] = useState<ParentWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isPromoteAlertOpen, setIsPromoteAlertOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildWithId | null>(null);
  const [childToDelete, setChildToDelete] = useState<ChildWithId | null>(null);
  const [isViewChildDialogOpen, setIsViewChildDialogOpen] = useState(false);
  const [childToView, setChildToView] = useState<ChildWithId | null>(null);
  const [yearFilter, setYearFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');


  const { toast } = useToast();

  const fetchChildrenAndParents = async (initial = false) => {
    if (initial) {
        setIsLoading(true);
        setLastDoc(undefined);
        setHasMore(true);
    } else {
        setIsLoadingMore(true);
    }

    try {
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            throw new Error('Firebase not configured');
        }
        
        const childrenResult = await getPaginatedChildren(100, initial ? undefined : lastDoc); // Fetch more to allow for client-side filtering
        const parentsData = await getParents();

        if (initial) {
            setChildren(childrenResult.data);
            setParents(parentsData);
        } else {
            setChildren(prev => [...prev, ...childrenResult.data]);
        }
        setLastDoc(childrenResult.lastDoc);
        setHasMore(!!childrenResult.lastDoc && childrenResult.data.length === 100);

    } catch (error) {
        console.log('Firebase not configured, using mock data for children and parents');
        const { mockParents, mockChildren } = generateMockData();
        if (initial) {
            setChildren(mockChildren);
            setParents(mockParents);
        }
        setHasMore(false);
    } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
    }
  };


  useEffect(() => {
    fetchChildrenAndParents(true);
  }, []);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setSelectedChild(null);
    fetchChildrenAndParents(true);
  };
  
  const handleImportSuccess = () => {
      setIsImportOpen(false);
      fetchChildrenAndParents(true);
  }

  const handleEdit = (child: ChildWithId) => {
    setIsViewChildDialogOpen(false); 
    setSelectedChild(child);
    setIsDialogOpen(true);
  };

  const handleViewChild = (child: ChildWithId) => {
    setChildToView(child);
    setIsViewChildDialogOpen(true);
  };
  
  const openDeleteAlert = (child: ChildWithId) => {
    setChildToDelete(child);
    setIsDeleteAlertOpen(true);
  }

  const handleDelete = async () => {
      if (!childToDelete) return;

      try {
        await deleteChild(childToDelete.id);
        toast({
            title: "Success",
            description: "Child record deleted successfully.",
        });
        fetchChildrenAndParents(true);
      } catch (error) {
        console.error("Error deleting child:", error);
        toast({
            title: "Error",
            description: "Failed to delete child record. Please try again.",
            variant: "destructive",
        });
      } finally {
        setIsDeleteAlertOpen(false);
        setChildToDelete(null);
      }
  };
  
  const handlePromote = async () => {
    setIsProcessing(true);
    try {
        await promoteAllChildren();
        toast({
            title: "Success!",
            description: "All children have been promoted, and Year 6 leavers have been archived."
        });
        fetchChildrenAndParents(true);
    } catch(error) {
        console.error("Error promoting year groups: ", error);
        toast({
            title: "Error",
            description: "Could not promote year groups. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsProcessing(false);
        setIsPromoteAlertOpen(false);
    }
  }

  const getParentInfo = (linkedParents?: LinkedParent[]) => {
      if (!linkedParents || linkedParents.length === 0) return 'Not Linked';
      return linkedParents.map(link => {
          const parent = parents.find(p => p.id === link.parentId);
          return parent ? `${parent.name} (${link.relationship})` : 'Unknown';
      }).join(', ');
  }

  const activeChildren = useMemo(() => children.filter(c => c.yearGroup && !c.yearGroup.startsWith('Archived')), [children]);
  const leaversYear = new Date().getFullYear() + 1;

  const filteredAndSortedChildren = useMemo(() => {
    let result = [...activeChildren];

    if (searchQuery) {
      result = result.filter(child => 
        child.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (yearFilter !== 'all') {
      result = result.filter(child => child.yearGroup === yearFilter);
    }

    result.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    return result;
  }, [activeChildren, yearFilter, sortOrder, searchQuery]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">Child Management</h1>
            <p className="text-muted-foreground">Add, edit, and manage child profiles.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setIsPromoteAlertOpen(true)}>
                <ChevronsUp className="mr-2 h-4 w-4" />
                Promote Year Groups
            </Button>
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Import from CSV
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Import Children from CSV</DialogTitle>
                        <DialogDescription>
                            Upload a CSV file to bulk-add children. Make sure the CSV columns match the required format.
                        </DialogDescription>
                    </DialogHeader>
                    <CsvImportDialog<Child>
                        onSuccess={handleImportSuccess}
                        requiredFields={['name', 'yearGroup']}
                        templateUrl="/templates/children_template.csv"
                        templateName="children_template.csv"
                    />
                </DialogContent>
            </Dialog>
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
                setIsDialogOpen(isOpen);
                if (!isOpen) setSelectedChild(null);
            }}>
            <DialogTrigger asChild>
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Enrol Child
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh]">
                <DialogHeader>
                <DialogTitle>{selectedChild ? 'Edit' : 'Enrol'} Child</DialogTitle>
                <DialogDescription>
                    Fill in the details for the child and link their parents.
                </DialogDescription>
                </DialogHeader>
                <ChildForm
                    onSuccess={handleFormSuccess}
                    existingChild={selectedChild}
                    allParents={parents}
                />
            </DialogContent>
            </Dialog>
        </div>
      </div>
      
       <Card>
        <CardHeader>
            <div className='flex flex-col gap-4 md:flex-row md:justify-between'>
                <div>
                    <CardTitle>All Children</CardTitle>
                    <CardDescription>A list of all currently enrolled children.</CardDescription>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by name..."
                            className="w-full pl-8 md:w-[250px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                        <SelectTrigger className='w-full md:w-[180px]'>
                            <SelectValue placeholder="Filter by year..."/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Year Groups</SelectItem>
                            {yearGroups.map(yg => <SelectItem key={yg} value={yg}>{yg}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                        {sortOrder === 'asc' ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownZA className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Year Group</TableHead>
                    <TableHead>Linked Parent(s)</TableHead>
                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedChildren.length > 0 ? (
                    filteredAndSortedChildren.map((child) => (
                      <TableRow key={child.id}>
                        <TableCell className="font-medium">{child.name}</TableCell>
                        <TableCell>{child.yearGroup}</TableCell>
                        <TableCell>{getParentInfo(child.linkedParents)}</TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleViewChild(child)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(child)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openDeleteAlert(child)} className="text-destructive focus:text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No children found matching the current filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {hasMore && (
                <div className="flex justify-center mt-4">
                  <Button onClick={() => fetchChildrenAndParents(false)} disabled={isLoadingMore}>
                    {isLoadingMore ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the child's record.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isPromoteAlertOpen} onOpenChange={setIsPromoteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Promote all year groups?</AlertDialogTitle>
            <AlertDialogDescription>
                This action will move every child up to the next year group (e.g., Year 1 → Year 2). 
                Children in Year 6 will be archived as 'Leavers {leaversYear}'. This action cannot be undone.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePromote} disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm & Promote
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isViewChildDialogOpen} onOpenChange={setIsViewChildDialogOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{childToView?.name}</DialogTitle>
                <DialogDescription>
                Child Details
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-6">
            {childToView && (
                <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="font-semibold">Year Group</Label>
                        <p className="text-muted-foreground">{childToView.yearGroup}</p>
                    </div>
                    <div>
                        <Label className="font-semibold">Date of Birth</Label>
                        <p className="text-muted-foreground">
                            {childToView.dob ? format(new Date(childToView.dob), 'dd MMMM yyyy') : 'Not set'}
                        </p>
                    </div>
                </div>
                
                <div className="border-t pt-4">
                    <Label className="font-semibold">Linked Parent(s)</Label>
                    {childToView.linkedParents && childToView.linkedParents.length > 0 ? (
                        <div className="mt-2 space-y-3">
                        {childToView.linkedParents.map(link => {
                            const parent = parents.find(p => p.id === link.parentId);
                            return parent ? (
                            <div key={link.parentId} className='text-sm p-2 bg-secondary rounded-md'>
                                <p className="font-semibold">{parent.name} <span className="font-normal text-muted-foreground">({link.relationship})</span></p>
                                <p className="text-muted-foreground">{parent.email}</p>
                            </div>
                            ) : null;
                        })}
                        </div>
                    ) : (
                         <p className="text-sm text-muted-foreground mt-2">No parents linked.</p>
                    )}
                </div>
                </div>
            )}
            </ScrollArea>
           <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => handleEdit(childToView!)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit Child
                </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
