import React, { useState } from 'react';
import { X, Info, Check, Download, Trash2, Cloud, HardDrive, Key } from 'lucide-react';
import { SETTINGS_TABS, CATEGORY_LABELS, EXTRA_TOOLS, AI_MODELS } from '../constants';
import { AutoRunSettings, CommandCategory } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AutoRunSettings;
  onSettingsChange: (newSettings: AutoRunSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [activeTab, setActiveTab] = useState('autorun');
  const [apiKey, setApiKey] = useState('');

  if (!isOpen) return null;

  const handleCheckboxChange = (key: keyof AutoRunSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm font-sans">
      <div className="w-[680px] h-[520px] bg-[#2A2A2A] rounded-xl shadow-2xl border border-white/10 flex flex-col overflow-hidden text-[#ececec]">
        
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
                className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-md transition-colors ${
                  isActive ? 'bg-[#4A4A4A] text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className={`${isActive ? 'text-[#FF9F0A]' : 'text-gray-400'}`}>
                  {tab.icon}
                </div>
                <span className="text-[11px] mt-1">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#2A2A2A] p-6">
          
          {/* AUTO RUN TAB */}
          {activeTab === 'autorun' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-base font-semibold text-white">Substage can run commands with or without confirmation</h3>
                <p className="text-sm text-gray-400 mt-1">What kinds of commands should run <span className="text-white font-medium">without asking?</span></p>
              </div>

              <div className="grid grid-cols-2 gap-x-12 gap-y-3 px-8">
                {/* Column 1 */}
                <div className="space-y-3">
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
                <div className="space-y-3">
                   <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={true} 
                            readOnly
                            className="form-checkbox h-4 w-4 text-[#FF9F0A] rounded border-gray-600 bg-[#3A3A3A] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200 group-hover:text-white">Have minor side effects</span>
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
             <div className="h-full flex flex-col">
                 <div className="mb-6">
                    <h3 className="text-base font-semibold text-white mb-2">Choose which models appear in the model selector:</h3>
                    
                    <div className="flex space-x-4">
                        <div className="flex-1">
                             <h4 className="text-sm font-semibold text-gray-300 mb-3 border-b border-white/10 pb-1">Online Models (API)</h4>
                             <div className="space-y-3">
                                {AI_MODELS.filter(m => m.type === 'online').map(model => (
                                    <label key={model.id} className="flex items-start space-x-3 p-2 rounded hover:bg-white/5 cursor-pointer">
                                        <input type="checkbox" defaultChecked={model.default} className="mt-1 bg-[#3A3A3A] border-gray-600 rounded text-[#FF9F0A] focus:ring-0"/>
                                        <div>
                                            <div className="text-sm font-medium text-white">{model.name}</div>
                                            <div className="text-xs text-gray-400 leading-tight">{model.desc}</div>
                                        </div>
                                    </label>
                                ))}
                             </div>
                             
                             <div className="mt-4 p-3 bg-[#1A1A1A] rounded border border-white/5">
                                 <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
                                    <Key size={12}/>
                                    <span>OpenAI / Provider API Key</span>
                                 </div>
                                 <input 
                                    type="password" 
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full bg-[#2A2A2A] border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-[#FF9F0A] focus:outline-none"
                                 />
                             </div>
                        </div>

                        <div className="w-[1px] bg-white/10"></div>

                        <div className="flex-1">
                             <h4 className="text-sm font-semibold text-gray-300 mb-3 border-b border-white/10 pb-1">Local Models (Offline)</h4>
                             <div className="space-y-3">
                                {AI_MODELS.filter(m => m.type === 'local').map(model => (
                                    <div key={model.id} className={`flex items-start justify-between p-2 rounded border ${model.installed ? 'bg-[#333] border-[#FF9F0A]/30' : 'bg-transparent border-white/5 opacity-70'}`}>
                                        <div className="flex items-start space-x-3">
                                            <input type="checkbox" defaultChecked={model.installed} disabled={!model.installed} className="mt-1 bg-[#3A3A3A] border-gray-600 rounded text-[#FF9F0A] focus:ring-0"/>
                                            <div>
                                                <div className="text-sm font-medium text-white">{model.name}</div>
                                                <div className="text-xs text-gray-400 leading-tight">{model.desc}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                             <div className="mt-4 text-center">
                                 <button className="text-xs text-[#FF9F0A] hover:underline flex items-center justify-center w-full space-x-1">
                                    <Download size={12}/>
                                    <span>Download more models</span>
                                 </button>
                             </div>
                        </div>
                    </div>
                </div>
             </div>
          )}

          {/* EXTRA TOOLS TAB */}
          {activeTab === 'tools' && (
              <div className="h-full flex flex-col">
                  <div className="mb-4">
                      <h3 className="text-base font-semibold text-white">Available direct download packages</h3>
                  </div>
                  <div className="space-y-0.5">
                      {EXTRA_TOOLS.map((tool, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group hover:bg-white/5 px-2 -mx-2 rounded">
                              <div className="flex items-start space-x-3">
                                  {tool.status === 'installed' ? (
                                      <div className="w-5 h-5 rounded-full bg-[#28C840] flex items-center justify-center mt-0.5">
                                          <Check size={12} className="text-black font-bold"/>
                                      </div>
                                  ) : (
                                      <div className="w-5 h-5 rounded-full border border-gray-600 mt-0.5"></div>
                                  )}
                                  <div>
                                      <div className="text-sm font-medium text-white">{tool.name}</div>
                                      <div className="text-xs text-gray-400 flex items-center space-x-1">
                                          <span>{tool.desc}</span>
                                          <span className="text-gray-600">•</span>
                                          <span className="text-[#00A6F4]">{tool.license}</span>
                                          <span className="text-gray-600">•</span>
                                          <a href="#" className="text-[#00A6F4] hover:underline">Source</a>
                                      </div>
                                  </div>
                              </div>
                              <div>
                                  {tool.status === 'installed' ? (
                                      <button className="flex items-center space-x-1.5 px-3 py-1 bg-[#3A3A3A] hover:bg-[#4A4A4A] rounded text-xs text-[#FF453A] transition-colors border border-white/5">
                                          <Trash2 size={12}/>
                                          <span>Uninstall</span>
                                      </button>
                                  ) : (
                                      <button className="flex items-center space-x-1.5 px-3 py-1 bg-[#3A3A3A] hover:bg-[#4A4A4A] rounded text-xs text-white transition-colors border border-white/5">
                                          <Cloud size={12}/>
                                          <span>Install</span>
                                      </button>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#FF9F0A] to-[#FF453A] rounded-2xl shadow-lg flex items-center justify-center mb-6">
                      <HardDrive size={48} className="text-white"/>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">LOCAL AI</h1>
                  <p className="text-gray-400 text-sm">Version 1.0 (Simulation)</p>
                  
                  <div className="mt-8 text-sm text-gray-500">
                      <p>Made by</p>
                      <p className="text-white font-medium mt-1">Enzo Nassif</p>
                  </div>

                  <div className="mt-12 text-xs text-gray-600">
                      <p>© 2025 Substage Simulation.</p>
                      <p>All rights reserved.</p>
                  </div>
              </div>
          )}

           {activeTab === 'general' && (
             <div className="flex items-center justify-center h-full text-gray-500">
                 General settings not available in this demo.
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;