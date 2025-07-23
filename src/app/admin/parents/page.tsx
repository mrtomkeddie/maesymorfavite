

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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, UserPlus, Eye, Search } from 'lucide-react';
import { getParents, deleteParent, ParentWithId, getChildren, ChildWithId, getPaginatedParents } from '@/lib/firebase/firestore';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ParentForm } from '@/components/admin/ParentForm';
import { Label } from '@/components/ui/label';
import { generateMockData } from '@/lib/mockData';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ParentsAdminPage() {
  const [parents, setParents] = useState<ParentWithId[]>([]);
  const [children, setChildren] = useState<ChildWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentWithId | null>(null);
  const [parentToDelete, setParentToDelete] = useState<ParentWithId | null>(null);
  const [isViewParentDialogOpen, setIsViewParentDialogOpen] = useState(false);
  const [parentToView, setParentToView] = useState<ParentWithId | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { toast } = useToast();

  const fetchParentsAndChildren = async (initial = false) => {
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

        const parentsResult = await getPaginatedParents(20, initial ? undefined : lastDoc);
        const childrenData = await getChildren(); // Fetch all children for linking

        if (initial) {
            setParents(parentsResult.data);
            setChildren(childrenData);
        } else {
            setParents(prev => [...prev, ...parentsResult.data]);
        }
        setLastDoc(parentsResult.lastDoc);
        setHasMore(!!parentsResult.lastDoc && parentsResult.data.length === 20);

    } catch (error) {
        console.log('Firebase not configured, using mock data for parents and children');
        const { mockParents, mockChildren } = generateMockData();
        if (initial) {
            setParents(mockParents);
            setChildren(mockChildren);
        }
        setHasMore(false);
    } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
    }
  };


  useEffect(() => {
    fetchParentsAndChildren(true);
  }, []);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setSelectedParent(null);
    fetchParentsAndChildren(true);
  };

  const handleEdit = (parent: ParentWithId) => {
    setIsViewParentDialogOpen(false); // Close view dialog if open
    setSelectedParent(parent);
    setIsDialogOpen(true);
  };

  const handleViewParent = (parent: ParentWithId) => {
    setParentToView(parent);
    setIsViewParentDialogOpen(true);
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
        fetchParentsAndChildren(true);
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
      const linkedChildren = children.filter(c => c.parentIds?.includes(parentId));
      if (linkedChildren.length === 0) return <span className="text-muted-foreground">None</span>;
      return linkedChildren.map(c => c.name).join(', ');
  }

  const filteredParents = useMemo(() => {
    return parents.filter(parent => 
      parent.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [parents, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
          <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
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
            <div className='flex flex-col gap-4 md:flex-row md:justify-between'>
                <div>
                    <CardTitle>All Parent Accounts</CardTitle>
                    <CardDescription>A list of all registered parents.</CardDescription>
                </div>
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
                    <TableHead>Email</TableHead>
                    <TableHead>Linked Children</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParents.length > 0 ? (
                    filteredParents.map((parent) => (
                      <TableRow key={parent.id}>
                        <TableCell className="font-medium">{parent.name}</TableCell>
                        <TableCell>{parent.email}</TableCell>
                         <TableCell>
                          {getLinkedChildrenNames(parent.id)}
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
                                  <DropdownMenuItem onClick={() => handleViewParent(parent)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View
                                  </DropdownMenuItem>
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
              {hasMore && filteredParents.length === parents.length && (
                <div className="flex justify-center mt-4">
                  <Button onClick={() => fetchParentsAndChildren(false)} disabled={isLoadingMore}>
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

      <Dialog open={isViewParentDialogOpen} onOpenChange={setIsViewParentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{parentToView?.name}</DialogTitle>
            <DialogDescription>
              Parent Details
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-6">
            {parentToView && (
              <div className="space-y-4 py-4">
                <div className="space-y-4">
                  <div>
                      <Label className="font-semibold">Email Address</Label>
                      <p className="text-muted-foreground">{parentToView.email}</p>
                  </div>
                  <div>
                      <Label className="font-semibold">Mobile Number</Label>
                      <p className="text-muted-foreground">{parentToView.phone || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <Label className="font-semibold">Linked Children</Label>
                  {(() => {
                    const linkedChildren = children.filter(c => c.parentIds?.includes(parentToView.id));
                    return linkedChildren.length > 0 ? (
                      <div className="mt-2 space-y-3">
                        {linkedChildren.map((child) => (
                          <div key={child.id} className="flex items-center justify-between rounded-lg p-3 bg-secondary">
                            <div>
                              <p className="font-medium text-secondary-foreground">{child.name}</p>
                              <p className="text-sm text-secondary-foreground/80">{child.yearGroup}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">No children linked to this parent.</p>
                    );
                  })()}
                </div>
              </div>
            )}
          </ScrollArea>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => handleEdit(parentToView!)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Parent
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
