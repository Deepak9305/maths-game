import React from 'react';
import { Rocket, Shield } from 'lucide-react';

interface SplashScreenProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  onStart: () => void;
  onPrivacy: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ playerName, setPlayerName, onStart, onPrivacy }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onStart();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="w-full max-w-md animate-fade-in-up z-10">
        <div className="text-center bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden">
          
          {/* Decorative background circle */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl pointer-events-none"></div>

          <Rocket className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 text-yellow-400 animate-bounce drop-shadow-lg" />
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight drop-shadow-md">
            Math Quest
          </h1>
          <p className="text-xl md:text-2xl text-yellow-300 mb-8 font-medium drop-shadow-sm">
            🌟 Space Adventure! 🌟
          </p>
          
          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="mb-6 relative">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter Pilot Name"
                className="w-full px-6 py-4 text-xl md:text-2xl font-bold rounded-2xl text-center border-4 border-yellow-400 focus:border-yellow-300 outline-none bg-white/95 focus:bg-white text-indigo-900 placeholder-indigo-300 shadow-inner transition-all transform focus:scale-[1.02]"
                maxLength={15}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>
            
            <button
              type="submit"
              disabled={!playerName.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-white text-2xl font-bold py-4 md:py-5 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl border-b-4 border-green-700/50"
            >
              Launch 🚀
            </button>
          </form>
        </div>
      </div>

      <button 
        onClick={onPrivacy}
        className="mt-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium z-10"
      >
        <Shield className="w-4 h-4" /> Privacy Policy
      </button>
    </div>
  );
};

export default SplashScreen;