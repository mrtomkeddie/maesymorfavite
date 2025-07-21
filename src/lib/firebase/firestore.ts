
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, setDoc } from "firebase/firestore"; 
import { db } from "./config";
import type { NewsPost } from "@/lib/mockNews";

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
export const addNews = async (newsData: NewsPost) => {
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
export const updateNews = async (id: string, newsData: Partial<NewsPost>) => {
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
