

export type StaffMember = {
    name: string;
    role: string;
    team: string;
    bio?: string;
    photoUrl?: string;
};

export type StaffMemberWithId = StaffMember & { id: string };

export type Document = {
    title: string;
    category: string;
    fileUrl: string;
    uploadedAt: string; // ISO 8601 string
}

export type DocumentWithId = Document & { id: string };

    