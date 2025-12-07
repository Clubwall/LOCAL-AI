
import React, { useState } from 'react';
import { X, Info, Check, Download, Trash2, Cloud, HardDrive, Key, ExternalLink, Globe, Server, Loader2 } from 'lucide-react';
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
  onDownloadModel
}) => {
  const [activeTab, setActiveTab] = useState('autorun');
  // Mock state for API keys
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleCheckboxChange = (key: keyof AutoRunSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleApiKeyChange = (providerId: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [providerId]: value }));
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

              <div className="grid grid-cols-2 gap-x-16 gap-y-4 px-12">
                {/* Column 1 */}
                <div className="space-y-4">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.harmless} 
                            onChange={() => handleCheckboxChange('harmless')}
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200 group-hover:text-white">{CATEGORY_LABELS[CommandCategory.HARMLESS]}</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.create} 
                            onChange={() => handleCheckboxChange('create')}
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200 group-hover:text-white">{CATEGORY_LABELS[CommandCategory.CREATE]}</span>
                    </label>

                     <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.rename} 
                            onChange={() => handleCheckboxChange('rename')}
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200 group-hover:text-white">{CATEGORY_LABELS[CommandCategory.RENAME]}</span>
                    </label>

                     <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.move} 
                            onChange={() => handleCheckboxChange('move')}
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200 group-hover:text-white">{CATEGORY_LABELS[CommandCategory.MOVE]}</span>
                    </label>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                   <label className="flex items-center space-x-3 cursor-pointer group opacity-60">
                        <input 
                            type="checkbox" 
                            checked={true} 
                            readOnly
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200">Have minor side effects</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={settings.delete} 
                            onChange={() => handleCheckboxChange('delete')}
                            className="form-checkbox h-4 w-4 text-[#FF453A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-[#FF453A] group-hover:text-[#ff6057]">{CATEGORY_LABELS[CommandCategory.DELETE]}</span>
                    </label>
                </div>
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
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#FF9F0A] to-[#FF453A] rounded-2xl shadow-2xl flex items-center justify-center mb-6 ring-1 ring-white/10">
                      <HardDrive size={48} className="text-white drop-shadow-md"/>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">LOCAL AI</h1>
                  <p className="text-gray-400 text-sm">Version 1.0 (Simulation)</p>
                  
                  <div className="mt-8 text-sm text-gray-500 bg-[#222] py-4 px-12 rounded-xl border border-white/5">
                      <p>Created by</p>
                      <p className="text-white font-medium mt-1 text-base">Enzo Nassif</p>
                  </div>

                  <div className="mt-12 text-xs text-gray-600 space-y-1">
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
