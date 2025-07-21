
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
import { getChildren, deleteChild, ChildWithId, getParents, ParentWithId, promoteAllChildren } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ChildForm } from '@/components/admin/ChildForm';
import { BulkEditChildForm } from '@/components/admin/BulkEditChildForm';
import { CsvImportDialog } from '@/components/admin/CsvImportDialog';
import { Child } from '@/lib/types';

export default function ChildrenAdminPage() {
  const [children, setChildren] = useState<ChildWithId[]>([]);
  const [parents, setParents] = useState<ParentWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isPromoteAlertOpen, setIsPromoteAlertOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildWithId | null>(null);
  const [childToDelete, setChildToDelete] = useState<ChildWithId | null>(null);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);


  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    const [childrenData, parentsData] = await Promise.all([getChildren(), getParents()]);
    setChildren(childrenData);
    setParents(parentsData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setSelectedChild(null);
    fetchData();
  };
  
  const handleBulkFormSuccess = () => {
    setIsBulkEditOpen(false);
    fetchData();
    setSelectedChildrenIds([]);
  }

  const handleImportSuccess = () => {
      setIsImportOpen(false);
      fetchData();
  }

  const handleEdit = (child: ChildWithId) => {
    setSelectedChild(child);
    setIsDialogOpen(true);
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
        fetchData();
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
        fetchData(); // Refresh data to show new year groups
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
    </div>
  );

    