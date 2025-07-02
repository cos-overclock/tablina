import { invoke } from '@tauri-apps/api/core';

export interface FileInfo {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  modified: string;
}

export interface DirectoryContents {
  files: FileInfo[];
  path: string;
}

export class FileSystemAPI {
  static async listDirectory(path: string): Promise<DirectoryContents> {
    try {
      return await invoke('list_directory', { path });
    } catch (error) {
      console.error('Failed to list directory:', error);
      throw error;
    }
  }

  static async createDirectory(path: string): Promise<void> {
    try {
      await invoke('create_directory', { path });
    } catch (error) {
      console.error('Failed to create directory:', error);
      throw error;
    }
  }

  static async deleteFile(path: string): Promise<void> {
    try {
      await invoke('delete_file', { path });
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }

  static async copyFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      await invoke('copy_file', { sourcePath, destPath });
    } catch (error) {
      console.error('Failed to copy file:', error);
      throw error;
    }
  }

  static async moveFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      await invoke('move_file', { sourcePath, destPath });
    } catch (error) {
      console.error('Failed to move file:', error);
      throw error;
    }
  }

  static async renameFile(path: string, newName: string): Promise<void> {
    try {
      await invoke('rename_file', { path, newName });
    } catch (error) {
      console.error('Failed to rename file:', error);
      throw error;
    }
  }
}