import React from 'react';
import { X } from 'lucide-react';
import { RocketItem } from '../types';

interface ShopProps {
  coins: number;
  equippedRocket: string;
  rockets: RocketItem[];
  onEquip: (rocket: RocketItem) => void;
  onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ coins, equippedRocket, rockets, onEquip, onClose }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={onClose} className="mb-6 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors">
          <X className="w-6 h-6 text-white" />
        </button>
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">🛒 Rocket Shop</h2>
          <div className="text-center mb-8">
             <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full font-bold text-sm">
                Your Balance: 💰 {coins}
             </span>
          </div>
          
          <div className="grid gap-4">
            {rockets.map((rocket, i) => {
              const isEquipped = equippedRocket === rocket.icon;
              const canAfford = coins >= rocket.cost;
              const isOwned = rocket.cost === 0; // Simplified ownership logic for demo: expensive ones are rebought or owned if logic was complex. For now, just check afford.
              
              return (
                <div
                  key={i}
                  className={`p-4 rounded-2xl flex items-center justify-between transition-all ${
                    isEquipped
                      ? 'bg-blue-50 border-2 border-blue-400 shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-5xl filter drop-shadow-md">{rocket.icon}</div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{rocket.name}</h3>
                      <p className={`text-sm font-medium ${rocket.cost === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {rocket.cost === 0 ? 'Free' : `💰 ${rocket.cost}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onEquip(rocket)}
                    disabled={!canAfford && rocket.cost > 0 && !isEquipped}
                    className={`px-6 py-3 rounded-xl font-bold transition-all transform active:scale-95 ${
                      isEquipped
                        ? 'bg-green-500 text-white cursor-default'
                        : canAfford
                        ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-blue-500/30'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isEquipped ? '✓ Equipped' : 'Equip'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
