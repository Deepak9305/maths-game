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
        staggerChildren: 0.05,
        delayChildren: 0
      }
    }
  };

  const itemVariants: any = {
    hidden: { y: 8, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 320, damping: 26, duration: 0.2 }
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-3 sm:p-4">
      <motion.div
        className="w-full max-w-md z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-3xl border border-white/20 bg-white/10 p-5 text-center shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-7">

          {/* Decorative background circle */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-purple-500/25"></div>
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-blue-500/25"></div>

          <motion.div
            variants={itemVariants}
            initial={{ scale: 0.92, rotate: 0 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24, duration: 0.25 }}
          >
            {logoFailed ? (
              <div className="text-8xl md:text-9xl mb-4 mx-auto text-center">🚀</div>
            ) : (
              <img
                src="/logo.png"
                className="mx-auto mb-3 h-36 w-36 object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.45)] sm:h-48 sm:w-48 md:h-64 md:w-64"
                alt="Math Quest Logo"
                onError={() => setLogoFailed(true)}
              />
            )}
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mb-2 text-4xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl md:text-6xl"
          >
            Math Quest
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mb-5 text-lg font-medium text-yellow-300 drop-shadow-sm sm:mb-8 sm:text-xl md:text-2xl"
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
                className="w-full rounded-2xl border-4 border-yellow-400 bg-white/95 px-5 py-3 text-lg font-bold text-indigo-900 text-center outline-none shadow-inner transition-all focus:border-yellow-300 focus:bg-white focus:scale-[1.01] sm:py-4 sm:text-xl md:text-2xl"
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
              className="w-full rounded-2xl border-b-4 border-green-700/50 bg-gradient-to-r from-green-500 to-blue-500 py-3.5 text-xl font-bold text-white shadow-xl hover:from-green-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-50 sm:py-4 md:py-5 md:text-2xl"
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
