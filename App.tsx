
import React, { useState, useCallback, useEffect } from 'react';
import FinderWindow from './components/FinderWindow';
import InputBar from './components/InputBar';
import SettingsModal from './components/SettingsModal';
import CommandConfirmation from './components/CommandConfirmation';
import { generateTerminalCommand } from './services/geminiService';
import { AutoRunSettings, CommandCategory, GeneratedCommand, FileSystemItem, FileType, ToolItem, OfflineModelItem } from './types';
import { INITIAL_FILE_SYSTEM, INITIAL_EXTRA_TOOLS, INITIAL_OFFLINE_AI_MODELS } from './constants';

const DEFAULT_SETTINGS: AutoRunSettings = {
  harmless: false,
  create: false,
  rename: false,
  move: false,
  modify: false,
  changeOutside: false,
  minorSideEffects: false,
  significantSideEffects: false,
  moveToTrash: false,
  deleteOverwrite: false,
  unknownScripts: false,
  commandsWithErrors: false
};

const App: React.FC = () => {
  // Initialize state with lazy initializers to check localStorage
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const [settings, setSettings] = useState<AutoRunSettings>(() => {
    const saved = localStorage.getItem('substage_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>(() => {
    const saved = localStorage.getItem('substage_filesystem');
    return saved ? JSON.parse(saved) : INITIAL_FILE_SYSTEM;
  });

  const [tools, setTools] = useState<ToolItem[]>(() => {
    const saved = localStorage.getItem('substage_tools');
    return saved ? JSON.parse(saved) : INITIAL_EXTRA_TOOLS;
  });

  const [offlineModels, setOfflineModels] = useState<OfflineModelItem[]>(() => {
    const saved = localStorage.getItem('substage_models');
    return saved ? JSON.parse(saved) : INITIAL_OFFLINE_AI_MODELS;
  });

  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('substage_apikeys');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<GeneratedCommand | null>(null);
  const [lastStatus, setLastStatus] = useState<'success' | 'error' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  // We hardcode the path to Enzo's home for the demo
  const currentPath = ['root', 'users', 'enzo']; 

  // --- Persistence Effects ---
  useEffect(() => { localStorage.setItem('substage_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('substage_filesystem', JSON.stringify(fileSystem)); }, [fileSystem]);
  useEffect(() => { localStorage.setItem('substage_tools', JSON.stringify(tools)); }, [tools]);
  useEffect(() => { localStorage.setItem('substage_models', JSON.stringify(offlineModels)); }, [offlineModels]);
  useEffect(() => { localStorage.setItem('substage_apikeys', JSON.stringify(apiKeys)); }, [apiKeys]);


  // --- Helper to get file context ---
  const getEnzoFiles = useCallback(() => {
    const root = fileSystem.find(f => f.id === 'root');
    const users = root?.children?.find(f => f.id === 'users');
    const enzo = users?.children?.find(f => f.id === 'enzo');
    return enzo?.children?.map(c => c.name).join(', ') || '';
  }, [fileSystem]);

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

    try {
        // Deep clone to ensure React state updates trigger correctly and avoid mutation issues
        const newFS = JSON.parse(JSON.stringify(fileSystem)) as FileSystemItem[];
        const root = newFS.find(f => f.id === 'root');
        const users = root?.children?.find(f => f.id === 'users');
        const enzoFolder = users?.children?.find(f => f.id === 'enzo');

        if (!enzoFolder) throw new Error("Critical Error: Home directory not found.");

        // Fallback for safety if children array is missing
        if (!enzoFolder.children) enzoFolder.children = [];

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
                        // Safe check: prevent error if file doesn't exist (simulated robustness)
                        else console.warn(`Skipping move: Source ${sourceName} not found`);
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
                const rawArgs = subCmd.replace(/^rm\s+/, '').trim();
                let targets = [rawArgs];
                
                if (!rawArgs.includes('"') && !rawArgs.includes("'")) {
                    targets = rawArgs.split(/\s+/).filter(t => !t.startsWith('-'));
                } else {
                    targets = [rawArgs.replace(/^["']|["']$/g, '')];
                }

                targets.forEach(targetName => {
                    const cleanName = targetName.replace(/^["']|["']$/g, '');
                    const idx = enzoFolder.children.findIndex(c => 
                        c.name === cleanName || c.name.toLowerCase() === cleanName.toLowerCase()
                    );
                    
                    if (idx !== -1) {
                        enzoFolder.children.splice(idx, 1);
                    }
                });
            }
            // --- FFMPEG: Convert (Mock) ---
            else if (subCmd.includes('ffmpeg')) {
                // REALISTIC CHECK: Is FFmpeg installed?
                const ffmpegTool = tools.find(t => t.id === 'ffmpeg');
                if (!ffmpegTool || ffmpegTool.status !== 'installed') {
                     throw new Error("FFmpeg not installed. Please install it in 'Extra Tools'.");
                }
                
                // Parse source file from command "ffmpeg -i Source.mp4 ..."
                const match = subCmd.match(/-i\s+["']?([^"'\s]+)["']?/);
                const sourceFile = match ? match[1] : null;

                if (sourceFile && !enzoFolder.children.some(c => c.name === sourceFile)) {
                     throw new Error(`File '${sourceFile}' not found.`);
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

        setFileSystem(newFS);
        setLastStatus('success');
        setStatusMessage('Done.');
        
    } catch (error: any) {
        console.error("Execution Error:", error);
        setLastStatus('error');
        setStatusMessage(error.message || 'Execution failed');
    } finally {
        setIsProcessing(false);
        setTimeout(() => {
            setStatusMessage('');
            setLastStatus(null);
        }, 3000);
    }

  }, [fileSystem, tools]);


  const handleSubmit = async (query: string) => {
    setIsProcessing(true);
    setLastStatus(null);
    setStatusMessage('Thinking...');

    try {
      const fileContext = getEnzoFiles();
      // Use Google API Key if available
      const googleKey = apiKeys['google'];
      
      const generated = await generateTerminalCommand(
          query, 
          "~/Users/Enzo/", 
          fileContext,
          googleKey
      );
      
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
      case CommandCategory.DELETE: return settings.moveToTrash; // Mapped to moveToTrash
      case CommandCategory.MODIFY: return settings.modify;
      case CommandCategory.UNKNOWN: return settings.unknownScripts;
      default: return false; 
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black flex items-center justify-center overflow-hidden font-sans">
        
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF0F7B] via-[#F89B29] to-[#000] opacity-30 z-0"></div>

        {/* Container for Finder Window + Glued Input */}
        <div className="relative z-10 flex flex-col items-center shadow-2xl rounded-lg overflow-hidden border border-[#3A3A3A] bg-[#1E1E1E]">
            
            {/* Finder Window Area */}
            <div className="w-[900px] h-[550px] relative z-0">
               <FinderWindow currentPath={currentPath} fileSystem={fileSystem} />
            </div>

            {/* Contextual Minimal Confirmation (Anchored to bottom above input bar) */}
             <div className="absolute bottom-[54px] w-full flex justify-center pointer-events-none z-50 px-4">
                 <div className="pointer-events-auto w-full max-w-2xl">
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

            {/* Glued Input Bar */}
            <div className="relative z-20 w-[900px]">
                <InputBar 
                    onOpenSettings={() => setSettingsOpen(true)}
                    onSubmit={handleSubmit}
                    isProcessing={isProcessing}
                    lastCommandStatus={lastStatus}
                    statusMessage={statusMessage}
                    className="bg-[#1E1E1E]" 
                />
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
            apiKeys={apiKeys}
            onApiKeysChange={setApiKeys}
        />
        
        <div className="absolute bottom-4 right-4 text-white/20 text-xs pointer-events-none">
            LOCAL AI • Made by Enzo Nassif
        </div>
    </div>
  );
};

export default App;
