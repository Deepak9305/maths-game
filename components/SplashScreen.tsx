import React from 'react';
import { Rocket } from 'lucide-react';

interface SplashScreenProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  onStart: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ playerName, setPlayerName, onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 flex items-center justify-center">
      <div className="text-center max-w-md w-full bg-white/10 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
        <Rocket className="w-24 h-24 mx-auto mb-6 text-yellow-400 animate-bounce" />
        <h1 className="text-6xl font-bold text-white mb-3 tracking-tight">Math Quest</h1>
        <p className="text-2xl text-yellow-300 mb-8 font-medium">🌟 Space Adventure! 🌟</p>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-6 py-4 text-xl rounded-2xl text-center mb-6 border-4 border-yellow-400 outline-none bg-white/90 focus:bg-white transition-colors"
          maxLength={20}
        />
        <button
          onClick={() => playerName.trim() && onStart()}
          disabled={!playerName.trim()}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-2xl font-bold py-6 rounded-2xl transition-all transform hover:scale-105 shadow-xl"
        >
          Start Adventure 🚀
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;
