

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, setDoc, writeBatch, where, getDoc, limit, startAfter, count, getCountFromServer } from "firebase/firestore"; 
import { db } from "../firebase/config";
import type { NewsPost } from "@/lib/mockNews";
import type { CalendarEvent } from "@/lib/mockCalendar";
import type { StaffMember, StaffMemberWithId, Document, DocumentWithId, Parent, ParentWithId, Child, ChildWithId, SiteSettings, LinkedParent, InboxMessage, InboxMessageWithId, Photo, PhotoWithId, DailyMenu, WeeklyMenu, UserWithRole, UserRole } from "@/lib/types";
import { yearGroups } from "@/components/admin/ChildForm";
import { QueryDocumentSnapshot } from "firebase/firestore";

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
export const addNews = async (newsData: Omit<NewsPost, 'id' | 'attachments' | 'slug'>): Promise<string> => {
    // If a new post is marked as urgent, unmark all others
    if (newsData.isUrgent) {
        const allNews = await getNews();
        for (const post of allNews) {
            if (post.isUrgent) {
                await updateDoc(doc(db, "news", post.id), { isUrgent: false });
            }
        }
    }
    const slug = newsData.title_en.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const docRef = await addDoc(newsCollection, {...newsData, slug});
    return docRef.id;
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

const generateNewsDataFromEvent = (eventData: Omit<CalendarEvent, 'id' | 'attachments'>): Omit<NewsPost, 'id' | 'slug' | 'attachments'> => {
    return {
        title_en: `${eventData.title_en} (Event)` as string,
        title_cy: `${eventData.title_cy} (Digwyddiad)` as string,
        body_en: eventData.description_en || '',
        body_cy: eventData.description_cy || '',
        date: eventData.start,
        category: 'Event',
        isUrgent: eventData.isUrgent || false,
        attachmentUrl: eventData.attachmentUrl,
        attachmentName: eventData.attachmentName,
        published: true,
        createdBy: 'admin@example.com', // Or dynamically get current user
        lastEdited: new Date().toISOString(),
    };
}


// Get all calendar events, ordered by start date ascending
export const getCalendarEvents = async (): Promise<CalendarEventWithId[]> => {
    const q = query(calendarCollection, orderBy("start", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as CalendarEvent, id: doc.id }));
};

// Add a new calendar event
export const addCalendarEvent = async (eventData: Omit<CalendarEvent, 'id' | 'attachments'>, crossPost: boolean) => {
    let finalEventData = { ...eventData };

    if (crossPost) {
        const newsData = generateNewsDataFromEvent(eventData);
        const newsId = await addNews(newsData);
        finalEventData.linkedNewsPostId = newsId;
    }
    await addDoc(calendarCollection, finalEventData);
};

// Update an existing calendar event
export const updateCalendarEvent = async (id: string, eventData: Partial<Omit<CalendarEvent, 'id' | 'attachments'>>, crossPost: boolean) => {
    const eventDoc = doc(db, "calendar", id);
    let finalEventData = { ...eventData };

    if (crossPost) {
        const newsData = generateNewsDataFromEvent(eventData as Omit<CalendarEvent, 'id' | 'attachments'>);
        if (finalEventData.linkedNewsPostId) {
            // Update existing news post
            await updateNews(finalEventData.linkedNewsPostId, newsData);
        } else {
            // Create new news post and link it
            const newsId = await addNews(newsData);
            finalEventData.linkedNewsPostId = newsId;
        }
    }
    // (Future improvement: Handle unchecking the box to delete/unlink news post)

    await updateDoc(eventDoc, finalEventData);
};


