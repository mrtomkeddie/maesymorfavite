
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, setDoc } from "firebase/firestore"; 
import { db } from "./config";
import type { NewsPost } from "@/lib/mockNews";
import type { CalendarEvent } from "@/lib/mockCalendar";

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
export const addNews = async (newsData: Omit<NewsPost, 'id'>) => {
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
export const updateNews = async (id: string, newsData: Partial<Omit<NewsPost, 'id'>>) => {
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
export const addCalendarEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    await addDoc(calendarCollection, eventData);
};

// Update an existing calendar event
export const updateCalendarEvent = async (id: string, eventData: Partial<Omit<CalendarEvent, 'id'>>) => {
    const eventDoc = doc(db, "calendar", id);
    await updateDoc(eventDoc, eventData);
};

// Delete a calendar event
export const deleteCalendarEvent = async (id: string) => {
    const eventDoc = doc(db, "calendar", id);
    await deleteDoc(eventDoc);
};
