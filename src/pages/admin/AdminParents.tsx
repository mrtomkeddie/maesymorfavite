

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { HelpButton } from '@/components/tutorial/HelpButton';
import { useTutorial, Tutorial } from '@/contexts/TutorialProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, Users2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { db } from '@/lib/db';
import type { ParentWithId, ChildWithId } from '@/lib/types';
import { ParentForm } from '@/components/admin/ParentForm';

export default function AdminParents() {
  const [parents, setParents] = useState<ParentWithId[]>([]);
  const [children, setChildren] = useState<ChildWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();
  const { autoStartForNewUsers, isTutorialCompleted } = useTutorial();

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [p, c] = await Promise.all([db.getParents(), db.getChildren()]);
        setParents(p);
        setChildren(c);
      } catch (err) {
        console.error(err);
        toast({ title: 'Error', description: 'Failed to load parent data.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [toast]);

  const refresh = async () => {
    try {
      const [p, c] = await Promise.all([db.getParents(), db.getChildren()]);
      setParents(p);
      setChildren(c);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to refresh data.', variant: 'destructive' });
    }
  };

  const handleFormSuccess = async () => {
    await refresh();
    setIsDialogOpen(false);
    setSelectedParent(null);
    toast({ title: 'Success', description: selectedParent ? 'Parent updated successfully.' : 'Parent created successfully.' });
  };

  const handleAddParent = () => {
    setSelectedParent(null);
    setIsDialogOpen(true);
  };

  const handleEditParent = (parent: ParentWithId) => {
    setSelectedParent(parent);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = (parent: ParentWithId) => {
    setDeleteTarget(parent);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await db.deleteParent(deleteTarget.id);
      await refresh();
      toast({ title: 'Deleted', description: 'Parent deleted successfully.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to delete parent.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // Define parents tutorial steps
  const parentsTutorials: Tutorial[] = [
    {
      id: 'parents-management',
      title: language === 'en' ? 'Parents Management' : 'Rheoli Rhieni',
      description: language === 'en' 
        ? 'Learn how to manage parent accounts and contact information.'
        : 'Dysgwch sut i reoli cyfrifon rhieni a gwybodaeth gyswllt.',
      steps: [
        {
          id: 'overview',
          target: '[data-tutorial="parents-overview"]',
          title: language === 'en' ? 'Parents Management Overview' : 'Trosolwg Rheoli Rhieni',
          content: language === 'en'
            ? 'This is your parent management center where you can create parent accounts, update contact information, and manage access permissions.'
            : 'Dyma eich canolfan rheoli rhieni lle gallwch greu cyfrifon rhieni, diweddaru gwybodaeth gyswllt, a rheoli caniatâdau mynediad.',
          position: 'bottom'
        },
        {
          id: 'add-parent',
          target: '[data-tutorial="add-parent-button"]',
          title: language === 'en' ? 'Adding Parent Accounts' : 'Ychwanegu Cyfrifon Rhieni',
          content: language === 'en'
            ? 'Click this button to create a new parent account with contact details and link them to their children.'
            : 'Cliciwch y botwm hwn i greu cyfrif rhiant newydd gyda manylion cyswllt a\'u cysylltu â\'u plant.',
          position: 'left',
          action: 'click'
        }
      ]
    }
  ];

  return (
    <>
      <div className="space-y-6" data-tutorial="parents-overview">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Parents Management</h1>
            <p className="text-muted-foreground">Manage parent accounts and contact information.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
            setIsDialogOpen(isOpen);
            if (!isOpen) setSelectedParent(null);
          }}>
            <DialogTrigger asChild>
              <Button data-tutorial="add-parent-button" onClick={handleAddParent}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Parent Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedParent ? 'Edit' : 'Create'} Parent</DialogTitle>
                <DialogDescription>
                  {selectedParent ? 'Update the parent details below.' : 'Fill in the details to create a new parent account.'}
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
            <CardTitle>Parent Accounts</CardTitle>
            <CardDescription>A list of all parent accounts and their contact information.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Children</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parents.length > 0 ? (
                      parents.map((parent) => {
                        const childNames = children
                          .filter((c) => c.linkedParents?.some(lp => lp.parentId === parent.id))
                          .map((c) => c.name);
                        return (
                          <TableRow key={parent.id}>
                            <TableCell className="font-medium">{parent.name}</TableCell>
                            <TableCell>{parent.email}</TableCell>
                            <TableCell>{childNames.length ? childNames.join(', ') : '—'}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditParent(parent)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleConfirmDelete(parent)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No parent accounts found. Click "Add Parent Account" to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Parent</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the parent account. Linked relationships from children will also be removed. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tutorial Help Button */}
      <HelpButton 
        tutorials={parentsTutorials}
        position="bottom-right"
      />
    </>
  );
}
