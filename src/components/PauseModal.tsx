import React, { useState } from 'react';
import { Play, Home, AlertTriangle } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onQuit: () => void;
  showAnimations: boolean;
  onToggleAnimations: () => void;
}

const PauseModal: React.FC<PauseModalProps> = ({ onResume, onQuit, showAnimations, onToggleAnimations }) => {
  const [confirmQuit, setConfirmQuit] = useState(false);

  return (
    <div role="dialog" aria-modal="true" aria-label="Game paused" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-indigo-500 animate-bounce-in">
        <h2 className="text-4xl font-black text-indigo-900 mb-6">PAUSED</h2>

        {confirmQuit ? (
          <div className="space-y-4">
            <div className="bg-red-50 rounded-2xl p-4 border-2 border-red-200 flex flex-col items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <p className="text-red-700 font-bold text-lg">Quit and lose progress?</p>
            </div>
            <button
              onClick={onQuit}
              className="w-full bg-red-500 hover:bg-red-600 text-white text-xl font-bold py-4 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3"
            >
              <Home className="w-6 h-6" /> Yes, Quit
            </button>
            <button
              onClick={() => setConfirmQuit(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl font-bold py-4 rounded-2xl transition-colors active:scale-95"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={onResume}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-4 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6 fill-current" /> Resume
            </button>

            <button
              onClick={onToggleAnimations}
              aria-pressed={showAnimations}
              className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-900 text-xl font-bold py-4 rounded-2xl shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              {showAnimations ? '✨ Effects: ON' : '✨ Effects: OFF'}
            </button>

            <button
              onClick={() => setConfirmQuit(true)}
              className="w-full bg-red-100 hover:bg-red-200 text-red-600 text-xl font-bold py-4 rounded-2xl shadow-sm transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              <Home className="w-6 h-6" /> Quit to Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PauseModal;