import React, { useState, useCallback } from 'react';
import FinderWindow from './components/FinderWindow';
import InputBar from './components/InputBar';
import SettingsModal from './components/SettingsModal';
import CommandConfirmation from './components/CommandConfirmation';
import { generateTerminalCommand } from './services/geminiService';
import { AutoRunSettings, CommandCategory, GeneratedCommand, FileSystemItem, FileType } from './types';
import { INITIAL_FILE_SYSTEM } from './constants';

const DEFAULT_SETTINGS: AutoRunSettings = {
  harmless: true,
  create: true,
  rename: true,
  move: true,
  delete: false,
  modify: false
};

const App: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AutoRunSettings>(DEFAULT_SETTINGS);
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>(INITIAL_FILE_SYSTEM);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<GeneratedCommand | null>(null);
  const [lastStatus, setLastStatus] = useState<'success' | 'error' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  // We hardcode the path to Enzo's home for the demo
  const currentPath = ['root', 'users', 'enzo']; 

  const handleCommandExecution = useCallback(async (cmd: GeneratedCommand) => {
    // Simulate execution delay
    setIsProcessing(true);
    setStatusMessage(`Executing...`);
    
    await new Promise(resolve => setTimeout(resolve, 600)); // Fake terminal lag

    const newFS = [...fileSystem];
    // Find 'enzo' folder. Structure: root -> Users -> Enzo
    const root = newFS.find(f => f.id === 'root');
    const users = root?.children?.find(f => f.id === 'users');
    const enzoFolder = users?.children?.find(f => f.id === 'enzo');

    if (enzoFolder && enzoFolder.children) {
        
        // Support chained commands via && (e.g. mkdir folder && mv file folder)
        const subCommands = cmd.command.split('&&').map(c => c.trim());

        for (const subCmd of subCommands) {
            
            // --- MKDIR: Create Folder ---
            if (subCmd.startsWith('mkdir')) {
                // Simple heuristic to extract folder name
                let folderName = subCmd
                    .replace(/^mkdir\s+(-p\s+)?/, '')
                    .trim()
                    .replace(/["']/g, '');

                if (!folderName) folderName = `Untitled Folder`;
                
                // Avoid duplicate if possible
                if (!enzoFolder.children.find(c => c.name === folderName)) {
                     const newFolder: FileSystemItem = {
                        id: `folder-${Date.now()}-${Math.random()}`,
                        name: folderName,
                        type: FileType.FOLDER,
                        size: '--',
                        dateModified: 'Just now',
                        kind: 'Folder',
                        parentId: 'enzo',
                        children: []
                    };
                    enzoFolder.children.unshift(newFolder);
                }
            } 
            // --- TOUCH / CREATE: Create File ---
            else if (subCmd.startsWith('touch')) {
                 let fileName = subCmd.replace(/^touch\s+/, '').trim().replace(/["']/g, '');
                 if (!fileName) fileName = `untitled.txt`;

                 const newFile: FileSystemItem = {
                    id: `file-${Date.now()}-${Math.random()}`,
                    name: fileName,
                    type: FileType.FILE,
                    size: '0 KB',
                    dateModified: 'Just now',
                    kind: 'Text Document',
                    parentId: 'enzo'
                };
                enzoFolder.children.unshift(newFile);
            }
            // --- MV: Move or Rename ---
            else if (subCmd.startsWith('mv')) {
                // mv source destination
                const parts = subCmd.split(/\s+/);
                if (parts.length >= 3) {
                    const sourceName = parts[1].replace(/["']/g, '');
                    const destName = parts[2].replace(/["']/g, '');
                    
                    // 1. Find source in current folder
                    let itemsToMove: number[] = [];
                    
                    if (sourceName.startsWith('*.')) {
                        const ext = sourceName.substring(1); 
                        itemsToMove = enzoFolder.children
                            .map((c, idx) => c.name.endsWith(ext) ? idx : -1)
                            .filter(i => i !== -1);
                    } else {
                        const idx = enzoFolder.children.findIndex(c => c.name === sourceName);
                        if (idx !== -1) itemsToMove.push(idx);
                    }

                    itemsToMove.sort((a, b) => b - a);

                    const destFolder = enzoFolder.children.find(c => c.name === destName && c.type === FileType.FOLDER);

                    for (const idx of itemsToMove) {
                        const item = enzoFolder.children[idx];
                        
                        if (destFolder && destFolder.children) {
                            // Move to folder
                            enzoFolder.children.splice(idx, 1);
                            destFolder.children.push({...item, parentId: destFolder.id});
                        } else if (itemsToMove.length === 1 && !destName.includes('/')) {
                            // Rename 
                            item.name = destName;
                            enzoFolder.children[idx] = {...item};
                        }
                    }
                }
            }
            // --- RM: Delete ---
            else if (subCmd.startsWith('rm')) {
                // Better parsing for rm. Handle flags like -rf.
                // rm -rf "file name.png" -> split by space might break quoted strings, 
                // but for this simple sim we try to strip flags and look for the filename at the end
                // or match exact names in the folder.
                
                const parts = subCmd.split(/\s+/);
                // Remove 'rm' and flags starting with '-'
                const potentialNames = parts.filter(p => p !== 'rm' && !p.startsWith('-'));
                
                // Usually the last arg is the file, but we should try to match any arg to a file
                let deletedCount = 0;
                
                potentialNames.forEach(rawName => {
                    const name = rawName.replace(/["']/g, '').trim();
                     const idx = enzoFolder.children.findIndex(c => c.name === name);
                     if (idx !== -1) {
                         enzoFolder.children.splice(idx, 1);
                         deletedCount++;
                     }
                });

                // Fallback: if user typed "delete screenshot", LLM might output "rm Screenshot.png".
                // If it output "rm ./Screenshot.png", we handle that:
                if (deletedCount === 0 && potentialNames.length > 0) {
                     let cleanName = potentialNames[potentialNames.length - 1].replace(/["']/g, '').trim();
                     if (cleanName.startsWith('./')) cleanName = cleanName.substring(2);
                     
                     const idx = enzoFolder.children.findIndex(c => c.name === cleanName);
                     if (idx !== -1) {
                         enzoFolder.children.splice(idx, 1);
                     }
                }
            }
            // --- FFMPEG: Convert (Mock) ---
            else if (subCmd.includes('ffmpeg')) {
                 const newFile: FileSystemItem = {
                    id: `gen-${Date.now()}`,
                    name: 'ScreenRecording_2025.mp3', // Mock result
                    type: FileType.FILE,
                    size: '12 MB',
                    dateModified: 'Just now',
                    kind: 'MP3 Audio',
                    parentId: 'enzo'
                };
                enzoFolder.children.unshift(newFile);
            }
        }
    }

    setFileSystem(newFS);
    setLastStatus('success');
    setStatusMessage('Done.');
    setIsProcessing(false);
    
    setTimeout(() => {
        setStatusMessage('');
        setLastStatus(null);
    }, 2000);

  }, [fileSystem]);


  const handleSubmit = async (query: string) => {
    setIsProcessing(true);
    setLastStatus(null);
    setStatusMessage('Thinking...');

    try {
      const generated = await generateTerminalCommand(query, "~/Users/Enzo/");
      
      setIsProcessing(false);

      if (!generated.command) {
        setLastStatus('error');
        setStatusMessage('Error');
        return;
      }

      const shouldAutoRun = checkAutoRun(generated.category);

      if (shouldAutoRun) {
        await handleCommandExecution(generated);
      } else {
        setPendingCommand(generated);
      }

    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      setLastStatus('error');
      setStatusMessage('Error');
    }
  };

  const checkAutoRun = (category: CommandCategory): boolean => {
    switch (category) {
      case CommandCategory.HARMLESS: return settings.harmless;
      case CommandCategory.CREATE: return settings.create;
      case CommandCategory.RENAME: return settings.rename;
      case CommandCategory.MOVE: return settings.move;
      case CommandCategory.DELETE: return settings.delete;
      case CommandCategory.MODIFY: return settings.modify;
      default: return false; 
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black flex items-center justify-center overflow-hidden font-sans">
        
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF0F7B] via-[#F89B29] to-[#000] opacity-30 z-0"></div>

        {/* Container for Finder Window + Glued Input */}
        <div className="relative z-10 flex flex-col items-center shadow-2xl rounded-lg overflow-hidden border border-[#3A3A3A] bg-[#1E1E1E]">
            
            {/* Finder Window Area */}
            <div className="w-[900px] h-[550px] relative">
               <FinderWindow currentPath={currentPath} fileSystem={fileSystem} />
            </div>

            {/* Glued Input Bar */}
            <InputBar 
                onOpenSettings={() => setSettingsOpen(true)}
                onSubmit={handleSubmit}
                isProcessing={isProcessing}
                lastCommandStatus={lastStatus}
                statusMessage={statusMessage}
                className="bg-[#1E1E1E] w-[900px]" 
            />

            {/* Contextual Minimal Confirmation (Anchored to bottom) */}
             <div className="absolute bottom-16 w-full flex justify-center pointer-events-none">
                 <div className="pointer-events-auto">
                    <CommandConfirmation 
                        command={pendingCommand}
                        onCancel={() => setPendingCommand(null)}
                        onConfirm={async () => {
                            if (pendingCommand) {
                                const cmd = pendingCommand;
                                setPendingCommand(null);
                                await handleCommandExecution(cmd);
                            }
                        }}
                    />
                </div>
            </div>
        </div>

        <SettingsModal 
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            settings={settings}
            onSettingsChange={setSettings}
        />
        
        <div className="absolute bottom-4 right-4 text-white/20 text-xs pointer-events-none">
            LOCAL AI • Made by Enzo Nassif
        </div>
    </div>
  );
};

export default App;