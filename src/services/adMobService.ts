import {
  AdMob,
  AdOptions,
  RewardAdOptions,
  RewardAdPluginEvents,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
  MaxAdContentRating,
  InterstitialAdPluginEvents
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

// Meta (Facebook) Ads is supported via AdMob Mediation.
// No extra code is needed here; mediation is configured in the AdMob console.

// Native app IDs are configured in AndroidManifest.xml and the iOS Info.plist.
// Keep these ad unit IDs public, but use AdMob test-device tooling when testing.
const isNative = () => Capacitor.isNativePlatform();
const isDevelopment = Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV);

const AD_UNITS = {
  android: {
    banner: 'ca-app-pub-7381421031784616/2912148146',
    interstitial: 'ca-app-pub-7381421031784616/5188724059',
    reward: 'ca-app-pub-7381421031784616/4033658128'
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    reward: 'ca-app-pub-3940256099942544/1712485313'
  }
};

const getAdUnitId = (type: 'banner' | 'interstitial' | 'reward') => {
  return Capacitor.getPlatform() === 'ios' ? AD_UNITS.ios[type] : AD_UNITS.android[type];
};

const INTERSTITIAL_COOLDOWN_MS = 120000;
const AD_LOAD_TIMEOUT_MS = 8000;
const REWARDED_TIMEOUT_MS = 30000;
type RewardPurpose = 'double-coins' | 'continue' | 'power-up' | 'coins';

const WEB_REWARD_MESSAGES: Record<RewardPurpose, string> = {
  'double-coins': 'Watch a short video to double this mission\'s coins?',
  continue: 'Watch a short video to restore one life and continue this mission?',
  'power-up': 'Watch a short video to unlock the requested power-ups?',
  coins: 'Watch a short video to earn 500 coins?'
};

let initialized = false;
let initializePromise: Promise<void> | null = null;
let bannerRequested = false;
let bannerVisible = false;
let bannerVisibilityQueue = Promise.resolve();
let lastInterstitialTime = 0;
let interstitialReady = false;
let interstitialLoading: Promise<boolean> | null = null;
let interstitialShowing = false;
let rewardReady = false;
let rewardLoading: Promise<boolean> | null = null;
let rewardShowing = false;

const logAdEvent = (event: string, details?: Record<string, unknown>) => {
  if (isDevelopment) console.debug(`[ads] ${event}`, details ?? {});
};

const logAdFailure = (event: string, error?: unknown) => {
  if (isDevelopment) console.warn(`[ads] ${event}`, error ?? 'unknown error');
};

