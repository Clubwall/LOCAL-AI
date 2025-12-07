import React from 'react';
import { Terminal, AlertTriangle, Check, X, ArrowRight } from 'lucide-react';
import { GeneratedCommand, CommandCategory } from '../types';

interface CommandConfirmationProps {
  command: GeneratedCommand | null;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

const CommandConfirmation: React.FC<CommandConfirmationProps> = ({ command, onConfirm, onCancel, className = '' }) => {
  if (!command) return null;

  const isDestructive = command.category === CommandCategory.DELETE || command.category === CommandCategory.UNKNOWN;

  return (
    <div className={`bg-[#2A2A2A]/95 backdrop-blur-md rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col w-[90%] max-w-2xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 ${className}`}>
      
        <div className="flex items-center p-3 gap-3 bg-[#333]/90 border-b border-black/20">
             <div className={`p-1.5 rounded bg-black/20 ${isDestructive ? 'text-red-400' : 'text-blue-400'}`}>
                {isDestructive ? <AlertTriangle size={14} /> : <Terminal size={14} />}
             </div>
             <span className="text-xs font-medium text-gray-300 flex-1 truncate">
                 {command.explanation}
             </span>
             <div className="flex space-x-1">
                 <button 
                    onClick={onCancel}
                    className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                    title="Cancel"
                 >
                     <X size={14} />
                 </button>
             </div>
        </div>

        <div className="p-3 bg-[#1E1E1E]/80 font-mono text-xs text-green-400 break-all select-text">
            {command.command}
        </div>

        <div className="p-2 bg-[#262626]/90 flex justify-end border-t border-black/20">
             <button 
                onClick={onConfirm}
                className={`flex items-center space-x-1 px-4 py-1.5 rounded text-xs font-medium text-white transition-all shadow-md active:scale-95 ${
                    isDestructive ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'
                }`}
            >
                <span>Run Command</span>
                <ArrowRight size={12} />
            </button>
        </div>
    </div>
  );
};

export default CommandConfirmation;