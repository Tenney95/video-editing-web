// src/indexedDB/ResourcesDB.ts

const DB_NAME = 'ResourcesDB';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'Files';

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  duration?: number;
  thumbnail?: string;
}

interface StoredFile {
  id: string;
  file: File;
  thumbnail: string;
}

let db: IDBDatabase | undefined; // 修改为 undefined

export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const addFileToDB = (id: string, file: File, thumbnail: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([OBJECT_STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
    const request = objectStore.put({ id, file, thumbnail });

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to add file to database'));
    };
  });
};

export const getFileFromDB = (id: string): Promise<StoredFile> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([OBJECT_STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
    const request = objectStore.get(id);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result);
      } else {
        reject(new Error('File not found in database'));
      }
    };

    request.onerror = () => {
      reject(new Error('Failed to get file from database'));
    };
  });
};

export const deleteFileFromDB = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([OBJECT_STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
    const request = objectStore.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to delete file from database'));
    };
  });
};

export const getAllFilesFromDB = (): Promise<FileMetadata[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([OBJECT_STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      const storedFiles = request.result as { id: string, file: File, thumbnail: string }[];
      if (storedFiles && storedFiles.length > 0) {
        const Files = storedFiles.map(storedFile => ({
          id: storedFile.id,
          name: storedFile.file.name,
          size: storedFile.file.size,
          type: storedFile.file.type,
          thumbnail: storedFile.thumbnail
        }));
        resolve(Files)
      } else {
        resolve([])
      }
    };

    request.onerror = () => {
      reject(new Error('Failed to get all files from database'));
    };
  });
};