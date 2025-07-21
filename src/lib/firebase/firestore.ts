

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, setDoc, writeBatch, where } from "firebase/firestore"; 
import { db } from "./config";
import type { NewsPost } from "@/lib/mockNews";
import type { CalendarEvent } from "@/lib/mockCalendar";
import type { StaffMember, StaffMemberWithId, Document, DocumentWithId, Parent, ParentWithId, Child, ChildWithId } from "@/lib/types";
import { yearGroups } from "@/components/admin/ChildForm";

// === NEWS ===

// Define a type that includes the document ID
export type NewsPostWithId = NewsPost & { id: string };

const newsCollection = collection(db, "news");

// Get all news posts, ordered by date descending
export const getNews = async (): Promise<NewsPostWithId[]> => {
    const q = query(newsCollection, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as NewsPost, id: doc.id }));
};

// Add a new news post
export const addNews = async (newsData: Omit<NewsPost, 'id' | 'attachments'>) => {
    // If a new post is marked as urgent, unmark all others
    if (newsData.isUrgent) {
        const allNews = await getNews();
        for (const post of allNews) {
            if (post.isUrgent) {
                await updateDoc(doc(db, "news", post.id), { isUrgent: false });
            }
        }
    }
    await addDoc(newsCollection, newsData);
};

// Update an existing news post
export const updateNews = async (id: string, newsData: Partial<Omit<NewsPost, 'id' | 'attachments'>>) => {
    // If this post is being marked as urgent, unmark all others
    if (newsData.isUrgent) {
        const allNews = await getNews();
        for (const post of allNews) {
            if (post.isUrgent && post.id !== id) {
                await updateDoc(doc(db, "news", post.id), { isUrgent: false });
            }
        }
    }
    const newsDoc = doc(db, "news", id);
    await updateDoc(newsDoc, newsData);
};

// Delete a news post
export const deleteNews = async (id: string) => {
    const newsDoc = doc(db, "news", id);
    await deleteDoc(newsDoc);
};


// === CALENDAR ===

export type CalendarEventWithId = CalendarEvent & { id: string };

const calendarCollection = collection(db, "calendar");

// Get all calendar events, ordered by start date ascending
export const getCalendarEvents = async (): Promise<CalendarEventWithId[]> => {
    const q = query(calendarCollection, orderBy("start", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as CalendarEvent, id: doc.id }));
};

// Add a new calendar event
export const addCalendarEvent = async (eventData: Omit<CalendarEvent, 'id' | 'attachments'>) => {
    await addDoc(calendarCollection, eventData);
};

// Update an existing calendar event
export const updateCalendarEvent = async (id: string, eventData: Partial<Omit<CalendarEvent, 'id' | 'attachments'>>) => {
    const eventDoc = doc(db, "calendar", id);
    await updateDoc(eventDoc, eventData);
};

// Delete a calendar event
export const deleteCalendarEvent = async (id: string) => {
    const eventDoc = doc(db, "calendar", id);
    await deleteDoc(eventDoc);
};


// === STAFF ===
const staffCollection = collection(db, "staff");

// Get all staff members, ordered by name
export const getStaff = async (): Promise<StaffMemberWithId[]> => {
    const q = query(staffCollection, orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as StaffMember, id: doc.id }));
}

// Add a new staff member
export const addStaffMember = async (staffData: StaffMember) => {
    await addDoc(staffCollection, staffData);
};

// Update an existing staff member
export const updateStaffMember = async (id: string, staffData: Partial<StaffMember>) => {
    const staffDoc = doc(db, "staff", id);
    await updateDoc(staffDoc, staffData);
}

// Delete a staff member
export const deleteStaffMember = async (id: string) => {
    const staffDoc = doc(db, "staff", id);
    await deleteDoc(staffDoc);
}


// === DOCUMENTS ===
const documentsCollection = collection(db, "documents");

// Get all documents, ordered by upload date descending
export const getDocuments = async (): Promise<DocumentWithId[]> => {
    const q = query(documentsCollection, orderBy("uploadedAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as Document, id: doc.id }));
}

// Add a new document
export const addDocument = async (docData: Document) => {
    await addDoc(documentsCollection, docData);
}

// Update an existing document
export const updateDocument = async (id: string, docData: Partial<Document>) => {
    const documentDoc = doc(db, "documents", id);
    await updateDoc(documentDoc, docData);
}

// Delete a document
export const deleteDocument = async (id: string) => {
    const documentDoc = doc(db, "documents", id);
    await deleteDoc(documentDoc);
}


// === PARENTS ===
const parentsCollection = collection(db, "parents");

export const getParents = async (): Promise<ParentWithId[]> => {
    const q = query(parentsCollection, orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as Parent, id: doc.id }));
}

export const addParent = async (parentData: Parent): Promise<string> => {
    const docRef = await addDoc(parentsCollection, parentData);
    return docRef.id;
}

export const updateParent = async (id: string, parentData: Partial<Parent>) => {
    const parentDoc = doc(db, "parents", id);
    await updateDoc(parentDoc, parentData);
}

export const deleteParent = async (id: string) => {
    const parentDoc = doc(db, "parents", id);
    // Unlink children before deleting parent
    const childrenToUnlinkQuery = query(collection(db, 'children'), where('parentId', '==', id));
    const childrenToUnlinkSnapshot = await getDocs(childrenToUnlinkQuery);
    
    const batch = writeBatch(db);
    childrenToUnlinkSnapshot.forEach(childDoc => {
        batch.update(childDoc.ref, { parentId: '' });
    });
    
    await batch.commit();
    await deleteDoc(parentDoc);
}


// === CHILDREN ===
const childrenCollection = collection(db, "children");

export const getChildren = async (): Promise<ChildWithId[]> => {
    const q = query(childrenCollection, orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as Child, id: doc.id }));
}

export const addChild = async (childData: Child) => {
    await addDoc(childrenCollection, childData);
}

export const updateChild = async (id: string, childData: Partial<Child>) => {
    const childDoc = doc(db, "children", id);
    await updateDoc(childDoc, childData);
}

export const deleteChild = async (id: string) => {
    const childDoc = doc(db, "children", id);
    await deleteDoc(childDoc);
}

export const promoteAllChildren = async (): Promise<void> => {
    const childrenSnapshot = await getDocs(childrenCollection);
    const batch = writeBatch(db);

    const year6 = yearGroups[yearGroups.length - 1];
    const leaversYear = new Date().getFullYear() + 1;
    const archiveLabel = `Archived/Leavers ${leaversYear}`;

    childrenSnapshot.forEach(document => {
        const child = document.data() as Child;
        const currentYearIndex = yearGroups.indexOf(child.yearGroup);

        if (child.yearGroup === year6) {
            // Archive Year 6 students
            const childRef = doc(db, "children", document.id);
            batch.update(childRef, { yearGroup: archiveLabel });
        } else if (currentYearIndex > -1) {
            // Promote all other students
            const nextYearGroup = yearGroups[currentYearIndex + 1];
            const childRef = doc(db, "children", document.id);
            batch.update(childRef, { yearGroup: nextYearGroup });
        }
    });

    await batch.commit();
}
