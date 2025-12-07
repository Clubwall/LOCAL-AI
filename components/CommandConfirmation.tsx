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
    <div className={`absolute z-50 bg-[#2A2A2A] rounded-lg shadow-xl border border-white/10 overflow-hidden flex flex-col w-[90%] max-w-2xl ${className}`}>
      
        <div className="flex items-center p-3 gap-3 bg-[#333]">
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

        <div className="p-3 bg-[#1E1E1E] font-mono text-xs text-green-400 border-t border-b border-black/20 break-all">
            {command.command}
        </div>

        <div className="p-2 bg-[#262626] flex justify-end">
             <button 
                onClick={onConfirm}
                className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium text-white transition-colors ${
                    isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                <span>Run</span>
                <ArrowRight size={12} />
            </button>
        </div>
    </div>
  );
};

export default CommandConfirmation;