// Generic, provider-agnostic storage helpers
// In dummy mode (default), files are converted to Data URLs and progress is simulated via FileReader events.
// If you later wire up Supabase Storage, you can replace the internals here without touching components.

export type UploadProgressCallback = (progress: number) => void;

export async function uploadFile(
  file: File,
  path: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // Dummy implementation: read as Data URL so it can be displayed immediately in dev/mock mode.
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onloadstart = () => {
        if (onProgress) onProgress(0);
      };
      reader.onprogress = (ev) => {
        if (onProgress && ev.lengthComputable) {
          const pct = Math.round((ev.loaded / ev.total) * 100);
          onProgress(pct);
        }
      };
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(reader.error || new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      reject(err);
    }
  });
}

export async function deleteFile(downloadUrl: string): Promise<void> {
  // Dummy implementation: nothing to delete in Data URL mode.
  // Kept for API compatibility. In a real storage provider, delete by key/path here.
  return Promise.resolve();
}