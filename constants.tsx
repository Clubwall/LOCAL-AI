
import { FileType, FileSystemItem, CommandCategory, ToolItem, OfflineModelItem } from './types';
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

export const INITIAL_EXTRA_TOOLS: ToolItem[] = [
    { id: 'ffmpeg', name: 'FFmpeg', desc: 'Video and audio processing tools', status: 'available', license: 'LGPL v2.1+' },
    { id: 'ghostscript', name: 'Ghostscript', desc: 'PDF rendering and conversion', status: 'available', license: 'AGPL Licence v3' },
    { id: 'imagemagick', name: 'ImageMagick', desc: 'Image processing tools', status: 'available', license: 'Apache Licence v2' },
    { id: 'qpdf', name: 'QPDF', desc: 'PDF splitting, merging, and encryption', status: 'available', license: 'Apache License v2' },
    { id: 'pandoc', name: 'Pandoc', desc: 'Versatile converter for markdown, LaTeX, HTML', status: 'available', license: 'GPL Licence v2' },
    { id: 'poppler', name: 'Poppler', desc: 'Extract text, images, and info from PDFs', status: 'available', license: 'GPL License v2' },
    { id: 'gifsicle', name: 'Gifsicle', desc: 'Create, edit, and optimize GIFs', status: 'available', license: 'GPL' },
];

export const ONLINE_AI_PROVIDERS = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', desc: 'Flagship high-intelligence' },
      { id: 'gpt-4o-mini', name: 'GPT-4o mini', desc: 'Fast, affordable' }
    ]
  },
  { 
    id: 'google', 
    name: 'Google Gemini', 
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: 'Mid-size multimodal' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', desc: 'Fast and efficient' }
    ]
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    models: [
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', desc: 'High intelligence & speed' },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', desc: 'Fastest Claude model' }
    ]
  },
  { 
    id: 'groq', 
    name: 'Groq Cloud', 
    models: [
      { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', desc: 'Cloud hosted open model' },
      { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', desc: 'High speed MoE' }
    ]
  }
];

export const INITIAL_OFFLINE_AI_MODELS: OfflineModelItem[] = [
  { id: 'llama3.2', name: 'Llama 3.2', desc: 'Meta • 3B params', size: '2.4 GB', status: 'available' },
  { id: 'llama3.1', name: 'Llama 3.1', desc: 'Meta • 8B params', size: '4.7 GB', status: 'available' },
  { id: 'gemma2', name: 'Gemma 2', desc: 'Google • 9B params', size: '5.1 GB', status: 'available' },
  { id: 'mistral', name: 'Mistral', desc: 'Mistral AI • 7B', size: '4.1 GB', status: 'available' },
  { id: 'phi3', name: 'Phi-3', desc: 'Microsoft • 3.8B', size: '2.3 GB', status: 'available' },
  { id: 'qwen2.5', name: 'Qwen 2.5', desc: 'Alibaba • 7B', size: '4.2 GB', status: 'available' },
  { id: 'codellama', name: 'Code Llama', desc: 'Meta • Code specialized', size: '3.8 GB', status: 'available' },
  { id: 'neural-chat', name: 'Neural Chat', desc: 'Intel • 7B', size: '4.1 GB', status: 'available' },
  { id: 'vicuna', name: 'Vicuna', desc: 'LMSYS • 7B', size: '4.0 GB', status: 'available' },
];