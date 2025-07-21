
'use client';

import { useState, useEffect } from 'react';
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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';
import { getChildren, deleteChild, ChildWithId, getParents, ParentWithId } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ChildForm } from '@/components/admin/ChildForm';

export default function ChildrenAdminPage() {
  const [children, setChildren] = useState<ChildWithId[]>([]);
  const [parents, setParents] = useState<ParentWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildWithId | null>(null);
  const [childToDelete, setChildToDelete] = useState<ChildWithId | null>(null);

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
  
  const getParentName = (parentId?: string) => {
      if (!parentId) return 'Not Linked';
      const parent = parents.find(p => p.id === parentId);
      return parent ? parent.name : 'Unknown Parent';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">Child Management</h1>
            <p className="text-muted-foreground">Add, edit, and manage child profiles.</p>
        </div>
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

      <Card>
        <CardHeader>
          <CardTitle>All Children</CardTitle>
          <CardDescription>A list of all children enrolled.</CardDescription>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Year Group</TableHead>
                  <TableHead>Linked Parent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {children.length > 0 ? (
                  children.map((child) => (
                    <TableRow key={child.id}>
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
                    <TableCell colSpan={4} className="h-24 text-center">
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
    </div>
  );
}
