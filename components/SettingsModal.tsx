
import React, { useState } from 'react';
import { X, Info, Check, Download, Trash2, Cloud, HardDrive, Key, ExternalLink, Globe, Server, Loader2, Package, CheckCircle, Terminal, AlertCircle } from 'lucide-react';
import { SETTINGS_TABS, CATEGORY_LABELS, ONLINE_AI_PROVIDERS } from '../constants';
import { AutoRunSettings, CommandCategory, ToolItem, OfflineModelItem } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AutoRunSettings;
  onSettingsChange: (newSettings: AutoRunSettings) => void;
  tools: ToolItem[];
  onInstallTool: (id: string) => void;
  onUninstallTool: (id: string) => void;
  offlineModels: OfflineModelItem[];
  onDownloadModel: (id: string) => void;
  apiKeys: Record<string, string>;
  onApiKeysChange: (newKeys: Record<string, string>) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  tools,
  onInstallTool,
  onUninstallTool,
  offlineModels,
  onDownloadModel,
  apiKeys,
  onApiKeysChange
}) => {
  const [activeTab, setActiveTab] = useState('autorun');
  
  // Export Simulation State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStep, setExportStep] = useState('');
  const [exportComplete, setExportComplete] = useState(false);

  if (!isOpen) return null;

  const handleCheckboxChange = (key: keyof AutoRunSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleApiKeyChange = (providerId: string, value: string) => {
    onApiKeysChange({ ...apiKeys, [providerId]: value });
  };

  const downloadBuildScript = () => {
    const scriptContent = `#!/bin/bash

# -----------------------------------------------------------------------------
# Substage Local Installer Generator
# -----------------------------------------------------------------------------
# This script scaffolds a minimal Electron environment to build a valid .dmg
# for macOS. Run this in your terminal to generate the app.
# -----------------------------------------------------------------------------

APP_NAME="Substage"
DIR_NAME="Substage_Build_$(date +%s)"

# Colors
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
RED='\\033[0;31m'
NC='\\033[0m' # No Color

echo -e "\${BLUE}🚀 Starting Substage Installer Generator...\${NC}"

# Check for Node.js
if ! command -v npm &> /dev/null; then
    echo -e "\${RED}❌ Error: npm (Node.js) is not installed.\${NC}"
    echo "Please install Node.js from https://nodejs.org/ and try again."
    exit 1
fi

echo -e "\${BLUE}📂 Creating project directory: $DIR_NAME\${NC}"
mkdir "$DIR_NAME"
cd "$DIR_NAME"

echo -e "\${BLUE}📦 Initializing package.json...\${NC}"
npm init -y > /dev/null
npm pkg set name="substage-local"
npm pkg set version="1.0.0"
npm pkg set main="main.js"
npm pkg set description="Local AI File Helper"
npm pkg set author="Enzo Nassif"
npm pkg set scripts.start="electron ."
npm pkg set scripts.dist="electron-builder build --mac"
npm pkg set build.appId="com.enzonassif.substage"
npm pkg set build.productName="Substage"
npm pkg set build.mac.category="public.app-category.utilities"
npm pkg set build.mac.target="dmg"

echo -e "\${BLUE}⬇️  Installing Electron & Builder (this may take a minute)...\${NC}"
npm install electron electron-builder --save-dev

echo -e "\${BLUE}📝 Creating main process (main.js)...\${NC}"
cat << 'EOF' > main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1E1E1E',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    vibrancy: 'under-window',
    visualEffectState: 'active'
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
EOF

echo -e "\${BLUE}🎨 Creating UI (index.html)...\${NC}"
cat << 'EOF' > index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Substage</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #1E1E1E;
            color: #ececec;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        .card {
            background: #2A2A2A;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        h1 { margin-bottom: 0.5rem; font-weight: 600; }
        p { color: #888; font-size: 0.9rem; }
        .status { color: #28C840; margin-top: 1rem; font-weight: 500; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Substage Local</h1>
        <p>This is a native build of the Substage environment.</p>
        <div class="status">● System Active</div>
    </div>
</body>
</html>
EOF

echo -e "\${GREEN}🔨 Building .dmg (Running electron-builder)...\${NC}"
npm run dist

echo -e "\${GREEN}✅ Build Complete!\${NC}"
echo -e "You can find your .dmg file in: \${BLUE}$DIR_NAME/dist/\${NC}"
open "$DIR_NAME/dist"
`;

    const blob = new Blob([scriptContent], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build_substage.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (isExporting || exportComplete) return;
    
    setIsExporting(true);
    setExportStep('Compiling assets...');
    setExportProgress(0);

    const interval = setInterval(() => {
        setExportProgress(prev => {
            const next = prev + 1.5;
            
            if (next > 20 && next < 50) setExportStep('Bundling React application...');
            if (next > 50 && next < 80) setExportStep('Building native macOS binary...');
            if (next > 80 && next < 95) setExportStep('Signing with Apple Developer ID...');
            if (next >= 100) {
                clearInterval(interval);
                setExportStep('Done');
                setExportComplete(true);
                setIsExporting(false);
                downloadBuildScript(); // Trigger download
                return 100;
            }
            return next;
        });
    }, 50); // Speed up for UX
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm font-sans">
      <div className="w-[800px] h-[600px] bg-[#2A2A2A] rounded-xl shadow-2xl border border-white/10 flex flex-col overflow-hidden text-[#ececec]">
        
        {/* Header/Title Bar */}
        <div className="h-10 bg-[#383838] flex items-center justify-center relative border-b border-black/20 shrink-0">
          <div className="absolute left-3 flex space-x-2">
            <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80"></button>
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
          </div>
          <span className="font-semibold text-sm text-gray-300">
            {SETTINGS_TABS.find(t => t.id === activeTab)?.label || 'Settings'}
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex justify-center space-x-1 py-3 bg-[#333333] border-b border-black/20 shrink-0">
          {SETTINGS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center px-6 py-2 rounded-md transition-colors ${
                  isActive ? 'bg-[#4A4A4A] text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className={`${isActive ? 'text-[#FF9F0A]' : 'text-gray-400'}`}>
                  {tab.icon}
                </div>
                <span className="text-[11px] mt-1 font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-[#2A2A2A] relative">
          
          {/* AUTO RUN TAB */}
          {activeTab === 'autorun' && (
            <div className="p-8 h-full overflow-y-auto">
              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-white">Substage can run commands with or without confirmation</h3>
                <p className="text-sm text-gray-400 mt-1">What kinds of commands should run <span className="text-white font-medium">without asking?</span></p>
              </div>

              <div className="grid grid-cols-2 gap-x-12 px-6">
                {/* Column 1 */}
                <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.harmless} 
                            onChange={() => handleCheckboxChange('harmless')}
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200 group-hover:text-white">Harmless commands</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.create} 
                            onChange={() => handleCheckboxChange('create')}
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200 group-hover:text-white">Create new files</span>
                    </label>

                     <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.rename} 
                            onChange={() => handleCheckboxChange('rename')}
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200 group-hover:text-white">Rename files</span>
                    </label>

                     <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.move} 
                            onChange={() => handleCheckboxChange('move')}
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200 group-hover:text-white">Move files</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.modify} 
                            onChange={() => handleCheckboxChange('modify')}
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200 group-hover:text-white">Modify files</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.changeOutside} 
                            onChange={() => handleCheckboxChange('changeOutside')}
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200 group-hover:text-white">Change files outside current folder</span>
                    </label>

                    <div className="mt-6 text-xs text-gray-500 space-y-1 pl-7">
                        <p className="font-medium text-gray-400">Minor side effects include:</p>
                        <p>• Opening an app or file</p>
                        <p>• Network access</p>
                        <p>• Reading from clipboard</p>
                        <p>• Long running commands</p>
                    </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-3">
                   <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.minorSideEffects} 
                            onChange={() => handleCheckboxChange('minorSideEffects')}
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200 group-hover:text-white">Have minor side effects</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.significantSideEffects} 
                            onChange={() => handleCheckboxChange('significantSideEffects')}
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200 group-hover:text-white">Have significant side effects</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.moveToTrash} 
                            onChange={() => handleCheckboxChange('moveToTrash')}
                            className="form-checkbox h-4 w-4 text-[#FF453A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-[#FF453A] group-hover:text-[#ff6057]">Move items to Trash</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.deleteOverwrite} 
                            onChange={() => handleCheckboxChange('deleteOverwrite')}
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200 group-hover:text-white">Delete or overwrite files</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.unknownScripts} 
                            onChange={() => handleCheckboxChange('unknownScripts')}
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200 group-hover:text-white">Run unknown scripts or commands</span>
                    </label>

                     <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.commandsWithErrors} 
                            onChange={() => handleCheckboxChange('commandsWithErrors')}
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200 group-hover:text-white">Commands with errors</span>
                    </label>

                    <div className="mt-6 text-xs text-gray-500 space-y-1 pl-7">
                        <p className="font-medium text-gray-400">Significant side effects include:</p>
                        <p>• Modifying system settings</p>
                        <p>• Force-quitting an app</p>
                        <p>• Shutting down your Mac</p>
                        <p>• Indefinite running commands</p>
                    </div>
                </div>
              </div>

               <div className="mt-8 flex items-center justify-center space-x-2 text-[#FF453A] bg-[#FF453A]/10 py-3 rounded-lg border border-[#FF453A]/20 mx-6">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">Allowing Substage to move files to the trash without confirmation isn't recommended.</span>
               </div>

            </div>
          )}

          {/* AI MODELS TAB */}
          {activeTab === 'models' && (
             <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 flex overflow-hidden">
                    
                    {/* LEFT COLUMN: ONLINE */}
                    <div className="w-1/2 flex flex-col border-r border-white/10 bg-[#252525]">
                         <div className="p-4 border-b border-white/10 bg-[#2A2A2A]">
                             <div className="flex items-center space-x-2 text-[#FF9F0A] mb-1">
                                 <Globe size={18} />
                                 <h4 className="font-semibold text-sm">Online Models</h4>
                             </div>
                             <p className="text-xs text-gray-400">Connect to powerful cloud APIs.</p>
                         </div>
                         
                         <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {ONLINE_AI_PROVIDERS.map((provider) => (
                                <div key={provider.id} className="bg-[#2A2A2A] rounded-lg border border-white/5 p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-medium text-sm text-gray-200">{provider.name}</h5>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <div className="flex items-center space-x-2 bg-[#1A1A1A] rounded px-2 py-1.5 border border-white/10 focus-within:border-[#FF9F0A]/50 transition-colors">
                                            <Key size={12} className="text-gray-500 shrink-0"/>
                                            <input 
                                                type="password"
                                                placeholder={`Enter ${provider.name} API Key`}
                                                value={apiKeys[provider.id] || ''}
                                                onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                                                className="bg-transparent border-none text-xs text-white placeholder-gray-600 focus:ring-0 w-full p-0"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 pl-1">
                                        {provider.models.map(model => (
                                            <label key={model.id} className="flex items-start space-x-2 cursor-pointer group">
                                                <input type="checkbox" className="mt-0.5 bg-[#3A3A3A] border-gray-600 rounded text-[#FF9F0A] focus:ring-0 w-3.5 h-3.5"/>
                                                <div>
                                                    <div className="text-xs font-medium text-gray-300 group-hover:text-white">{model.name}</div>
                                                    <div className="text-[10px] text-gray-500">{model.desc}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>

                    {/* RIGHT COLUMN: OFFLINE */}
                    <div className="w-1/2 flex flex-col bg-[#222]">
                        <div className="p-4 border-b border-white/10 bg-[#2A2A2A]">
                             <div className="flex items-center justify-between">
                                 <div className="flex items-center space-x-2 text-[#28C840]">
                                     <Server size={18} />
                                     <h4 className="font-semibold text-sm">Local Models</h4>
                                 </div>
                             </div>
                             <p className="text-xs text-gray-400 mt-1">
                                 Run privately on your Mac. Download models below.
                             </p>
                         </div>

                         <div className="flex-1 overflow-y-auto p-4">
                             <div className="space-y-2">
                                 {offlineModels.map((model) => (
                                     <div key={model.id} className="flex flex-col p-3 rounded-lg bg-[#2A2A2A] border border-white/5 hover:bg-[#333] transition-colors group">
                                         <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center">
                                                    <HardDrive size={14} className="text-gray-500 group-hover:text-[#28C840] transition-colors"/>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">{model.name}</div>
                                                    <div className="text-[10px] text-gray-500">{model.desc} • {model.size}</div>
                                                </div>
                                            </div>
                                            <div>
                                                {model.status === 'downloaded' ? (
                                                     <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs text-[#28C840] font-medium">
                                                         <Check size={12}/>
                                                         <span>Ready</span>
                                                     </div>
                                                ) : model.status === 'downloading' ? (
                                                     <div className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-gray-400">
                                                         <Loader2 size={12} className="animate-spin"/>
                                                         <span>{Math.round(model.progress || 0)}%</span>
                                                     </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => onDownloadModel(model.id)}
                                                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#28C840] hover:text-white rounded border border-white/10 text-xs text-gray-300 transition-all"
                                                    >
                                                        <Download size={12}/>
                                                        <span>Get</span>
                                                    </button>
                                                )}
                                            </div>
                                         </div>
                                         {/* Progress Bar for Models */}
                                         {model.status === 'downloading' && (
                                            <div className="mt-2 w-full h-1 bg-black/50 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-[#28C840] transition-all duration-200 ease-out"
                                                    style={{ width: `${model.progress}%` }}
                                                ></div>
                                            </div>
                                         )}
                                     </div>
                                 ))}
                             </div>
                         </div>
                    </div>

                </div>
             </div>
          )}

          {/* EXTRA TOOLS TAB */}
          {activeTab === 'tools' && (
              <div className="p-8 h-full overflow-y-auto">
                  <div className="mb-6">
                      <h3 className="text-base font-semibold text-white">Available direct download packages</h3>
                      <p className="text-xs text-gray-500 mt-1">Tools required for complex file operations</p>
                  </div>
                  <div className="space-y-1">
                      {tools.map((tool) => (
                          <div key={tool.id} className="flex flex-col py-3 border-b border-white/5 last:border-0 group hover:bg-white/5 px-3 -mx-3 rounded transition-colors">
                              <div className="flex items-center justify-between">
                                  <div className="flex items-start space-x-4">
                                      {tool.status === 'installed' ? (
                                          <div className="w-5 h-5 rounded-full bg-[#28C840] flex items-center justify-center mt-0.5 shadow-sm">
                                              <Check size={12} className="text-black font-bold"/>
                                          </div>
                                      ) : tool.status === 'installing' ? (
                                          <div className="w-5 h-5 mt-0.5">
                                               <Loader2 size={18} className="animate-spin text-[#00A6F4]"/>
                                          </div>
                                      ) : (
                                          <div className="w-5 h-5 rounded-full border border-gray-600 mt-0.5"></div>
                                      )}
                                      <div>
                                          <div className="text-sm font-medium text-white">{tool.name}</div>
                                          <div className="text-xs text-gray-400 flex items-center space-x-1 mt-0.5">
                                              <span>{tool.desc}</span>
                                              <span className="text-gray-600">•</span>
                                              <span className="text-[#00A6F4] opacity-80">{tool.license}</span>
                                          </div>
                                      </div>
                                  </div>
                                  <div>
                                      {tool.status === 'installed' ? (
                                          <button 
                                            onClick={() => onUninstallTool(tool.id)}
                                            className="flex items-center space-x-1.5 px-3 py-1 bg-[#3A3A3A] hover:bg-[#FF453A]/20 hover:text-[#FF453A] rounded text-xs text-gray-400 transition-colors border border-white/5"
                                          >
                                              <Trash2 size={12}/>
                                              <span>Uninstall</span>
                                          </button>
                                      ) : tool.status === 'installing' ? (
                                          <span className="text-xs text-gray-500 italic px-3 py-1">Installing...</span>
                                      ) : (
                                          <button 
                                            onClick={() => onInstallTool(tool.id)}
                                            className="flex items-center space-x-1.5 px-3 py-1 bg-[#3A3A3A] hover:bg-[#00A6F4] hover:text-white rounded text-xs text-white transition-colors border border-white/5"
                                          >
                                              <Cloud size={12}/>
                                              <span>Install</span>
                                          </button>
                                      )}
                                  </div>
                              </div>
                              
                              {/* Progress bar for tools */}
                              {tool.status === 'installing' && (
                                  <div className="mt-2 w-full h-1 bg-black/50 rounded-full overflow-hidden ml-9">
                                      <div 
                                        className="h-full bg-[#00A6F4] transition-all duration-200 ease-out"
                                        style={{ width: `${tool.progress}%` }}
                                      ></div>
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#FF9F0A] to-[#FF453A] rounded-2xl shadow-2xl flex items-center justify-center mb-6 ring-1 ring-white/10">
                      <HardDrive size={48} className="text-white drop-shadow-md"/>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">LOCAL AI</h1>
                  <p className="text-gray-400 text-sm">Version 1.0 (Web Simulation)</p>
                  
                  <div className="mt-8 text-sm text-gray-500 bg-[#222] py-4 px-12 rounded-xl border border-white/5 w-64">
                      <p>Created by</p>
                      <p className="text-white font-medium mt-1 text-base">Enzo Nassif</p>
                  </div>

                  {/* Export Simulation Area */}
                  <div className="mt-8 w-64">
                      {!isExporting && !exportComplete && (
                          <button 
                             onClick={handleExport}
                             className="w-full flex items-center justify-center space-x-2 bg-[#3A3A3A] hover:bg-[#FF9F0A] hover:text-black text-gray-300 py-2.5 rounded-lg text-xs font-medium transition-all border border-white/10"
                          >
                              <Package size={14} />
                              <span>Export to .dmg</span>
                          </button>
                      )}

                      {isExporting && (
                          <div className="w-full bg-[#1A1A1A] p-3 rounded-lg border border-white/10">
                              <div className="flex justify-between items-center mb-2">
                                  <span className="text-[10px] text-gray-400">{exportStep}</span>
                                  <span className="text-[10px] text-[#FF9F0A]">{Math.round(exportProgress)}%</span>
                              </div>
                              <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-[#FF9F0A] transition-all duration-100 ease-out"
                                    style={{ width: `${exportProgress}%` }}
                                  ></div>
                              </div>
                          </div>
                      )}

                       {exportComplete && (
                          <div className="flex flex-col space-y-2 animate-in fade-in zoom-in duration-300">
                             <div className="flex items-center justify-center space-x-2 bg-[#28C840]/10 text-[#28C840] py-2.5 rounded-lg text-xs font-medium border border-[#28C840]/20 cursor-default">
                                  <CheckCircle size={14} />
                                  <span>Generated Script</span>
                             </div>
                             <p className="text-[10px] text-gray-500">Run the downloaded script to build .dmg</p>
                          </div>
                      )}
                  </div>

                  <div className="mt-8 text-[10px] text-gray-600 space-y-1">
                      <p>© 2025 Substage Simulation.</p>
                      <p>All rights reserved.</p>
                  </div>
              </div>
          )}

           {activeTab === 'general' && (
             <div className="flex flex-col items-center justify-center h-full text-gray-500">
                 <div className="p-4 rounded-full bg-white/5 mb-4">
                    <Info size={32} className="opacity-50"/>
                 </div>
                 <p>General settings not available in this demo.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
