
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  PlusCircle,
  Pencil,
  Trash2,
  Loader2,
  User,
} from 'lucide-react';
import { getStaff, deleteStaffMember, StaffMemberWithId } from '@/lib/firebase/firestore';
import { deleteFile } from '@/lib/firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { StaffForm } from '@/components/admin/StaffForm';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function StaffAdminPage() {
  const [staff, setStaff] = useState<StaffMemberWithId[]>([]);
  const [groupedStaff, setGroupedStaff] = useState<Record<string, StaffMemberWithId[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMemberWithId | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMemberWithId | null>(null);

  const { toast } = useToast();

  const fetchStaff = async () => {
    setIsLoading(true);
    const staffData = await getStaff();
    setStaff(staffData);

    // Group staff by team
    const groups = staffData.reduce((acc, member) => {
        const team = member.team || 'Other';
        if (!acc[team]) {
            acc[team] = [];
        }
        acc[team].push(member);
        return acc;
    }, {} as Record<string, StaffMemberWithId[]>);
    setGroupedStaff(groups);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setSelectedStaff(null);
    fetchStaff();
  };

  const handleEdit = (member: StaffMemberWithId) => {
    setSelectedStaff(member);
    setIsDialogOpen(true);
  };

  const openDeleteAlert = (member: StaffMemberWithId) => {
    setStaffToDelete(member);
    setIsDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!staffToDelete) return;

    try {
      await deleteStaffMember(staffToDelete.id);

      if (staffToDelete.photoUrl) {
        await deleteFile(staffToDelete.photoUrl);
      }

      toast({
        title: 'Success',
        description: 'Staff member deleted successfully.',
        variant: 'default',
      });
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff member:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete staff member. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteAlertOpen(false);
      setStaffToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Staff Management</h1>
          <p className="text-muted-foreground">Add, edit, and manage staff profiles.</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(isOpen) => {
            setIsDialogOpen(isOpen);
            if (!isOpen) setSelectedStaff(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedStaff ? 'Edit' : 'Add'} Staff Member</DialogTitle>
              <DialogDescription>
                Fill in the details for the staff member. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <StaffForm onSuccess={handleFormSuccess} existingStaff={selectedStaff} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>
            A list of all staff members, grouped by team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : Object.keys(groupedStaff).length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedStaff).map(([team, members]) => (
                <AccordionItem value={team} key={team}>
                  <AccordionTrigger className="text-lg font-semibold">{team}</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                      {members.map((member) => (
                        <Card key={member.id} className="flex flex-col">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={member.photoUrl} alt={member.name} />
                                    <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-xl">{member.name}</CardTitle>
                                    <p className="text-sm text-primary">{member.role}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                {member.bio && <p className="text-sm text-muted-foreground">{member.bio}</p>}
                            </CardContent>
                            <div className="flex items-center justify-end p-4 border-t">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => openDeleteAlert(member)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            </div>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
             <div className="h-24 text-center flex items-center justify-center">
                <p>No staff members found. Add one to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this staff member
              and remove their data from our servers.
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
