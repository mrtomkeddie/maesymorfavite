


// This file will contain the Supabase implementations of all data functions.
// Note: This is a placeholder implementation. A real implementation would require a
// Supabase project with tables matching the data structures in src/lib/types.ts.

import { createClient } from '@supabase/supabase-js';
import type { NewsPost, NewsPostWithId, CalendarEvent, CalendarEventWithId, StaffMember, StaffMemberWithId, Document, DocumentWithId, Parent, ParentWithId, Child, ChildWithId, SiteSettings, InboxMessage, InboxMessageWithId, Photo, PhotoWithId, WeeklyMenu } from '@/lib/types';
import { QueryDocumentSnapshot } from "firebase/firestore"; // This type is Firebase-specific and should eventually be removed.
import { news as mockNews } from '@/lib/mockNews';

// Only create a client if the environment variables are set.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Helper function to ensure Supabase is configured before use.
function getSupabaseClient() {
    if (!supabase) {
        // This check is important for when the app runs in an environment
        // where Supabase credentials are not provided (like Firebase Studio).
        // Returning null allows the db/index.ts to fall back to Firebase.
        return null;
    }
    return supabase;
}


// Placeholder error for unimplemented functions
const notImplemented = () => {
    return Promise.reject(new Error("This function is not yet implemented for the Supabase provider."));
}

// === NEWS ===
const fromSupabaseNews = (news: any): NewsPostWithId => {
    if (!news) return news;
    return {
        ...news,
        attachmentUrl: news.attachmentUrl,
        attachmentName: news.attachmentName,
        isUrgent: news.isUrgent,
        createdBy: news.createdBy,
        lastEdited: news.lastEdited,
    };
};

const toSupabaseNews = (news: Partial<NewsPost>) => {
    const { attachmentUrl, attachmentName, isUrgent, createdBy, lastEdited, ...rest } = news;
    return {
        ...rest,
        attachmentUrl: attachmentUrl,
        attachmentName: attachmentName,
        isUrgent: isUrgent,
        createdBy: createdBy,
        lastEdited: lastEdited,
    };
};


export const getNews = async (): Promise<NewsPostWithId[]> => {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error("Error fetching news from Supabase:", error);
        throw error;
    }
    return (data || []).map(fromSupabaseNews);
};

export const addNews = async (newsData: Omit<NewsPost, 'id' | 'attachments' | 'slug'>): Promise<string> => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");
    const slug = newsData.title_en.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const finalNewsData = toSupabaseNews({ ...newsData, slug });

     if (finalNewsData.isUrgent) {
        await supabase.from('news').update({ isUrgent: false }).eq('isUrgent', true);
    }

    const { data, error } = await supabase
        .from('news')
        .insert([finalNewsData])
        .select('id')
        .single();

    if (error) {
        console.error("Error adding news to Supabase:", error);
        throw error;
    }
    return data.id;
};

export const updateNews = async (id: string, newsData: Partial<Omit<NewsPost, 'id' | 'attachments'>>) => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");
     if (newsData.isUrgent) {
        await supabase.from('news').update({ isUrgent: false }).neq('id', id);
    }
    const { error } = await supabase
        .from('news')
        .update(toSupabaseNews(newsData))
        .eq('id', id);
    
    if (error) {
        console.error("Error updating news in Supabase:", error);
        throw error;
    }
};

export const deleteNews = async (id: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting news from Supabase:", error);
        throw error;
    }
};

export const getPaginatedNews = async (limitNum = 20, lastDoc?: any): Promise<{ data: NewsPostWithId[], lastDoc?: any }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: [], lastDoc: undefined };
    const page = lastDoc ? lastDoc.page + 1 : 0;
    const from = page * limitNum;
    const to = from + limitNum - 1;

    const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false })
        .range(from, to);

    if (error) {
        console.error("Error fetching paginated news from Supabase:", error);
        throw error;
    }

    const nextLastDoc = data && data.length === limitNum ? { page } : undefined;

    return { data: (data || []).map(fromSupabaseNews), lastDoc: nextLastDoc };
};


