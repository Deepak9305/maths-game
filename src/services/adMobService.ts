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
    interstitial: 'ca-app-pub-7381421031784616/5188724059', // Production Interstitial
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

// Cooldown configuration
let lastInterstitialTime = 0;
const INTERSTITIAL_COOLDOWN_MS = 120000; // 2 minutes

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
          initializeForTesting: false, // Set to true only during local development
        });
        console.log('AdMob Initialized');
      } catch (e) {
        console.error('AdMob Init Failed', e);
      }
    }
  },

  showInterstitial: async (): Promise<void> => {
    const now = Date.now();
    if (now - lastInterstitialTime < INTERSTITIAL_COOLDOWN_MS) {
      console.log("Interstitial ad skipped (cooldown active)");
      return;
    }

    // 1. NATIVE IMPLEMENTATION
    if (isNative()) {
      try {
        const options: AdOptions = {
          adId: getAdUnitId('interstitial'),
          isTesting: false
        };
        await AdMob.prepareInterstitial(options);
        await AdMob.showInterstitial();
        lastInterstitialTime = Date.now();
      } catch (e) {
        console.error("AdMob Interstitial Failed", e);
        // Swallow error so game flow is never blocked by ad failure
      }
      return;
    }

    // 2. WEB FALLBACK (Simulation)
    await new Promise<void>((resolve) => {
      console.log("AdMob: Requesting Interstitial (Web Sim)...");
      setTimeout(() => {
        // Only show alert occasionally in sim to not be annoying
        if (Math.random() > 0.7) {
          alert("📺 [AdMob Simulation]\n\nThis is an Interstitial Ad.\n\n(On a real device, this would be a real Google Ad)");
        }
        lastInterstitialTime = Date.now();
        resolve();
      }, 500);
    });
  },

  showRewardVideo: async (): Promise<boolean> => {
    // 1. NATIVE IMPLEMENTATION
    if (isNative()) {
      return new Promise<boolean>((resolve) => {
        let resolved = false;
        let rewardHandle: any, failHandle: any, dismissHandle: any;
        let timeoutHandle: ReturnType<typeof setTimeout>;

        const safeResolve = (value: boolean) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutHandle);
            // Remove all listeners to prevent memory leaks and double-resolve
            try { rewardHandle?.remove(); } catch (_) { }
            try { failHandle?.remove(); } catch (_) { }
            try { dismissHandle?.remove(); } catch (_) { }
            resolve(value);
          }
        };

        // Hard 30-second timeout — if the ad never fires any event, unblock the game
        timeoutHandle = setTimeout(() => {
          console.warn('AdMob reward video timed out after 30s');
          safeResolve(false);
        }, 30000);

        const run = async () => {
          try {
            const options: RewardAdOptions = {
              adId: getAdUnitId('reward'),
              isTesting: false
            };
            await AdMob.prepareRewardVideoAd(options);

            // Rewarded: user watched the full ad
            rewardHandle = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
              safeResolve(true);
            });
            // FailedToLoad: ad could not load
            failHandle = await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
              safeResolve(false);
            });
            // Dismissed: user skipped before reward
            dismissHandle = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
              safeResolve(false);
            });

            await AdMob.showRewardVideoAd();
          } catch (e) {
            console.error("AdMob Reward Failed", e);
            safeResolve(false);
          }
        };

        run();
      });
    }

    // 2. WEB FALLBACK (Simulation)
    return new Promise((resolve) => {
      const userWantsToWatch = window.confirm("📺 [AdMob Simulation]\n\nWatch a 15-second video to earn 500 Coins?");
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