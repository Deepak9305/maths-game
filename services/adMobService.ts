import { AdMob, AdOptions, RewardAdOptions, RewardAdPluginEvents, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Helper to safely check platform
const isNative = () => Capacitor.isNativePlatform();

// REPLACE WITH YOUR REAL AD UNIT IDS FOR PRODUCTION
const AD_UNITS = {
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111', // Test ID
    interstitial: 'ca-app-pub-3940256099942544/1033173712', // Test ID
    reward: 'ca-app-pub-3940256099942544/5224354917', // Test ID
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    reward: 'ca-app-pub-3940256099942544/1712485313',
  }
};

const getAdUnitId = (type: 'banner' | 'interstitial' | 'reward') => {
  const platform = Capacitor.getPlatform();
  if (platform === 'ios') return AD_UNITS.ios[type];
  return AD_UNITS.android[type];
};

export const adMobService = {
  initialize: async () => {
    if (isNative()) {
      try {
        await AdMob.initialize({
          requestTrackingAuthorization: true,
          // testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'], // Add device IDs here
          initializeForTesting: true,
        });
        console.log('AdMob Initialized');
      } catch (e) {
        console.error('AdMob Init Failed', e);
      }
    }
  },

  showInterstitial: async (): Promise<void> => {
    // 1. NATIVE IMPLEMENTATION
    if (isNative()) {
      return new Promise(async (resolve) => {
        try {
          const options: AdOptions = {
            adId: getAdUnitId('interstitial'),
            isTesting: true 
          };
          await AdMob.prepareInterstitial(options);
          await AdMob.showInterstitial();
          
          // AdMob doesn't strictly provide a "closed" promise for showInterstitial in all versions 
          // easily, but typically the game pauses. For simplicity, we resolve immediately 
          // or you can add a listener for 'onAdDismissed'.
          resolve();
        } catch (e) {
          console.error("AdMob Interstitial Failed", e);
          resolve(); // Resolve anyway so game continues
        }
      });
    }

    // 2. WEB FALLBACK (Simulation)
    return new Promise((resolve) => {
      console.log("AdMob: Requesting Interstitial (Web Sim)...");
      setTimeout(() => {
        // Only show alert occasionally in sim to not be annoying
        if (Math.random() > 0.7) {
            alert("📺 [AdMob Simulation]\n\nThis is an Interstitial Ad.\n\n(On a real device, this would be a real Google Ad)");
        }
        resolve();
      }, 500);
    });
  },

  showRewardVideo: async (): Promise<boolean> => {
    // 1. NATIVE IMPLEMENTATION
    if (isNative()) {
       return new Promise(async (resolve) => {
         try {
           const options: RewardAdOptions = {
             adId: getAdUnitId('reward'),
             isTesting: true
           };
           await AdMob.prepareRewardVideoAd(options);
           
           const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
              resolve(true);
           });
           
           const failedListener = await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (info) => {
             resolve(false);
           });

           await AdMob.showRewardVideoAd();
         } catch (e) {
           console.error("AdMob Reward Failed", e);
           resolve(false);
         }
       });
    }

    // 2. WEB FALLBACK (Simulation)
    return new Promise((resolve) => {
      const userWantsToWatch = window.confirm("📺 [AdMob Simulation]\n\nWatch a 15-second video to earn 50 Coins?");
      if (userWantsToWatch) {
        setTimeout(() => {
          alert("🎉 Ad Complete! Reward Granted.");
          resolve(true);
        }, 1500);
      } else {
        resolve(false);
      }
    });
  }
};