// === CALENDAR ===
export const getCalendarEvents = async (): Promise<CalendarEventWithId[]> => notImplemented();
export const addCalendarEvent = async (eventData: Omit<CalendarEvent, 'id' | 'attachments'>, crossPost: boolean) => notImplemented();
export const updateCalendarEvent = async (id: string, eventData: Partial<Omit<CalendarEvent, 'id' | 'attachments'>>, crossPost: boolean) => notImplemented();
export const deleteCalendarEvent = async (id: string) => notImplemented();
export const getPaginatedCalendarEvents = async (limitNum = 20, lastDoc?: QueryDocumentSnapshot): Promise<{ data: CalendarEventWithId[], lastDoc?: any }> => notImplemented();

// === STAFF ===
const fromSupabaseStaff = (staff: any): StaffMemberWithId => {
    if (!staff) return staff;
    return {
        ...staff,
        photoUrl: staff.photo_url,
    };
};

const toSupabaseStaff = (staff: Partial<StaffMember>) => {
    const { photoUrl, ...rest } = staff;
    return {
        ...rest,
        photo_url: photoUrl,
    };
};

export const getStaff = async (): Promise<StaffMemberWithId[]> => {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error("Error fetching staff from Supabase:", error);
        throw error;
    }
    return (data || []).map(fromSupabaseStaff);
};

export const addStaffMember = async (staffData: StaffMember) => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");

    const { error } = await supabase
        .from('staff')
        .insert([toSupabaseStaff(staffData)]);

    if (error) {
        console.error("Error adding staff member to Supabase:", error);
        throw error;
    }
};

export const updateStaffMember = async (id: string, staffData: Partial<StaffMember>) => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");

    const { error } = await supabase
        .from('staff')
        .update(toSupabaseStaff(staffData))
        .eq('id', id);

    if (error) {
        console.error("Error updating staff member in Supabase:", error);
        throw error;
    }
};

export const deleteStaffMember = async (id: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");

    const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting staff member from Supabase:", error);
        throw error;
    }
};

export const getPaginatedStaff = async (limitNum = 20, lastDoc?: any): Promise<{ data: StaffMemberWithId[], lastDoc?: any }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: [], lastDoc: undefined };

    const page = lastDoc ? lastDoc.page + 1 : 0;
    const from = page * limitNum;
    const to = from + limitNum - 1;

    const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name', { ascending: true })
        .range(from, to);

    if (error) {
        console.error("Error fetching paginated staff from Supabase:", error);
        throw error;
    }

    const nextLastDoc = data && data.length === limitNum ? { page } : undefined;

    return { data: (data || []).map(fromSupabaseStaff), lastDoc: nextLastDoc };
};

// === DOCUMENTS ===
const fromSupabaseDocument = (doc: any): DocumentWithId => {
    if (!doc) return doc;
    return {
        ...doc,
        fileUrl: doc.file_url,
        uploadedAt: doc.uploaded_at,
    };
};

const toSupabaseDocument = (doc: Partial<Document>) => {
    const { fileUrl, uploadedAt, ...rest } = doc;
    return {
        ...rest,
        file_url: fileUrl,
        uploaded_at: uploadedAt,
    };
};

export const getDocuments = async (): Promise<DocumentWithId[]> => {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

    if (error) {
        console.error("Error fetching documents from Supabase:", error);
        throw error;
    }
    return (data || []).map(fromSupabaseDocument);
};

export const addDocument = async (docData: Document) => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");

    const { error } = await supabase
        .from('documents')
        .insert([toSupabaseDocument(docData)]);

    if (error) {
        console.error("Error adding document to Supabase:", error);
        throw error;
    }
};

