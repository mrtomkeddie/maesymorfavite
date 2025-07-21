
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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, UserPlus } from 'lucide-react';
import { getParents, deleteParent, ParentWithId, getChildren, ChildWithId } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ParentForm } from '@/components/admin/ParentForm';

export default function ParentsAdminPage() {
  const [parents, setParents] = useState<ParentWithId[]>([]);
  const [children, setChildren] = useState<ChildWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentWithId | null>(null);
  const [parentToDelete, setParentToDelete] = useState<ParentWithId | null>(null);

  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    const [parentsData, childrenData] = await Promise.all([getParents(), getChildren()]);
    setParents(parentsData);
    setChildren(childrenData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setSelectedParent(null);
    fetchData();
  };

  const handleEdit = (parent: ParentWithId) => {
    setSelectedParent(parent);
    setIsDialogOpen(true);
  };
  
  const openDeleteAlert = (parent: ParentWithId) => {
    setParentToDelete(parent);
    setIsDeleteAlertOpen(true);
  }

  const handleDelete = async () => {
      if (!parentToDelete) return;

      try {
        await deleteParent(parentToDelete.id);
        toast({
            title: "Success",
            description: "Parent account deleted successfully.",
        });
        fetchData();
      } catch (error) {
        console.error("Error deleting parent:", error);
        toast({
            title: "Error",
            description: "Failed to delete parent account. Please try again.",
            variant: "destructive",
        });
      } finally {
        setIsDeleteAlertOpen(false);
        setParentToDelete(null);
      }
  };
  
  const getLinkedChildrenNames = (parentId: string) => {
      return children
        .filter(c => c.parentId === parentId)
        .map(c => c.name)
        .join(', ');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">Parent Management</h1>
            <p className="text-muted-foreground">Add, edit, and manage parent accounts.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
            setIsDialogOpen(isOpen);
            if (!isOpen) setSelectedParent(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add Parent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{selectedParent ? 'Edit' : 'Add'} Parent</DialogTitle>
              <DialogDescription>
                Fill in the details for the parent account.
              </DialogDescription>
            </DialogHeader>
            <ParentForm
              onSuccess={handleFormSuccess}
              existingParent={selectedParent}
              allChildren={children}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Parent Accounts</CardTitle>
          <CardDescription>A list of all registered parents.</CardDescription>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Linked Children</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parents.length > 0 ? (
                  parents.map((parent) => (
                    <TableRow key={parent.id}>
                      <TableCell className="font-medium">{parent.name}</TableCell>
                      <TableCell>{parent.email}</TableCell>
                       <TableCell>
                        {getLinkedChildrenNames(parent.id) || <span className="text-muted-foreground">None</span>}
                       </TableCell>
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
                                <DropdownMenuItem onClick={() => handleEdit(parent)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openDeleteAlert(parent)} className="text-destructive focus:text-destructive">
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
                      No parents found.
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
                This action cannot be undone. This will permanently delete the parent account.
                This will not delete their children's records but will unlink them.
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
