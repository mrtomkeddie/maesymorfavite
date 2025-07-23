
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
import { getPaginatedStaff, deleteStaffMember } from '@/lib/firebase/firestore';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import type { StaffMemberWithId } from '@/lib/types';
import { deleteFile } from '@/lib/firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { StaffForm } from '@/components/admin/StaffForm';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db } from '@/lib/firebase/config';


export default function StaffAdminPage() {
  const [staff, setStaff] = useState<StaffMemberWithId[]>([]);
  const [groupedStaff, setGroupedStaff] = useState<Record<string, StaffMemberWithId[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMemberWithId | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMemberWithId | null>(null);

  const { toast } = useToast();

  const groupStaff = (staffList: StaffMemberWithId[]) => {
    console.log('Grouping staff list:', staffList.length, 'items');
    const grouped = staffList.reduce((acc, member) => {
      const team = member.team || 'Other';
      if (!acc[team]) {
        acc[team] = [];
      }
      acc[team].push(member);
      return acc;
    }, {} as Record<string, StaffMemberWithId[]>);
    console.log('Grouped staff result:', Object.keys(grouped), 'teams');
    return grouped;
  };

  const generateMockStaff = () => {
    const teams = ['Teaching', 'Support', 'Admin'];
    const roles = ['Teacher', 'Teaching Assistant', 'Head Teacher', 'Admin Assistant'];
    const mockStaff: StaffMemberWithId[] = [];
    
    for (let i = 1; i <= 25; i++) {
      mockStaff.push({
        id: `mock_staff_${i}`,
        name: `Staff Member ${i}`,
        role: roles[i % roles.length],
        team: teams[i % teams.length],
        bio: `This is a short bio for staff member ${i}.`,
        photoUrl: undefined,
      });
    }
    return mockStaff;
  };

  const fetchStaff = async (initial = false) => {
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
      
      const { data, lastDoc: newLastDoc } = await getPaginatedStaff(20, initial ? undefined : lastDoc);
      let newStaff: StaffMemberWithId[] = [];
      if (initial) {
        setStaff(data);
        newStaff = data;
      } else {
        setStaff(prev => {
          const combined = [...prev, ...data];
          newStaff = combined;
          return combined;
        });
      }
      setGroupedStaff(groupStaff(initial ? data : newStaff));
      setLastDoc(newLastDoc);
      setHasMore(!!newLastDoc && data.length === 20);
    } catch (error) {
      console.log('Firebase not configured, using mock data');
      // Use mock data if Firebase fails
      const mockStaffData = generateMockStaff();
      console.log('Generated mock staff data:', mockStaffData.length, 'items');
      
      if (initial) {
        setStaff(mockStaffData);
        setGroupedStaff(groupStaff(mockStaffData));
        console.log('Set initial mock staff data');
      } else {
        setStaff(prev => {
          const combined = [...prev, ...mockStaffData];
          setGroupedStaff(groupStaff(combined));
          return combined;
        });
      }
      setHasMore(false); // No more mock data to load
    }
    
    setIsLoading(false);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    fetchStaff(true);
  }, []);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setSelectedStaff(null);
    fetchStaff(true);
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
          ) : (
            <>
              {console.log('Rendering staff page, groupedStaff keys:', Object.keys(groupedStaff), 'staff length:', staff.length)}
              {Object.keys(groupedStaff).length > 0 ? (
                <>
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
                  {hasMore && (
                    <div className="flex justify-center mt-4">
                      <Button onClick={() => fetchStaff(false)} disabled={isLoadingMore}>
                        {isLoadingMore ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-24 text-center flex items-center justify-center">
                  <p>No staff members found. Add one to get started.</p>
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

    