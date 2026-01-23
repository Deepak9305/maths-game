import React from 'react';
import { Video, X, Zap, Clock } from 'lucide-react';

interface PowerUpAdModalProps {
  type: 'hint' | 'timeFreeze';
  onWatch: () => void;
  onClose: () => void;
}

const PowerUpAdModal: React.FC<PowerUpAdModalProps> = ({ type, onWatch, onClose }) => {
  const isHint = type === 'hint';
  const title = isHint ? "Need a Hint?" : "Frozen in Time?";
  const Icon = isHint ? Zap : Clock;
  const color = isHint ? "text-blue-500" : "text-purple-500";
  const bgColor = isHint ? "bg-blue-100" : "bg-purple-100";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl border-4 border-white relative animate-bounce-in overflow-hidden">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        <div className={`mx-auto w-20 h-20 ${bgColor} rounded-full flex items-center justify-center mb-6 shadow-inner`}>
          <Icon className={`w-10 h-10 ${color}`} />
        </div>

        <h2 className="text-2xl font-black text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-500 font-medium mb-8">
          Watch a short video to get <br/>
          <span className={`font-bold ${color} text-lg`}>+3 FREE {isHint ? 'Hints' : 'Freezes'}</span>!
        </p>

        <div className="space-y-3">
          <button
            onClick={onWatch}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg font-bold py-4 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <Video className="w-6 h-6" /> Watch Video
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-2xl transition-colors"
          >
            No Thanks
          </button>
        </div>
      </div>
    </div>
  );
};

export default PowerUpAdModal;