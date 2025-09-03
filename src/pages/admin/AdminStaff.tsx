

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { HelpButton } from '@/components/tutorial/HelpButton';
import { useTutorial, Tutorial } from '@/contexts/TutorialProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { db } from '@/lib/db';
import { StaffForm } from '@/components/admin/StaffForm';
import type { StaffMemberWithId } from '@/lib/types';

export default function AdminStaff() {
  const [staff, setStaff] = useState<StaffMemberWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMemberWithId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const { autoStartForNewUsers, isTutorialCompleted } = useTutorial();

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const staffData = await db.getStaff();
      setStaff(staffData);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to load staff data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [toast]);

  const handleAddStaff = () => {
    setSelectedStaff(null);
    setIsDialogOpen(true);
  };

  const handleEditStaff = (staffMember: StaffMemberWithId) => {
    setSelectedStaff(staffMember);
    setIsDialogOpen(true);
  };

  const handleDeleteStaff = (staffMember: StaffMemberWithId) => {
    setSelectedStaff(staffMember);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteStaff = async () => {
    if (!selectedStaff) return;

    try {
      setIsDeleting(true);
      await db.deleteStaffMember(selectedStaff.id);
      toast({
        title: 'Success',
        description: 'Staff member has been deleted.',
      });
      await fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete staff member. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedStaff(null);
    }
  };

  const handleFormSuccess = async () => {
    setIsDialogOpen(false);
    setSelectedStaff(null);
    await fetchStaff();
  };

  // Define staff tutorial steps
  const staffTutorials: Tutorial[] = [
    {
      id: 'staff-management',
      title: language === 'en' ? 'Staff Management' : 'Rheoli Staff',
      description: language === 'en' 
        ? 'Learn how to manage school staff profiles and information.'
        : 'Dysgwch sut i reoli proffiliau a gwybodaeth staff yr ysgol.',
      steps: [
        {
          id: 'overview',
          target: '[data-tutorial="staff-overview"]',
          title: language === 'en' ? 'Staff Management Overview' : 'Trosolwg Rheoli Staff',
          content: language === 'en'
            ? 'This is your staff management center where you can add, edit, and manage all school staff information.'
            : 'Dyma eich canolfan rheoli staff lle gallwch ychwanegu, golygu, a rheoli holl wybodaeth staff yr ysgol.',
          position: 'bottom'
        },
        {
          id: 'add-staff',
          target: '[data-tutorial="add-staff-button"]',
          title: language === 'en' ? 'Adding Staff Members' : 'Ychwanegu Aelodau Staff',
          content: language === 'en'
            ? 'Click this button to add a new staff member with their profile information, role, and contact details.'
            : 'Cliciwch y botwm hwn i ychwanegu aelod staff newydd gyda\'u gwybodaeth proffil, rôl, a manylion cyswllt.',
          position: 'left',
          action: 'click'
        }
      ]
    }
  ];

  return (
    <>
      <div className="space-y-6" data-tutorial="staff-overview">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-muted-foreground">Manage school staff profiles and information.</p>
          </div>
          <Button data-tutorial="add-staff-button" onClick={handleAddStaff}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Staff Member
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
            <CardDescription>A list of all school staff members.</CardDescription>
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
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No staff members found. Click "Add Staff Member" to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      staff.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.role}</TableCell>
                          <TableCell>{member.email || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditStaff(member)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive" 
                                  onClick={() => handleDeleteStaff(member)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tutorial Help Button */}
      <HelpButton 
        tutorials={staffTutorials}
        position="bottom-right"
      />

      {/* Add/Edit Staff Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </DialogTitle>
            <DialogDescription>
              {selectedStaff 
                ? 'Update the staff member\'s information below.' 
                : 'Fill in the details to add a new staff member to the school.'}
            </DialogDescription>
          </DialogHeader>
          <StaffForm 
            existingStaff={selectedStaff} 
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedStaff?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteStaff}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