export const updateDocument = async (id: string, docData: Partial<Document>) => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");

    const { error } = await supabase
        .from('documents')
        .update(toSupabaseDocument(docData))
        .eq('id', id);

    if (error) {
        console.error("Error updating document in Supabase:", error);
        throw error;
    }
};

export const deleteDocument = async (id: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");

    const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting document from Supabase:", error);
        throw error;
    }
};

export const getPaginatedDocuments = async (limitNum = 20, lastDoc?: any): Promise<{ data: DocumentWithId[], lastDoc?: any }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: [], lastDoc: undefined };

    const page = lastDoc ? lastDoc.page + 1 : 0;
    const from = page * limitNum;
    const to = from + limitNum - 1;

    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error("Error fetching paginated documents from Supabase:", error);
        throw error;
    }

    const nextLastDoc = data && data.length === limitNum ? { page } : undefined;

    return { data: (data || []).map(fromSupabaseDocument), lastDoc: nextLastDoc };
};

// === PARENTS ===
export const getParents = async (): Promise<ParentWithId[]> => notImplemented();
export const addParent = async (parentData: Parent): Promise<string> => notImplemented();
export const updateParent = async (id: string, parentData: Partial<Parent>) => notImplemented();
export const deleteParent = async (id: string) => notImplemented();
export const getPaginatedParents = async (limitNum = 20, lastDoc?: QueryDocumentSnapshot): Promise<{ data: ParentWithId[], lastDoc?: any }> => notImplemented();

// === CHILDREN ===
export const getChildren = async (): Promise<ChildWithId[]> => notImplemented();
export const addChild = async (childData: Child) => notImplemented();
export const bulkAddChildren = async (childrenData: Child[]) => notImplemented();
export const updateChild = async (id: string, childData: Partial<Child>) => notImplemented();
export const deleteChild = async (id: string) => notImplemented();
export const promoteAllChildren = async (): Promise<void> => notImplemented();
export const bulkUpdateChildren = async (ids: string[], data: Partial<Child>) => notImplemented();
export const getPaginatedChildren = async (limitNum = 20, lastDoc?: QueryDocumentSnapshot): Promise<{ data: ChildWithId[], lastDoc?: any }> => notImplemented();
export const getPhotosForYearGroups = async (yearGroups: string[]): Promise<PhotoWithId[]> => notImplemented();


// === SITE SETTINGS ===
export const getSiteSettings = async (): Promise<SiteSettings | null> => notImplemented();
export const updateSiteSettings = async (settings: SiteSettings) => notImplemented();

// === LUNCH MENU SETTINGS ===
export const getWeeklyMenu = async (): Promise<WeeklyMenu | null> => notImplemented();
export const updateWeeklyMenu = async (menu: WeeklyMenu) => notImplemented();

// === INBOX ===
export const addInboxMessage = async (messageData: InboxMessage) => notImplemented();
export const getInboxMessages = async (): Promise<InboxMessageWithId[]> => notImplemented();
export const updateInboxMessage = async (id: string, data: Partial<InboxMessage>) => notImplemented();
export const deleteInboxMessage = async (id: string) => notImplemented();
export const getUnreadMessageCount = async (): Promise<number> => notImplemented();

// === GALLERY ===
export const addPhoto = async (photoData: Photo): Promise<string> => notImplemented();
export const deletePhoto = async (id: string) => notImplemented();
export const getPaginatedPhotos = async (limitNum = 20, lastDoc?: any): Promise<{ data: PhotoWithId[], lastDoc?: any }> => notImplemented();

// === UTILITIES ===
export const getCollectionCount = async (collectionName: string): Promise<number> => {
    const supabase = getSupabaseClient();
    if (!supabase) return 0;
    const { count, error } = await supabase
        .from(collectionName)
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error(`Error getting count for ${collectionName}:`, error);
        // This is a bit of a hack for development when tables don't exist yet
        if (process.env.NODE_ENV !== 'production' && error.code === '42P01') {
            return 0;
        }
        throw error;
    }
    return count || 0;
};
