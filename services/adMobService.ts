import { AdMob, AdOptions, RewardAdOptions, RewardAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// ==========================================
// ⚠️ IMPORTANT: NATIVE CONFIGURATION REQUIRED
// ==========================================
// To prevent the app from crashing, you MUST add an App ID to your native files.
// For development, use these Google Test App IDs:
//
// 1. ANDROID (android/app/src/main/AndroidManifest.xml):
//    Add this inside the <application> tag:
//    <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-3940256099942544~3347511713"/>
//
// 2. iOS (ios/App/App/Info.plist):
//    Add these keys:
//    <key>GADApplicationIdentifier</key>
//    <string>ca-app-pub-3940256099942544~1458002511</string>
// ==========================================

// Helper to safely check platform
const isNative = () => Capacitor.isNativePlatform();

// GOOGLE TEST AD UNITS (Safe for development)
// When you release to the store, replace these with your real Ad Unit IDs.
const AD_UNITS = {
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',       // Test Banner
    interstitial: 'ca-app-pub-3940256099942544/1033173712', // Test Interstitial
    reward: 'ca-app-pub-3940256099942544/5224354917',       // Test Reward
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',       // Test Banner
    interstitial: 'ca-app-pub-3940256099942544/4411468910', // Test Interstitial
    reward: 'ca-app-pub-3940256099942544/1712485313',       // Test Reward
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
        // iOS: Request tracking permission (ATT) before initializing
        if (Capacitor.getPlatform() === 'ios') {
            try {
                await AdMob.requestTrackingAuthorization();
            } catch (e) {
                console.log('Tracking authorization skipped or failed', e);
            }
        }

        // Initialize AdMob
        await AdMob.initialize({
          initializeForTesting: true, // Ensures test mode behavior
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
          
          // AdMob operations are async, but often we just want to fire and forget or wait for close.
          // Resolving immediately ensures game flow isn't blocked indefinitely if ad fails.
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
           
           // Listen for the reward event
           const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
              resolve(true);
           });
           
           // Listen for failure
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