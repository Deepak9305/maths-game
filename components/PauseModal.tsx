import React from 'react';
import { Play, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onQuit: () => void;
}

const PauseModal: React.FC<PauseModalProps> = ({ onResume, onQuit }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-indigo-500 animate-bounce-in">
        <h2 className="text-4xl font-black text-indigo-900 mb-6">PAUSED</h2>
        
        <div className="space-y-4">
          <button
            onClick={onResume}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-4 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6 fill-current" /> Resume
          </button>
          
          <button
            onClick={onQuit}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-xl font-bold py-4 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <Home className="w-6 h-6" /> Quit to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default PauseModal;