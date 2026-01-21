import React from 'react';
import { X, Video, Zap, Clock } from 'lucide-react';
import { RocketItem } from '../types';

interface ShopProps {
  coins: number;
  equippedRocket: string;
  ownedRockets: string[];
  powerUps: { hint: number; timeFreeze: number };
  rockets: RocketItem[];
  onEquip: (rocket: RocketItem) => void;
  onBuyPowerUp: (type: 'hint' | 'timeFreeze', cost: number) => void;
  onWatchAd: () => void;
  onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ 
  coins, 
  equippedRocket, 
  ownedRockets,
  powerUps,
  rockets, 
  onEquip, 
  onBuyPowerUp,
  onWatchAd, 
  onClose 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={onClose} className="mb-6 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors">
          <X className="w-6 h-6 text-white" />
        </button>
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 md:p-8 shadow-2xl overflow-y-auto max-h-[85vh]">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">🚀 Pilot Shop</h2>
          
          {/* Coin Balance & Ad Button */}
          <div className="flex flex-col items-center justify-center gap-4 mb-8 sticky top-0 bg-white/90 p-4 rounded-xl z-10 shadow-sm backdrop-blur">
             <span className="inline-block bg-yellow-100 text-yellow-800 px-6 py-2 rounded-full font-bold text-2xl border-4 border-yellow-300 shadow-sm">
                💰 {coins}
             </span>
             
             <button 
                onClick={onWatchAd}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg transition-transform hover:scale-105 active:scale-95"
             >
                <Video className="w-5 h-5" /> Free Coins (+50)
             </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Rocket Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">🛸</span> New Rides
              </h3>
              <div className="grid gap-3">
                {rockets.map((rocket, i) => {
                  const isEquipped = equippedRocket === rocket.icon;
                  const isOwned = ownedRockets.includes(rocket.icon);
                  const canAfford = coins >= rocket.cost;
                  
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl flex items-center justify-between transition-all border-b-4 ${
                        isEquipped
                          ? 'bg-blue-50 border-blue-400 shadow-md'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-4xl filter drop-shadow-sm">{rocket.icon}</div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-base">{rocket.name}</h3>
                          <p className="text-xs text-purple-600 font-bold mb-1">{rocket.perk}</p>
                          {isOwned ? (
                            <p className="text-xs font-bold text-green-600">✓ Owned</p>
                          ) : (
                            <p className="text-sm font-bold text-yellow-600">💰 {rocket.cost}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => onEquip(rocket)}
                        disabled={!isOwned && !canAfford}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all transform active:scale-95 ${
                          isEquipped
                            ? 'bg-green-500 text-white cursor-default'
                            : isOwned
                            ? 'bg-blue-500 text-white hover:bg-blue-600 shadow'
                            : canAfford
                            ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 shadow'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isEquipped ? 'In Use' : isOwned ? 'Equip' : 'Buy'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Power Up Station */}
            <div>
               <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚡</span> Power-Up Station
              </h3>
              <div className="space-y-3">
                
                {/* Buy Hint */}
                <div className="bg-purple-50 p-4 rounded-2xl border-b-4 border-purple-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-200 p-2 rounded-lg"><Zap className="w-6 h-6 text-purple-600" /></div>
                    <div>
                      <h4 className="font-bold text-gray-800">Hint</h4>
                      <p className="text-xs text-gray-500">You have: {powerUps.hint}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onBuyPowerUp('hint', 100)}
                    disabled={coins < 100}
                    className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all shadow-md active:scale-95"
                  >
                    Buy (100 💰)
                  </button>
                </div>

                {/* Buy Freeze */}
                <div className="bg-blue-50 p-4 rounded-2xl border-b-4 border-blue-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-200 p-2 rounded-lg"><Clock className="w-6 h-6 text-blue-600" /></div>
                    <div>
                      <h4 className="font-bold text-gray-800">Time Freeze</h4>
                      <p className="text-xs text-gray-500">You have: {powerUps.timeFreeze}</p>
                    </div>
                  </div>
                  <button 
                     onClick={() => onBuyPowerUp('timeFreeze', 150)}
                     disabled={coins < 150}
                     className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all shadow-md active:scale-95"
                  >
                    Buy (150 💰)
                  </button>
                </div>

              </div>
              
              <div className="mt-6 bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-xs text-yellow-800 text-center">
                Need more coins? <br/>Play <b>Hard Mode</b> or Challenge friends!
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Shop;