import React, { useState, useEffect, useRef } from 'react';
import { Settings, Clock, ChevronRight, Loader2, HardDrive } from 'lucide-react';

interface InputBarProps {
  onOpenSettings: () => void;
  onSubmit: (query: string) => void;
  isProcessing: boolean;
  lastCommandStatus?: 'success' | 'error' | 'pending' | null;
  statusMessage?: string;
  className?: string; // Allow parent to control positioning
}

const InputBar: React.FC<InputBarProps> = ({ 
  onOpenSettings, 
  onSubmit, 
  isProcessing,
  lastCommandStatus,
  statusMessage,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query);
      setQuery('');
    }
  };

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div className="relative group">
        
        <form onSubmit={handleSubmit} className="relative flex items-center bg-[#1E1E1E] border-t border-white/10 p-2 transition-all duration-300">
          
          {/* Status Indicator / Icon */}
          <div className="flex items-center justify-center w-8 h-8 ml-1 rounded-full bg-[#2A2A2A]">
            {isProcessing ? (
              <Loader2 className="animate-spin text-white/50" size={16} />
            ) : (
              <div className={`w-2.5 h-2.5 rounded-full ${
                  lastCommandStatus === 'success' ? 'bg-green-500' :
                  lastCommandStatus === 'error' ? 'bg-red-500' :
                  'bg-[#3A3A3A] group-hover:bg-[#4A4A4A]'
              }`}></div>
            )}
          </div>

          <ChevronRight className="text-gray-500 ml-2 animate-pulse" size={18} />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={statusMessage || "Ask Local AI..."}
            className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 focus:outline-none px-3 text-sm font-light h-10"
            disabled={isProcessing}
          />

          <div className="flex items-center space-x-1 mr-2">
            <div className="flex items-center space-x-1.5 px-2 py-1 bg-[#2A2A2A] rounded border border-white/5 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
                <HardDrive size={10} className="text-green-400"/>
                <span className="text-[10px] text-gray-300 font-medium">
                    Llama 3
                </span>
            </div>

            <button type="button" className="p-1.5 text-gray-500 hover:text-white transition-colors">
              <Clock size={16} />
            </button>
            <button 
                type="button" 
                onClick={onOpenSettings}
                className="p-1.5 text-gray-500 hover:text-white transition-colors hover:rotate-90 duration-500"
            >
              <Settings size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputBar;