import React from 'react';

export enum FileType {
  FOLDER = 'folder',
  FILE = 'file',
  APP = 'app',
  VOLUME = 'volume'
}

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  size?: string;
  dateModified: string;
  kind: string;
  children?: FileSystemItem[]; // For folders
  parentId?: string | null;
}

export enum CommandCategory {
  HARMLESS = 'harmless',
  CREATE = 'create',
  RENAME = 'rename',
  MOVE = 'move',
  DELETE = 'delete',
  MODIFY = 'modify',
  UNKNOWN = 'unknown'
}

export interface GeneratedCommand {
  command: string;
  category: CommandCategory;
  explanation: string;
}

export interface AutoRunSettings {
  harmless: boolean;
  create: boolean;
  rename: boolean;
  move: boolean;
  delete: boolean;
  modify: boolean;
}

export interface SettingsTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}