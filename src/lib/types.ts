

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
    phone?: string;
}

export type ParentWithId = Parent & { id: string };

export type LinkedParent = {
    parentId: string;
    relationship: string;
}

export type Child = {
    name: string;
    yearGroup: string;
    dob?: string; // ISO 8601 string
    linkedParents?: LinkedParent[];
}

export type ChildWithId = Child & { id: string };

export type SiteSettings = {
    address: string;
    phone: string;
    email: string;
    facebookUrl?: string;
    twitterUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
}

export type InboxMessage = {
    type: 'contact' | 'absence';
    subject: string;
    body: string;
    sender: {
        name: string;
        email: string;
    };
    isRead: boolean;
    createdAt: string; // ISO 8601
}

export type InboxMessageWithId = InboxMessage & { id: string };

export type Photo = {
    caption: string;
    imageUrl: string;
    yearGroups: string[];
    uploadedAt: string; // ISO String
    uploadedBy: string; // For now, a string like an email
};

export type PhotoWithId = Photo & { id: string };

export type DailyMenu = {
    main: string;
    alt: string;
    dessert: string;
}

export type WeeklyMenu = {
    [day: string]: DailyMenu;
}
