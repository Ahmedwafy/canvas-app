const DB_NAME = "videoDB";
const STORE_NAME = "videos";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveVideoBlob(videoId: string, file: File) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put(file, videoId);
  await tx.done;
}

export async function getVideoBlobURL(videoId: string): Promise<string | null> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve) => {
    const request = store.get(videoId);
    request.onsuccess = () => {
      const blob = request.result as Blob;
      if (blob) {
        const url = URL.createObjectURL(blob);
        resolve(url);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => resolve(null);
  });
}
