
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

export type Parent = {
    name: string;
    email: string;
}

export type ParentWithId = Parent & { id: string };

export type Child = {
    name: string;
    yearGroup: string;
    parentId?: string;
}

export type ChildWithId = Child & { id: string };

export type SiteSettings = {
    address: string;
    phone: string;
    email: string;
}
