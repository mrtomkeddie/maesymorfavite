
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, UploadTaskSnapshot } from "firebase/storage";
import { storage } from "./config";

// Upload a file to a specified path in Firebase Storage with progress tracking
export const uploadFile = (file: File, path: string, onProgress: (progress: number) => void): Promise<string> => {
    if (!file) {
        return Promise.reject(new Error("No file provided for upload."));
    }
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot: UploadTaskSnapshot) => {
                // Observe state change events such as progress, pause, and resume
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                // Handle unsuccessful uploads
                console.error("Upload failed:", error);
                reject(error);
            },
            () => {
                // Handle successful uploads on complete
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
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
