// src/store/modules/videoediting/resourceStore.ts
import { ref } from 'vue';
import { defineStore } from 'pinia';
import {
  addFileToDB,
  getFileFromDB,
  deleteFileFromDB,
  FileMetadata,
  initDB,
  getAllFilesFromDB
} from '@/indexedDB/video-editing-resources-db';
import { getMD5 } from '@/class/Base';

export const useResourceStore = defineStore('resourceStore', () => {
  const fileList = ref<FileMetadata[]>([]);

  // 初始化 IndexedDB 并加载数据
  initDB().then(async () => {
    console.log('IndexedDB initialized');
    try {
      const files = await getAllFilesFromDB();
      fileList.value = files;
      console.log('fileList loaded from indexedDB');
    } catch (error) {
      console.error('Error loading video files from indexedDB:', error);
    }
  });


  const addVideoFile = async (file: File, thumbnail: string) => {
    const id = await getMD5(await file.arrayBuffer());

    try {
      await addFileToDB(id, file, thumbnail);

      fileList.value.push({
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        thumbnail
      });
    } catch (error) {
      console.error('Error adding video file:', error);
    }
  };

  const getVideoFile = async (id: string): Promise<File> => {
    try {
      const storedFile = await getFileFromDB(id);
      return storedFile.file;
    } catch (error) {
      console.error('Error getting video file:', error);
      throw error;
    }
  };

  const deleteVideoFile = async (id: string) => {
    try {
      await deleteFileFromDB(id);
      const index = fileList.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        fileList.value.splice(index, 1);
      }
    } catch (error) {
      console.error('Error deleting video file:', error);
    }
  };

  return {
    fileList,
    addVideoFile,
    getVideoFile,
    deleteVideoFile,
  };
});