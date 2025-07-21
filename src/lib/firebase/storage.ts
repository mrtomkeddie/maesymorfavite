
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./config";

// Upload a file to a specified path in Firebase Storage
export const uploadFile = async (file: File, path: string): Promise<string> => {
    if (!file) {
        throw new Error("No file provided for upload.");
    }
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
};

// Delete a file from Firebase Storage using its download URL
export const deleteFile = async (downloadUrl: string): Promise<void> => {
    if (!downloadUrl) {
        console.warn("No download URL provided for deletion. Skipping.");
        return;
    }
    try {
        const fileRef = ref(storage, downloadUrl);
        await deleteObject(fileRef);
    } catch (error: any) {
        // It's possible the file doesn't exist, which is fine.
        if (error.code === 'storage/object-not-found') {
            console.warn(`File not found for deletion at ${downloadUrl}. It might have been already deleted.`);
        } else {
            console.error("Error deleting file from storage:", error);
            throw error;
        }
    }
};