// Delete a calendar event
export const deleteCalendarEvent = async (id: string) => {
    const eventDocRef = doc(db, "calendar", id);
    // TODO: Add logic to optionally delete linked news post
    await deleteDoc(eventDocRef);
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
    const parentDocRef = doc(db, "parents", id);
    
    // Find all children linked to this parent
    const allChildren = await getChildren();
    const childrenToUpdate = allChildren.filter(c => c.linkedParents?.some(lp => lp.parentId === id));

    const batch = writeBatch(db);
    
    // For each child, remove the parent from their linkedParents array
    childrenToUpdate.forEach(child => {
        const childRef = doc(db, "children", child.id);
        const updatedLinkedParents = child.linkedParents?.filter(lp => lp.parentId !== id);
        batch.update(childRef, { linkedParents: updatedLinkedParents });
    });

    await batch.commit();

    // Now delete the parent document
    await deleteDoc(parentDocRef);
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

export const bulkAddChildren = async (childrenData: Child[]) => {
    const batch = writeBatch(db);
    childrenData.forEach(child => {
        const newChildRef = doc(childrenCollection);
        batch.set(newChildRef, child);
    });
    await batch.commit();
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

export const bulkUpdateChildren = async (ids: string[], data: Partial<Child>) => {
    const batch = writeBatch(db);
    ids.forEach(id => {
        const childRef = doc(db, "children", id);
        batch.update(childRef, data);
    });
    await batch.commit();
};


// === SITE SETTINGS ===
const settingsDocRef = doc(db, "settings", "site");

export const getSiteSettings = async (): Promise<SiteSettings | null> => {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        // Ensure all possible fields are initialized to prevent uncontrolled->controlled switch in React
        return {
            address: data.address || "Ysgol Maes Y Morfa,\nOlive St,\nLlanelli\nSA15 2AP",
            phone: data.phone || "01554 772945",
            email: data.email || "admin@maesymorfa.cymru",
            facebookUrl: data.facebookUrl || '',
            twitterUrl: data.twitterUrl || '',
            instagramUrl: data.instagramUrl || '',
            youtubeUrl: data.youtubeUrl || '',
        };
    } else {
        // Return default values if document doesn't exist
        return {
            address: "Ysgol Maes Y Morfa,\nOlive St,\nLlanelli\nSA15 2AP",
            phone: "01554 772945",
            email: "admin@maesymorfa.cymru",
            facebookUrl: '',
            twitterUrl: '',
            instagramUrl: '',
            youtubeUrl: '',
        };
    }
};

export const updateSiteSettings = async (settings: SiteSettings) => {
    await setDoc(settingsDocRef, settings, { merge: true });
};

// === LUNCH MENU SETTINGS ===
const menuDocRef = doc(db, "settings", "weeklyMenu");

export const getWeeklyMenu = async (): Promise<WeeklyMenu | null> => {
    const docSnap = await getDoc(menuDocRef);
    if (docSnap.exists() && Object.keys(docSnap.data()).length > 0) {
        return docSnap.data() as WeeklyMenu;
    } else {
        // Return default dummy values if document doesn't exist or is empty
        return {
            monday: { main: "Shepherd's Pie", alt: "Jacket Potato with Beans", dessert: "Apple Crumble" },
            tuesday: { main: "Chicken Curry", alt: "Vegetable Lasagne", dessert: "Fruit Salad" },
            wednesday: { main: "Roast Beef Dinner", alt: "Quorn Roast Dinner", dessert: "Chocolate Sponge" },
            thursday: { main: "Spaghetti Bolognese", alt: "Vegetable Stir Fry", dessert: "Yoghurt" },
            friday: { main: "Fish and Chips", alt: "Veggie Sausages", dessert: "Flapjack" },
        };
    }
}

export const updateWeeklyMenu = async (menu: WeeklyMenu) => {
    await setDoc(menuDocRef, menu, { merge: true });
};


// === INBOX ===
const inboxCollection = collection(db, "inbox");

export const addInboxMessage = async (messageData: InboxMessage) => {
    await addDoc(inboxCollection, messageData);
};

export const getInboxMessages = async (): Promise<InboxMessageWithId[]> => {
    const q = query(inboxCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as InboxMessage, id: doc.id }));
}

export const updateInboxMessage = async (id: string, data: Partial<InboxMessage>) => {
    const messageDoc = doc(db, "inbox", id);
    await updateDoc(messageDoc, data);
}

export const deleteInboxMessage = async (id: string) => {
    const messageDoc = doc(db, "inbox", id);
    await deleteDoc(messageDoc);
}

export const getUnreadMessageCount = async (): Promise<number> => {
    const q = query(inboxCollection, where("isRead", "==", false));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
};


// === GALLERY ===
const photosCollection = collection(db, "photos");

export const addPhoto = async (photoData: Photo): Promise<string> => {
    const docRef = await addDoc(photosCollection, photoData);
    return docRef.id;
};

export const deletePhoto = async (id: string) => {
    const photoDoc = doc(db, "photos", id);
    await deleteDoc(photoDoc);
};

export const getPaginatedPhotos = async (limitNum = 20, lastDoc?: QueryDocumentSnapshot): Promise<{ data: PhotoWithId[], lastDoc?: QueryDocumentSnapshot }> => {
    let q = query(photosCollection, orderBy("uploadedAt", "desc"), limit(limitNum));
    if (lastDoc) q = query(photosCollection, orderBy("uploadedAt", "desc"), startAfter(lastDoc), limit(limitNum));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ ...doc.data() as Photo, id: doc.id }));
    return { data, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
};

export const getPhotosForYearGroups = async (yearGroups: string[]): Promise<PhotoWithId[]> => {
    const allGroups = ['All', ...yearGroups];
    const q = query(photosCollection, where('yearGroups', 'array-contains-any', allGroups));
    const querySnapshot = await getDocs(q);
    const photos = querySnapshot.docs.map(doc => ({ ...doc.data() as Photo, id: doc.id }));
    // Sort manually after fetching
    return photos.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
};


