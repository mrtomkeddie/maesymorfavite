
'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Search,
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
import { Input } from '@/components/ui/input';

// Re-using the structure from the public about page for consistency
const mockStaffFromAboutPage = [
    { team: "Leadership Team", name: "Jane Morgan", role: "Headteacher" },
    { team: "Leadership Team", name: "Alex Evans", role: "Deputy Head" },
    { team: "Leadership Team", name: "Ceri Lloyd", role: "SENCo" },
    { team: "Nursery & Reception", name: "David Williams", role: "Teacher" },
    { team: "Year 1", name: "Sarah Davies", role: "Teacher" },
    { team: "Year 2", name: "Tomos Jones", role: "Teacher" },
    { team: "Year 3", name: "Emily Roberts", role: "Teacher" },
    { team: "Year 4", name: "Megan Phillips", role: "Teacher" },
    { team: "Year 5", name: "Owain Thomas", role: "Teacher" },
    { team: "Year 6", name: "Ffion Hughes", role: "Teacher" },
    { team: "Support Staff", name: "Mark Phillips", role: "Office Manager" },
    { team: "Support Staff", name: "Rhiannon Price", role: "Teaching Assistant" },
    { team: "Support Staff", name: "Gareth Bale", role: "Teaching Assistant" },
    { team: "Support Staff", name: "Sian Williams", role: "Librarian" },
];


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
  const [searchQuery, setSearchQuery] = useState('');

  const { toast } = useToast();

  const groupStaff = (staffList: StaffMemberWithId[]) => {
    let filteredStaff = staffList;
    if (searchQuery) {
        filteredStaff = staffList.filter(member => 
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.role.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    const grouped = filteredStaff.reduce((acc, member) => {
      const team = member.team || 'Other';
      if (!acc[team]) {
        acc[team] = [];
      }
      acc[team].push(member);
      return acc;
    }, {} as Record<string, StaffMemberWithId[]>);
    
    const orderedGrouped: Record<string, StaffMemberWithId[]> = {};
    const teamOrder = [
        "Leadership Team", "Nursery & Reception", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Support Staff", "Other"
    ];
    
    teamOrder.forEach(team => {
        if(grouped[team]) {
            orderedGrouped[team] = grouped[team];
        }
    });

    Object.keys(grouped).forEach(team => {
        if (!orderedGrouped[team]) {
            orderedGrouped[team] = grouped[team];
        }
    });

    return orderedGrouped;
  };
  
  useEffect(() => {
    setGroupedStaff(groupStaff(staff));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, staff]);


  const generateMockStaff = () => {
    return mockStaffFromAboutPage.map((member, i) => ({
      ...member,
      id: `mock_staff_${i}`,
      bio: `This is a short bio for ${member.name}.`,
      photoUrl: undefined,
    }));
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
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        throw new Error('Firebase not configured');
      }
      
      const { data, lastDoc: newLastDoc } = await getPaginatedStaff(50, initial ? undefined : lastDoc); // Fetch more to allow grouping
      let newStaffList: StaffMemberWithId[] = [];
      if (initial) {
        setStaff(data);
        newStaffList = data;
      } else {
        setStaff(prev => {
          const combined = [...prev, ...data];
          newStaffList = combined;
          return combined;
        });
      }
      setGroupedStaff(groupStaff(newStaffList));
      setLastDoc(newLastDoc);
      setHasMore(!!newLastDoc && data.length === 50);
    } catch (error) {
      console.log('Firebase not configured, using mock data');
      const mockStaffData = generateMockStaff();
      
      if (initial) {
        setStaff(mockStaffData);
        setGroupedStaff(groupStaff(mockStaffData));
      }
      setHasMore(false); // No more mock data to load
    }
    
    setIsLoading(false);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    fetchStaff(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      fetchStaff(true); // Refetch all data
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
    <Dialog
      open={isDialogOpen}
      onOpenChange={(isOpen) => {
        setIsDialogOpen(isOpen);
        if (!isOpen) setSelectedStaff(null);
      }}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                <p className="text-muted-foreground">Add, edit, and manage staff profiles.</p>
            </div>
             <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Staff Member
                </Button>
            </DialogTrigger>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                <div>
                    <CardTitle>Staff Directory</CardTitle>
                    <CardDescription>
                    A list of all staff members, grouped by team.
                    </CardDescription>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name or role..."
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
                {Object.keys(groupedStaff).length > 0 ? (
                  <>
                    <Accordion type="multiple" defaultValue={Object.keys(groupedStaff)} className="w-full">
                      {Object.entries(groupedStaff).map(([team, members]) => (
                        <AccordionItem value={team} key={team}>
                          <AccordionTrigger className="text-lg font-semibold">{team} ({members.length})</AccordionTrigger>
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
                    {hasMore && Object.keys(groupStaff(staff)).length === Object.keys(groupedStaff).length && (
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
                    <p>No staff members found matching your search.</p>
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
  );
}

    