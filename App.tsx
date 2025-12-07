
import React, { useState, useCallback } from 'react';
import FinderWindow from './components/FinderWindow';
import InputBar from './components/InputBar';
import SettingsModal from './components/SettingsModal';
import CommandConfirmation from './components/CommandConfirmation';
import { generateTerminalCommand } from './services/geminiService';
import { AutoRunSettings, CommandCategory, GeneratedCommand, FileSystemItem, FileType, ToolItem, OfflineModelItem } from './types';
import { INITIAL_FILE_SYSTEM, INITIAL_EXTRA_TOOLS, INITIAL_OFFLINE_AI_MODELS } from './constants';

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
  const [tools, setTools] = useState<ToolItem[]>(INITIAL_EXTRA_TOOLS);
  const [offlineModels, setOfflineModels] = useState<OfflineModelItem[]>(INITIAL_OFFLINE_AI_MODELS);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<GeneratedCommand | null>(null);
  const [lastStatus, setLastStatus] = useState<'success' | 'error' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  // We hardcode the path to Enzo's home for the demo
  const currentPath = ['root', 'users', 'enzo']; 

  // --- Tool & Model Management ---

  const handleInstallTool = (toolId: string) => {
    setTools(prev => prev.map(t => t.id === toolId ? { ...t, status: 'installing', progress: 0 } : t));
    
    // Simulate install process
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTools(prev => prev.map(t => t.id === toolId ? { ...t, status: 'installed', progress: 0 } : t));
        } else {
            setTools(prev => prev.map(t => t.id === toolId ? { ...t, progress } : t));
        }
    }, 200);
  };

  const handleUninstallTool = (toolId: string) => {
      setTools(prev => prev.map(t => t.id === toolId ? { ...t, status: 'available' } : t));
  };

  const handleDownloadModel = (modelId: string) => {
      setOfflineModels(prev => prev.map(m => m.id === modelId ? { ...m, status: 'downloading', progress: 0 } : m));

      // Simulate download process (slower than tools)
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 3; // Slow download
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setOfflineModels(prev => prev.map(m => m.id === modelId ? { ...m, status: 'downloaded', progress: 0 } : m));
        } else {
            setOfflineModels(prev => prev.map(m => m.id === modelId ? { ...m, progress } : m));
        }
      }, 100);
  };

  const handleCommandExecution = useCallback(async (cmd: GeneratedCommand) => {
    // Simulate execution delay
    setIsProcessing(true);
    setStatusMessage(`Executing...`);
    
    await new Promise(resolve => setTimeout(resolve, 600)); // Fake terminal lag

    const newFS = [...fileSystem];
    const root = newFS.find(f => f.id === 'root');
    const users = root?.children?.find(f => f.id === 'users');
    const enzoFolder = users?.children?.find(f => f.id === 'enzo');

    if (enzoFolder && enzoFolder.children) {
        
        // Support chained commands via && (e.g. mkdir folder && mv file folder)
        const subCommands = cmd.command.split('&&').map(c => c.trim());

        for (const subCmd of subCommands) {
            
            // --- MKDIR: Create Folder ---
            if (subCmd.startsWith('mkdir')) {
                let folderName = subCmd.replace(/^mkdir\s+(-p\s+)?/, '').trim().replace(/["']/g, '');
                if (!folderName) folderName = `Untitled Folder`;
                
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
                const parts = subCmd.split(/\s+/);
                if (parts.length >= 3) {
                    const sourceName = parts[1].replace(/["']/g, '');
                    const destName = parts[2].replace(/["']/g, '');
                    
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
                            enzoFolder.children.splice(idx, 1);
                            destFolder.children.push({...item, parentId: destFolder.id});
                        } else if (itemsToMove.length === 1 && !destName.includes('/')) {
                            item.name = destName;
                            enzoFolder.children[idx] = {...item};
                        }
                    }
                }
            }
            // --- RM: Delete ---
            else if (subCmd.startsWith('rm')) {
                const parts = subCmd.split(/\s+/);
                const potentialNames = parts.filter(p => p !== 'rm' && !p.startsWith('-'));
                let deletedCount = 0;
                potentialNames.forEach(rawName => {
                    const name = rawName.replace(/["']/g, '').trim();
                     let idx = enzoFolder.children.findIndex(c => c.name === name);
                     if (idx === -1) idx = enzoFolder.children.findIndex(c => c.name.toLowerCase() === name.toLowerCase());

                     if (idx !== -1) {
                         enzoFolder.children.splice(idx, 1);
                         deletedCount++;
                     }
                });

                if (deletedCount === 0 && potentialNames.length > 0) {
                     let cleanName = potentialNames[potentialNames.length - 1].replace(/["']/g, '').trim();
                     if (cleanName.startsWith('./')) cleanName = cleanName.substring(2);
                     let idx = enzoFolder.children.findIndex(c => c.name === cleanName);
                     if (idx === -1) idx = enzoFolder.children.findIndex(c => c.name.toLowerCase() === cleanName.toLowerCase());

                     if (idx !== -1) enzoFolder.children.splice(idx, 1);
                }
            }
            // --- FFMPEG: Convert (Mock) ---
            else if (subCmd.includes('ffmpeg')) {
                // REALISTIC CHECK: Is FFmpeg installed?
                const ffmpegTool = tools.find(t => t.id === 'ffmpeg');
                if (!ffmpegTool || ffmpegTool.status !== 'installed') {
                     setStatusMessage('Error: FFmpeg not installed');
                     setLastStatus('error');
                     setIsProcessing(false);
                     setTimeout(() => {
                        setStatusMessage('');
                        setLastStatus(null);
                     }, 3000);
                     return; // STOP EXECUTION
                }

                 const newFile: FileSystemItem = {
                    id: `gen-${Date.now()}`,
                    name: 'ScreenRecording_2025.mp3', 
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

  }, [fileSystem, tools]);


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
            tools={tools}
            onInstallTool={handleInstallTool}
            onUninstallTool={handleUninstallTool}
            offlineModels={offlineModels}
            onDownloadModel={handleDownloadModel}
        />
        
        <div className="absolute bottom-4 right-4 text-white/20 text-xs pointer-events-none">
            LOCAL AI • Made by Enzo Nassif
        </div>
    </div>
  );
};

export default App;