const withTimeout = async <T>(operation: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(`Ad operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
};

const applyBannerVisibility = async () => {
  if (!isNative() || !initialized) return;

  try {
    if (bannerRequested) {
      if (bannerVisible) return;
      const options: BannerAdOptions = {
        adId: getAdUnitId('banner'),
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: false
      };
      await AdMob.showBanner(options);
      bannerVisible = true;
      logAdEvent('banner_shown');
    } else {
      // Always ask the native plugin to remove the banner. The WebView can lose
      // its local visibility flag while the native ad view remains attached.
      await AdMob.removeBanner();
      bannerVisible = false;
      logAdEvent('banner_hidden');
    }
  } catch (error) {
    logAdFailure(bannerRequested ? 'banner_failed' : 'banner_hide_failed', error);
  }
};

const requestBannerVisibility = (visible: boolean): Promise<void> => {
  bannerRequested = visible;
  bannerVisibilityQueue = bannerVisibilityQueue.then(applyBannerVisibility);
  return bannerVisibilityQueue;
};

const loadInterstitial = async (): Promise<boolean> => {
  if (!isNative() || !initialized || interstitialReady) {
    return interstitialReady;
  }
  if (interstitialLoading) return interstitialLoading;

  interstitialLoading = (async () => {
    try {
      const options: AdOptions = {
        adId: getAdUnitId('interstitial'),
        isTesting: false
      };
      await withTimeout(AdMob.prepareInterstitial(options), AD_LOAD_TIMEOUT_MS);
      interstitialReady = true;
      logAdEvent('interstitial_loaded');
      return true;
    } catch (error) {
      interstitialReady = false;
      logAdFailure('interstitial_failed_to_load', error);
      return false;
    }
  })();

  try {
    return await interstitialLoading;
  } finally {
    interstitialLoading = null;
  }
};

const loadRewardVideo = async (): Promise<boolean> => {
  if (!isNative() || !initialized || rewardReady) {
    return rewardReady;
  }
  if (rewardLoading) return rewardLoading;

  rewardLoading = (async () => {
    try {
      const options: RewardAdOptions = {
        adId: getAdUnitId('reward'),
        isTesting: false
      };
      await withTimeout(AdMob.prepareRewardVideoAd(options), AD_LOAD_TIMEOUT_MS);
      rewardReady = true;
      logAdEvent('reward_loaded');
      return true;
    } catch (error) {
      rewardReady = false;
      logAdFailure('reward_failed_to_load', error);
      return false;
    }
  })();

  try {
    return await rewardLoading;
  } finally {
    rewardLoading = null;
  }
};

const preloadInterstitial = () => loadInterstitial();

const preloadRewardVideo = () => {
  if (rewardShowing) return Promise.resolve(rewardReady);
  return loadRewardVideo();
};

const initialize = async (): Promise<void> => {
  if (!isNative() || initialized) return;
  if (initializePromise) return initializePromise;

  initializePromise = (async () => {
    try {
      if (Capacitor.getPlatform() === 'ios') {
        try {
          await AdMob.requestTrackingAuthorization();
        } catch (error) {
          logAdFailure('tracking_authorization_skipped', error);
        }
      }

      await withTimeout(AdMob.initialize({
        initializeForTesting: false,
        maxAdContentRating: MaxAdContentRating.General,
        // Conservative defaults for this mixed/unknown-age audience.
        tagForChildDirectedTreatment: true,
        tagForUnderAgeOfConsent: true
      }), AD_LOAD_TIMEOUT_MS);
      initialized = true;
      logAdEvent('initialized');

      // Preloading and banner reconciliation must never delay the app UI.
      void preloadInterstitial();
      void preloadRewardVideo();
      void requestBannerVisibility(bannerRequested);
    } catch (error) {
      logAdFailure('initialize_failed', error);
    }
  })();

  try {
    await initializePromise;
  } finally {
    initializePromise = null;
  }
};

const showInterstitial = async (): Promise<boolean> => {
  const now = Date.now();
  if (now - lastInterstitialTime < INTERSTITIAL_COOLDOWN_MS || interstitialShowing) {
    logAdEvent('interstitial_skipped', { reason: interstitialShowing ? 'already_showing' : 'cooldown' });
    return false;
  }

  interstitialShowing = true;
  if (!isNative()) {
    try {
      if (!isDevelopment) return false;
      await new Promise(resolve => setTimeout(resolve, 300));
      lastInterstitialTime = Date.now();
      logAdEvent('interstitial_simulated');
      return true;
    } finally {
      interstitialShowing = false;
    }
  }

  let failedToShow = false;
  const listenerHandles: PluginListenerHandle[] = [];
  const cleanup = () => {
    listenerHandles.forEach(handle => {
      void handle.remove().catch(() => undefined);
    });
  };

  try {
    if (!initialized || !interstitialReady) return false;

    interstitialReady = false;
    listenerHandles.push(await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, error => {
      failedToShow = true;
      logAdFailure('interstitial_failed_to_show', error);
    }));
    listenerHandles.push(await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      logAdEvent('interstitial_dismissed');
    }));

    await AdMob.showInterstitial();
    if (failedToShow) return false;

    lastInterstitialTime = Date.now();
    logAdEvent('interstitial_shown');
    return true;
  } catch (error) {
    logAdFailure('interstitial_failed_to_show', error);
    return false;
  } finally {
    cleanup();
    interstitialShowing = false;
    void preloadInterstitial();
  }
};

const showRewardVideo = async (purpose: RewardPurpose = 'coins'): Promise<boolean> => {
  if (!isNative()) {
    if (!isDevelopment) {
      logAdEvent('reward_unavailable_on_web', { purpose });
      return false;
    }

    const userWantsToWatch = window.confirm(`[AdMob development simulation]\n\n${WEB_REWARD_MESSAGES[purpose]}`);
    if (!userWantsToWatch) {
      logAdEvent('reward_cancelled', { purpose });
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, 800));
    logAdEvent('reward_granted_in_development', { purpose });
    return true;
  }

  if (rewardShowing) {
    logAdEvent('reward_skipped', { purpose, reason: 'already_showing' });
    return false;
  }

  await initialize();
  if (!initialized) return false;
  if (rewardShowing) {
    logAdEvent('reward_skipped', { purpose, reason: 'already_showing' });
    return false;
  }

  rewardShowing = true;
  let settled = false;
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const listenerHandles: PluginListenerHandle[] = [];

  const cleanup = () => {
    if (timeoutHandle) clearTimeout(timeoutHandle);
    listenerHandles.forEach(handle => {
      void handle.remove().catch(() => undefined);
    });
  };

  const result = await new Promise<boolean>(resolve => {
    const finish = (rewarded: boolean, event: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      logAdEvent(event, { purpose });
      resolve(rewarded);
    };

    const run = async () => {
      try {
        listenerHandles.push(await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => finish(true, 'reward_granted')));
        listenerHandles.push(await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => finish(false, 'reward_failed_to_load')));
        listenerHandles.push(await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => finish(false, 'reward_failed_to_show')));
        listenerHandles.push(await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => finish(false, 'reward_dismissed')));

        timeoutHandle = setTimeout(() => finish(false, 'reward_timeout'), REWARDED_TIMEOUT_MS);

        if (!rewardReady) {
          const loaded = await loadRewardVideo();
          if (!loaded) {
            finish(false, 'reward_unavailable');
            return;
          }
        }

        rewardReady = false;
        await AdMob.showRewardVideoAd();
        if (!settled) finish(false, 'reward_completed_without_event');
      } catch (error) {
        logAdFailure('reward_failed_to_show', error);
        finish(false, 'reward_error');
      }
    };

    void run();
  });

  rewardShowing = false;
  void preloadRewardVideo();
  return result;
};

export const adMobService = {
  initialize,
  preloadInterstitial,
  preloadRewardVideo,
  showInterstitial,
  showRewardVideo,
  showBanner: () => requestBannerVisibility(true),
  hideBanner: () => requestBannerVisibility(false),
  setBannerVisible: requestBannerVisibility
};
