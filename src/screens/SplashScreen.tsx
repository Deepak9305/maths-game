import React, { useState } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  onStart: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ playerName, setPlayerName, onStart }) => {
  const [logoFailed, setLogoFailed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onStart();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <motion.div
        className="w-full max-w-md z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden">

          {/* Decorative background circle */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl pointer-events-none"></div>

          <motion.div
            variants={itemVariants}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          >
            {logoFailed ? (
              <div className="text-8xl md:text-9xl mb-4 mx-auto text-center">🚀</div>
            ) : (
              <img
                src="/logo.png"
                className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-4 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
                alt="Math Quest Logo"
                onError={() => setLogoFailed(true)}
              />
            )}
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight drop-shadow-md"
          >
            Math Quest
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-yellow-300 mb-8 font-medium drop-shadow-sm"
          >
            🌟 Space Adventure! 🌟
          </motion.p>

          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="relative z-10">
            <div className="mb-6 relative">
              <label htmlFor="pilotName" className="sr-only">Pilot Name</label>
              <input
                id="pilotName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter Pilot Name"
                className="w-full px-6 py-4 text-xl md:text-2xl font-bold rounded-2xl text-center border-4 border-yellow-400 focus:border-yellow-300 outline-none bg-white/95 focus:bg-white text-indigo-900 placeholder-indigo-300 shadow-inner transition-all transform focus:scale-[1.02]"
                maxLength={15}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!playerName.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-white text-2xl font-bold py-4 md:py-5 rounded-2xl shadow-xl border-b-4 border-green-700/50"
            >
              Launch 🚀
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;