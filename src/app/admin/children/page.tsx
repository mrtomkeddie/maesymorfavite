
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, ChevronsUp, Edit, UploadCloud } from 'lucide-react';
import { getChildren, deleteChild, getParents, promoteAllChildren } from '@/lib/firebase/firestore';
import type { ChildWithId, ParentWithId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ChildForm } from '@/components/admin/ChildForm';
import { BulkEditChildForm } from '@/components/admin/BulkEditChildForm';
import { CsvImportDialog } from '@/components/admin/CsvImportDialog';
import { Child } from '@/lib/types';
import { getPaginatedChildren } from '@/lib/firebase/firestore';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { Label } from '@/components/ui/label';

export default function ChildrenAdminPage() {
  const [children, setChildren] = useState<ChildWithId[]>([]);
  const [parents, setParents] = useState<ParentWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isPromoteAlertOpen, setIsPromoteAlertOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildWithId | null>(null);
  const [childToDelete, setChildToDelete] = useState<ChildWithId | null>(null);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);
  const [viewChildDialog, setViewChildDialog] = useState(false);
  const [childToView, setChildToView] = useState<ChildWithId | null>(null);


  const { toast } = useToast();

  const generateMockData = () => {
    const yearGroups = ['Nursery', 'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
    const mockParents: ParentWithId[] = [];
    const mockChildren: ChildWithId[] = [];
    
    // Generate 20 parents
    for (let i = 1; i <= 20; i++) {
      mockParents.push({
        id: `mock_parent_${i}`,
        name: `Parent ${i}`,
        email: `parent${i}@example.com`,
      });
    }
    
    // Generate 60 children, randomly assign to parents
    for (let i = 1; i <= 60; i++) {
      mockChildren.push({
        id: `mock_child_${i}`,
        name: `Child ${i}`,
        yearGroup: yearGroups[i % yearGroups.length],
        parentId: mockParents[Math.floor(Math.random() * mockParents.length)].id,
      });
    }
    
    return { mockParents, mockChildren };
  };

  const fetchParents = async () => {
    try {
      // Check if Firebase is properly configured
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        throw new Error('Firebase not configured');
      }
      
      const parentsData = await getParents();
      setParents(parentsData);
    } catch (error) {
      console.log('Firebase not configured, using mock parents');
      const { mockParents } = generateMockData();
      setParents(mockParents);
    }
  };

  const fetchChildren = async (initial = false) => {
    if (initial) {
      setIsLoading(true);
      setLastDoc(undefined);
      setHasMore(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      // Check if Firebase is properly configured
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        throw new Error('Firebase not configured');
      }
      
      const { data, lastDoc: newLastDoc } = await getPaginatedChildren(20, initial ? undefined : lastDoc);
      if (initial) {
        setChildren(data);
      } else {
        setChildren(prev => [...prev, ...data]);
      }
      setLastDoc(newLastDoc);
      setHasMore(!!newLastDoc && data.length === 20);
    } catch (error) {
      console.log('Firebase not configured, using mock children');
      // Use mock data if Firebase fails
      const { mockParents, mockChildren } = generateMockData();
      console.log('Generated mock children data:', mockChildren.length, 'items');
      console.log('Generated mock parents data:', mockParents.length, 'items');
      
      if (initial) {
        setChildren(mockChildren);
        setParents(mockParents); // Also set parents when using mock data
        console.log('Set initial mock children and parents data');
      } else {
        setChildren(prev => [...prev, ...mockChildren]);
      }
      setHasMore(false); // No more mock data to load
    }
    
    setIsLoading(false);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if Firebase is properly configured
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
          throw new Error('Firebase not configured');
        }
        
        // Load both children and parents from Firebase
        const [childrenData, parentsData] = await Promise.all([
          getChildren(),
          getParents()
        ]);
        setChildren(childrenData);
        setParents(parentsData);
      } catch (error) {
        console.log('Firebase not configured, using mock data');
        // Load both children and parents from mock data
        const { mockParents, mockChildren } = generateMockData();
        setChildren(mockChildren);
        setParents(mockParents);
        console.log('Set mock children and parents data');
      }
    };
    
    loadData();
  }, []);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setSelectedChild(null);
    fetchChildren(true);
  };
  
  const handleBulkFormSuccess = () => {
    setIsBulkEditOpen(false);
    fetchChildren(true);
    setSelectedChildrenIds([]);
  }

  const handleImportSuccess = () => {
      setIsImportOpen(false);
      fetchChildren(true);
  }

  const handleEdit = (child: ChildWithId) => {
    setSelectedChild(child);
    setIsDialogOpen(true);
  };

  const handleViewChild = (child: ChildWithId) => {
    setChildToView(child);
    setViewChildDialog(true);
  };

  const closeViewChildDialog = () => {
    setViewChildDialog(false);
    setChildToView(null);
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
        fetchChildren(true);
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
        fetchChildren(true); // Refresh data to show new year groups
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

  const getParentName = (parentId?: string) => {
      if (!parentId) return 'Not Linked';
      const parent = parents.find(p => p.id === parentId);
      console.log(`Child with parentId ${parentId} found parent:`, parent ? parent.name : 'Not found');
      return parent ? parent.name : 'Unknown Parent';
  }

  const activeChildren = children.filter(c => !c.yearGroup.startsWith('Archived'));
  const leaversYear = new Date().getFullYear() + 1;

  const handleSelectAll = (checked: boolean) => {
      if (checked) {
          setSelectedChildrenIds(activeChildren.map(c => c.id));
      } else {
          setSelectedChildrenIds([]);
      }
  }

  const handleSelectChild = (childId: string, checked: boolean) => {
      if (checked) {
          setSelectedChildrenIds(prev => [...prev, childId]);
      } else {
          setSelectedChildrenIds(prev => prev.filter(id => id !== childId));
      }
  }

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
                <DialogContent className="sm:max-w-[725px]">
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
                <PlusCircle className="mr-2 h-4 w-4" /> Add Child
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                <DialogTitle>{selectedChild ? 'Edit' : 'Add'} Child</DialogTitle>
                <DialogDescription>
                    Fill in the details for the child.
                </DialogDescription>
                </DialogHeader>
                <ChildForm
                onSuccess={handleFormSuccess}
                existingChild={selectedChild}
                parents={parents}
                />
            </DialogContent>
            </Dialog>
        </div>
      </div>
      
       <div className="flex items-center gap-4">
        <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
            <DialogTrigger asChild>
                <Button disabled={selectedChildrenIds.length === 0}>
                    <Edit className="mr-2 h-4 w-4" />
                    Bulk Edit ({selectedChildrenIds.length})
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Bulk Edit Children</DialogTitle>
                    <DialogDescription>
                        Update the selected fields for all {selectedChildrenIds.length} selected children. Fields left blank will not be changed.
                    </DialogDescription>
                </DialogHeader>
                <BulkEditChildForm 
                    selectedIds={selectedChildrenIds}
                    parents={parents}
                    onSuccess={handleBulkFormSuccess}
                />
            </DialogContent>
        </Dialog>

        {selectedChildrenIds.length > 0 && (
            <span className="text-sm text-muted-foreground">
                {selectedChildrenIds.length} of {activeChildren.length} selected.
            </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Children</CardTitle>
          <CardDescription>A list of all currently enrolled children.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {console.log('Rendering children page, children length:', children.length, 'activeChildren length:', activeChildren.length)}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                          checked={selectedChildrenIds.length === activeChildren.length && activeChildren.length > 0}
                          onCheckedChange={(checked) => handleSelectAll(!!checked)}
                          aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Year Group</TableHead>
                    <TableHead>Linked Parent</TableHead>
                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeChildren.length > 0 ? (
                    activeChildren.map((child) => (
                      <TableRow key={child.id}>
                         <TableCell>
                           <Checkbox
                              checked={selectedChildrenIds.includes(child.id)}
                              onCheckedChange={(checked) => handleSelectChild(child.id, !!checked)}
                              aria-label={`Select ${child.name}`}
                          />
                         </TableCell>
                        <TableCell className="font-medium">{child.name}</TableCell>
                        <TableCell>{child.yearGroup}</TableCell>
                        <TableCell>{getParentName(child.parentId)}</TableCell>
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
                                  <DropdownMenuItem onClick={() => handleEdit(child)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleViewChild(child)}>
                                      <MoreHorizontal className="mr-2 h-4 w-4" />
                                      View
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
                        No children found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {hasMore && (
                <div className="flex justify-center mt-4">
                  <Button onClick={() => fetchChildren(false)} disabled={isLoadingMore}>
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

      <Dialog open={viewChildDialog} onOpenChange={closeViewChildDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Child Details</DialogTitle>
            <DialogDescription>
              View detailed information about this child.
            </DialogDescription>
          </DialogHeader>
          {childToView && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">{childToView.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Year Group</Label>
                  <p className="text-sm text-muted-foreground">{childToView.yearGroup}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Linked Parent</Label>
                <p className="text-sm text-muted-foreground">
                  {getParentName(childToView.parentId)}
                </p>
              </div>

              {childToView.parentId && (() => {
                const parent = parents.find(p => p.id === childToView.parentId);
                return parent ? (
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium">Parent Contact Details</Label>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Name:</span> {parent.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Email:</span> {parent.email}
                      </p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

    