// === PAGINATED FETCH HELPERS ===

export const getPaginatedCalendarEvents = async (limitNum = 20, lastDoc?: QueryDocumentSnapshot): Promise<{ data: CalendarEventWithId[], lastDoc?: QueryDocumentSnapshot }> => {
    let q = query(calendarCollection, orderBy("start", "asc"), limit(limitNum));
    if (lastDoc) q = query(calendarCollection, orderBy("start", "asc"), startAfter(lastDoc), limit(limitNum));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ ...doc.data() as CalendarEvent, id: doc.id }));
    return { data, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
};

export const getPaginatedChildren = async (limitNum = 20, lastDoc?: QueryDocumentSnapshot): Promise<{ data: ChildWithId[], lastDoc?: QueryDocumentSnapshot }> => {
    let q = query(childrenCollection, orderBy("name", "asc"), limit(limitNum));
    if (lastDoc) q = query(childrenCollection, orderBy("name", "asc"), startAfter(lastDoc), limit(limitNum));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ ...doc.data() as Child, id: doc.id }));
    return { data, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
};

export const getPaginatedNews = async (limitNum = 20, lastDoc?: QueryDocumentSnapshot): Promise<{ data: NewsPostWithId[], lastDoc?: QueryDocumentSnapshot }> => {
    let q = query(newsCollection, orderBy("date", "desc"), limit(limitNum));
    if (lastDoc) q = query(newsCollection, orderBy("date", "desc"), startAfter(lastDoc), limit(limitNum));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ ...doc.data() as NewsPost, id: doc.id }));
    return { data, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
};

export const getPaginatedStaff = async (limitNum = 20, lastDoc?: QueryDocumentSnapshot): Promise<{ data: StaffMemberWithId[], lastDoc?: QueryDocumentSnapshot }> => {
    let q = query(staffCollection, orderBy("name", "asc"), limit(limitNum));
    if (lastDoc) q = query(staffCollection, orderBy("name", "asc"), startAfter(lastDoc), limit(limitNum));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ ...doc.data() as StaffMember, id: doc.id }));
    return { data, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
};

export const getPaginatedDocuments = async (limitNum = 20, lastDoc?: QueryDocumentSnapshot): Promise<{ data: DocumentWithId[], lastDoc?: QueryDocumentSnapshot }> => {
    let q = query(documentsCollection, orderBy("uploadedAt", "desc"), limit(limitNum));
    if (lastDoc) q = query(documentsCollection, orderBy("uploadedAt", "desc"), startAfter(lastDoc), limit(limitNum));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ ...doc.data() as Document, id: doc.id }));
    return { data, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
};

export const getPaginatedParents = async (limitNum = 20, lastDoc?: QueryDocumentSnapshot): Promise<{ data: ParentWithId[], lastDoc?: QueryDocumentSnapshot }> => {
    let q = query(parentsCollection, orderBy("name", "asc"), limit(limitNum));
    if (lastDoc) q = query(parentsCollection, orderBy("name", "asc"), startAfter(lastDoc), limit(limitNum));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ ...doc.data() as Parent, id: doc.id }));
    return { data, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
};

// === USER MANAGEMENT ===
// This file assumes a separate user_roles collection for Firebase.
// In Supabase, this would be handled differently (e.g., via a join or a view).
export const getUsersWithRoles = async (): Promise<UserWithRole[]> => {
    // This is a placeholder for Firebase. In a real Firebase implementation,
    // this would likely involve a Cloud Function to list auth users, as it's
    // not possible to do securely from the client-side SDK alone.
    // It also cannot query the 'auth' schema.
    console.warn("getUsersWithRoles is not implemented for Firebase and will return mock data.");
    return [
        { id: 'mock-admin-id', email: 'admin@example.com', role: 'admin', created_at: new Date().toISOString() },
        { id: 'mock-parent-id', email: 'parent@example.com', role: 'parent', created_at: new Date().toISOString() },
    ];
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
    // In Firebase, this would typically be handled by a Cloud Function that
    // sets a custom claim on the user's auth token. For a simple Firestore-only
    // approach, we manage roles in a separate collection.
    console.warn("updateUserRole is using a simplified Firestore implementation.");
    const userRoleDoc = doc(db, "user_roles", userId);
    await setDoc(userRoleDoc, { role: role }, { merge: true });
};


// === UTILITIES ===
export const getCollectionCount = async (collectionName: string): Promise<number> => {
    try {
        const coll = collection(db, collectionName);
        const snapshot = await getCountFromServer(coll);
        return snapshot.data().count;
    } catch (e) {
        console.error(`Failed to get count for ${collectionName}:`, e);
        // In a mock/dev environment, you might want to return a mock number
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            return Math.floor(Math.random() * 100);
        }
        throw e;
    }
}
