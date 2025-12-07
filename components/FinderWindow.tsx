import React from 'react';
import { 
  Folder, File, HardDrive, LayoutGrid, List, Columns, ChevronLeft, 
  ChevronRight, Search, Menu, Monitor, Download, Image, Film, Music,
  AppWindow, FileText, Clock, Wifi, Share2
} from 'lucide-react';
import { FileSystemItem, FileType } from '../types';
import { INITIAL_FILE_SYSTEM, MOCK_SIDEBAR_ITEMS } from '../constants';

interface FinderWindowProps {
  currentPath: string[]; // Array of IDs
  fileSystem: FileSystemItem[]; // Flattened or recursive, we'll traverse logic inside
}

const FinderWindow: React.FC<FinderWindowProps> = ({ currentPath, fileSystem }) => {
  
  // Helper to find folder by ID chain
  const getCurrentFolder = (): FileSystemItem | null => {
    let current: FileSystemItem | undefined = fileSystem.find(f => f.id === 'root');
    
    // Simple mock traversal: hardcoded to specific view for demo
    // In a real app we'd traverse the tree properly
    if (currentPath.includes('enzo')) {
       // Deep dive to Enzo folder
       const users = current?.children?.find(c => c.id === 'users');
       const enzo = users?.children?.find(c => c.id === 'enzo');
       return enzo || null;
    }
    
    return current || null;
  };

  const currentFolder = getCurrentFolder();
  const items = currentFolder?.children || [];

  const getIconForType = (type: FileType, kind: string) => {
      if (type === FileType.FOLDER) return <Folder className="text-[#00A6F4] fill-[#00A6F4]/20" size={18} />;
      if (type === FileType.APP) return <AppWindow className="text-white opacity-80" size={18} />;
      if (kind.includes('Image')) return <Image className="text-purple-400" size={18} />;
      if (kind.includes('Movie')) return <Film className="text-yellow-400" size={18} />;
      return <FileText className="text-gray-300" size={18} />;
  };

  return (
    <div className="w-full h-full bg-[#1E1E1E] text-white flex flex-col font-sans select-none overflow-hidden rounded-lg border border-[#3A3A3A] shadow-2xl relative">
      
      {/* Title Bar */}
      <div className="h-12 bg-[#262626] flex items-center justify-between px-4 border-b border-black/50">
        <div className="flex items-center space-x-6">
           <div className="flex space-x-2 mr-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
          </div>
          
          <div className="flex space-x-4 text-gray-400">
             <div className="flex space-x-1">
                <ChevronLeft size={20} className="hover:text-white cursor-pointer"/>
                <ChevronRight size={20} className="hover:text-white cursor-pointer opacity-50"/>
             </div>
             <span className="font-semibold text-gray-200">{currentFolder?.name || 'Macintosh HD'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-gray-400">
            <div className="flex bg-[#3A3A3A] rounded-md p-0.5">
                <div className="p-1 hover:bg-[#4A4A4A] rounded"><LayoutGrid size={16}/></div>
                <div className="p-1 bg-[#4A4A4A] text-white rounded shadow-sm"><List size={16}/></div>
                <div className="p-1 hover:bg-[#4A4A4A] rounded"><Columns size={16}/></div>
            </div>
            
            <div className="flex space-x-3">
                 <div className="p-1 hover:bg-[#3A3A3A] rounded"><Share2 size={16} /></div>
                 <div className="p-1 hover:bg-[#3A3A3A] rounded"><Search size={16} /></div>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-56 bg-[#1E1E1E]/50 backdrop-blur-md border-r border-black/50 py-4 flex flex-col overflow-y-auto">
           <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Favorites</div>
           <div className="space-y-0.5 px-2">
              {MOCK_SIDEBAR_ITEMS.map((item, idx) => (
                  <div key={idx} className={`flex items-center space-x-3 px-3 py-1.5 rounded-md cursor-pointer text-sm ${item.label === 'Desktop' ? 'bg-[#3A3A3A] text-white' : 'text-gray-300 hover:bg-[#2A2A2A]'}`}>
                     {item.label === 'Recents' && <Clock size={16} className="text-blue-400"/>}
                     {item.label === 'Shared' && <Folder size={16} className="text-blue-400"/>}
                     {item.label === 'Applications' && <AppWindow size={16} className="text-blue-400"/>}
                     {item.label === 'Desktop' && <Monitor size={16} className="text-blue-400"/>}
                     {item.label === 'Documents' && <FileText size={16} className="text-blue-400"/>}
                     {item.label === 'Downloads' && <Download size={16} className="text-blue-400"/>}
                     {item.label === 'Pictures' && <Image size={16} className="text-blue-400"/>}
                     {item.label === 'Movies' && <Film size={16} className="text-blue-400"/>}
                     {item.label === 'Music' && <Music size={16} className="text-blue-400"/>}
                     <span>{item.label}</span>
                  </div>
              ))}
           </div>

           <div className="mt-6 px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Locations</div>
            <div className="space-y-0.5 px-2">
                 <div className={`flex items-center space-x-3 px-3 py-1.5 rounded-md cursor-pointer text-sm text-gray-300 hover:bg-[#2A2A2A]`}>
                     <HardDrive size={16} className="text-gray-400"/>
                     <span>Macintosh HD</span>
                  </div>
                   <div className={`flex items-center space-x-3 px-3 py-1.5 rounded-md cursor-pointer text-sm text-gray-300 hover:bg-[#2A2A2A]`}>
                     <Wifi size={16} className="text-gray-400"/>
                     <span>Network</span>
                  </div>
            </div>
        </div>

        {/* File List */}
        <div className="flex-1 bg-[#1A1A1A] flex flex-col">
            {/* Column Headers */}
            <div className="flex items-center px-4 py-1 border-b border-white/10 text-xs font-medium text-gray-500">
                <div className="flex-1">Name</div>
                <div className="w-40">Date Modified</div>
                <div className="w-24">Size</div>
                <div className="w-32">Kind</div>
            </div>

            {/* List Items */}
            <div className="flex-1 overflow-y-auto p-1">
                {items.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <Folder size={48} className="mb-2 opacity-20"/>
                        <span>Empty Folder</span>
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div key={item.id} className={`flex items-center px-3 py-1.5 rounded hover:bg-[#2A2A2A] group ${index % 2 === 0 ? 'bg-transparent' : 'bg-[#1E1E1E]/50'}`}>
                            <div className="flex-1 flex items-center space-x-2 min-w-0">
                                {getIconForType(item.type, item.kind)}
                                <span className="text-sm text-gray-200 truncate">{item.name}</span>
                            </div>
                            <div className="w-40 text-xs text-gray-500">{item.dateModified}</div>
                            <div className="w-24 text-xs text-gray-500">{item.size || '--'}</div>
                            <div className="w-32 text-xs text-gray-500">{item.kind}</div>
                        </div>
                    ))
                )}
            </div>

            {/* Path Bar */}
            <div className="h-6 bg-[#1E1E1E] border-t border-white/10 flex items-center px-3 text-[10px] text-gray-500 space-x-2">
               <HardDrive size={12}/>
               <span>Macintosh HD</span>
               <ChevronRight size={10}/>
               <span>Users</span>
               <ChevronRight size={10}/>
               <span>Enzo</span>
               <span className="ml-auto">{items.length} items</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default FinderWindow;