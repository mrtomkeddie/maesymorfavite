

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { HelpButton } from '@/components/tutorial/HelpButton';
import { useTutorial, Tutorial } from '@/contexts/TutorialProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, BookUser } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { db } from '@/lib/db';
import type { ChildWithId, ParentWithId } from '@/lib/types';
import { ChildForm } from '@/components/admin/ChildForm';

export default function AdminChildren() {
  const [children, setChildren] = useState<ChildWithId[]>([]);
  const [parents, setParents] = useState<ParentWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();
  const { autoStartForNewUsers, isTutorialCompleted } = useTutorial();

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [c, p] = await Promise.all([db.getChildren(), db.getParents()]);
        setChildren(c);
        setParents(p);
      } catch (err) {
        console.error(err);
        toast({ title: 'Error', description: 'Failed to load students.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [toast]);

  const refresh = async () => {
    try {
      const [c, p] = await Promise.all([db.getChildren(), db.getParents()]);
      setChildren(c);
      setParents(p);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to refresh data.', variant: 'destructive' });
    }
  };

  const handleFormSuccess = async () => {
    await refresh();
    setIsDialogOpen(false);
    setSelectedChild(null);
    toast({ title: 'Success', description: selectedChild ? 'Student updated successfully.' : 'Student enrolled successfully.' });
  };

  const handleAddChild = () => {
    setSelectedChild(null);
    setIsDialogOpen(true);
  };

  const handleEditChild = (child: ChildWithId) => {
    setSelectedChild(child);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = (child: ChildWithId) => {
    setDeleteTarget(child);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await db.deleteChild(deleteTarget.id);
      await refresh();
      toast({ title: 'Deleted', description: 'Student deleted successfully.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to delete student.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // Define children tutorial steps
  const childrenTutorials: Tutorial[] = [
    {
      id: 'children-management',
      title: language === 'en' ? 'Children Management' : 'Rheoli Plant',
      description: language === 'en' 
        ? 'Learn how to manage student records and enrollment information.'
        : 'Dysgwch sut i reoli cofnodion myfyrwyr a gwybodaeth cofrestru.',
      steps: [
        {
          id: 'overview',
          target: '[data-tutorial="children-overview"]',
          title: language === 'en' ? 'Children Management Overview' : 'Trosolwg Rheoli Plant',
          content: language === 'en'
            ? 'This is your student management center where you can enroll new students, update records, and manage class assignments.'
            : 'Dyma eich canolfan rheoli myfyrwyr lle gallwch gofrestru myfyrwyr newydd, diweddaru cofnodion, a rheoli aseiniadau dosbarth.',
          position: 'bottom'
        },
        {
          id: 'add-child',
          target: '[data-tutorial="add-child-button"]',
          title: language === 'en' ? 'Enrolling Students' : 'Cofrestru Myfyrwyr',
          content: language === 'en'
            ? 'Click this button to enroll a new student with their personal information, emergency contacts, and class assignment.'
            : 'Cliciwch y botwm hwn i gofrestru myfyriwr newydd gyda\'u gwybodaeth bersonol, cysylltiadau brys, ac aseiniad dosbarth.',
          position: 'left',
          action: 'click'
        }
      ]
    }
  ];

  return (
    <>
      <div className="space-y-6" data-tutorial="children-overview">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Children Management</h1>
            <p className="text-muted-foreground">Manage student records and enrollment information.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
            setIsDialogOpen(isOpen);
            if (!isOpen) setSelectedChild(null);
          }}>
            <DialogTrigger asChild>
              <Button data-tutorial="add-child-button" onClick={handleAddChild}>
                <PlusCircle className="mr-2 h-4 w-4" /> Enroll Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedChild ? 'Edit' : 'Enrol'} Student</DialogTitle>
                <DialogDescription>
                  {selectedChild ? 'Update the student details below.' : 'Fill in the details to enrol a new student.'}
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

        <Card>
          <CardHeader>
            <CardTitle>Enrolled Students</CardTitle>
            <CardDescription>A list of all enrolled students.</CardDescription>
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
                      <TableHead>Class</TableHead>
                      <TableHead>Parent/Guardian</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {children.length > 0 ? (
                      children.map((child) => {
                        const parentNames = (child.linkedParents || [])
                          .map(lp => parents.find(p => p.id === lp.parentId)?.name || '')
                          .filter(Boolean);
                        return (
                          <TableRow key={child.id}>
                            <TableCell className="font-medium">{child.name}</TableCell>
                            <TableCell>{child.yearGroup || '—'}</TableCell>
                            <TableCell>{parentNames.length ? parentNames.join(', ') : '—'}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditChild(child)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleConfirmDelete(child)}>
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
                          No students enrolled yet. Click "Enroll Student" to get started.
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
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the student record and unlink from parents. Continue?
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
        tutorials={childrenTutorials}
        position="bottom-right"
      />
    </>
  );
}
