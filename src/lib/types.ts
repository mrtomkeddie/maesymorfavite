

export type StaffMember = {
    name: string;
    role: string;
    team: string;
    bio?: string;
    photoUrl?: string;
};

export type StaffMemberWithId = StaffMember & { id: string };
