import { FileType, FileSystemItem, CommandCategory } from './types';
import { Settings, Zap, Brain, PenTool, Info } from 'lucide-react';
import React from 'react';

export const INITIAL_FILE_SYSTEM: FileSystemItem[] = [
  {
    id: 'root',
    name: 'Macintosh HD',
    type: FileType.VOLUME,
    dateModified: '28 Oct 2025 at 21:21',
    size: '587,84 GB',
    kind: 'Startup Volume',
    parentId: null,
    children: [
      {
        id: 'users',
        name: 'Users',
        type: FileType.FOLDER,
        dateModified: '28 Oct 2025',
        kind: 'Folder',
        parentId: 'root',
        children: [
          {
            id: 'enzo',
            name: 'Enzo',
            type: FileType.FOLDER,
            dateModified: 'Today',
            kind: 'Folder',
            parentId: 'users',
            children: [
              { id: 'doc1', name: 'Project_Alpha_Notes.txt', type: FileType.FILE, size: '4 KB', dateModified: 'Today', kind: 'Text Document', parentId: 'enzo' },
              { id: 'vid1', name: 'ScreenRecording_2025.mp4', type: FileType.FILE, size: '125 MB', dateModified: 'Yesterday', kind: 'MPEG-4 Movie', parentId: 'enzo' },
              { id: 'img1', name: 'Screenshot.png', type: FileType.FILE, size: '2.3 MB', dateModified: 'Yesterday', kind: 'PNG Image', parentId: 'enzo' },
              { id: 'app1', name: 'Substage.app', type: FileType.APP, size: '45 MB', dateModified: 'Today', kind: 'Application', parentId: 'enzo' },
            ]
          }
        ]
      },
      {
        id: 'applications',
        name: 'Applications',
        type: FileType.FOLDER,
        dateModified: '20 Oct 2025',
        kind: 'Folder',
        parentId: 'root',
        children: []
      }
    ]
  },
  {
    id: 'network',
    name: 'Network',
    type: FileType.VOLUME,
    dateModified: '--',
    kind: 'Neighborhood',
    parentId: null,
    children: []
  }
];

export const SETTINGS_TABS = [
  { id: 'general', label: 'General', icon: <Settings size={18} /> },
  { id: 'autorun', label: 'Auto-run', icon: <Zap size={18} /> },
  { id: 'models', label: 'AI Models', icon: <Brain size={18} /> },
  { id: 'tools', label: 'Extra tools', icon: <PenTool size={18} /> },
  { id: 'about', label: 'About', icon: <Info size={18} /> },
];

export const MOCK_SIDEBAR_ITEMS = [
  { icon: 'clock', label: 'Recents' },
  { icon: 'folder-shared', label: 'Shared' },
  { icon: 'app', label: 'Applications' },
  { icon: 'desktop', label: 'Desktop' },
  { icon: 'file-text', label: 'Documents' },
  { icon: 'download', label: 'Downloads' },
  { icon: 'image', label: 'Pictures' },
  { icon: 'film', label: 'Movies' },
  { icon: 'music', label: 'Music' },
];

export const CATEGORY_LABELS: Record<CommandCategory, string> = {
  [CommandCategory.HARMLESS]: 'Harmless commands',
  [CommandCategory.CREATE]: 'Create new files',
  [CommandCategory.RENAME]: 'Rename files',
  [CommandCategory.MOVE]: 'Move files', 
  [CommandCategory.DELETE]: 'Move items to Trash',
  [CommandCategory.MODIFY]: 'Modify files',
  [CommandCategory.UNKNOWN]: 'Run unknown scripts',
};

export const EXTRA_TOOLS = [
    { name: 'FFmpeg', desc: 'Video and audio processing tools', status: 'installed', license: 'LGPL v2.1+' },
    { name: 'Ghostscript', desc: 'PDF rendering and conversion', status: 'installed', license: 'AGPL Licence v3' },
    { name: 'ImageMagick', desc: 'Image processing tools', status: 'available', license: 'Apache Licence v2' },
    { name: 'QPDF', desc: 'PDF splitting, merging, and encryption', status: 'available', license: 'Apache License v2' },
    { name: 'Pandoc', desc: 'Versatile converter for markdown, LaTeX, HTML', status: 'available', license: 'GPL Licence v2' },
    { name: 'Poppler', desc: 'Extract text, images, and info from PDFs', status: 'available', license: 'GPL License v2' },
    { name: 'Gifsicle', desc: 'Create, edit, and optimize GIFs', status: 'available', license: 'GPL' },
];

export const AI_MODELS = [
    { id: 'gpt-5-mini', name: 'GPT-5 mini', desc: 'Can be very slow, but gives good results, from OpenAI.', type: 'online' },
    { id: 'gpt-5-nano', name: 'GPT-5 nano', desc: 'Super fast, good for summarisation but not ideal for general usage.', type: 'online' },
    { id: 'gpt-4.1-mini', name: 'GPT-4.1 mini', desc: 'Perfect for general usage: Fast, yet great accuracy, from OpenAI.', type: 'online', default: true },
    { id: 'gpt-4.1-nano', name: 'GPT-4.1 nano', desc: 'Super fast, good for summarisation but not ideal for general usage.', type: 'online' },
    { id: 'llama-3', name: 'Llama 3 (8B)', desc: 'Local • Offline • Requires 8GB RAM', type: 'local', installed: true },
    { id: 'mistral-7b', name: 'Mistral (7B)', desc: 'Local • Offline • Fast', type: 'local', installed: false },
];