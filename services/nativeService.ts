import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { SplashScreen } from '@capacitor/splash-screen';
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';

export const nativeService = {
  initialize: async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        // 1. Lock Orientation to Portrait
        try {
           await ScreenOrientation.lock({ orientation: 'portrait' });
        } catch (e) {
           console.log('Orientation lock failed (might be iPad)', e);
        }

        // 2. Style Status Bar (Match the deep purple background #312e81)
        try {
           await StatusBar.setStyle({ style: Style.Dark });
           await StatusBar.setBackgroundColor({ color: '#312e81' });
        } catch (e) {
           console.log('StatusBar styling failed', e);
        }
        
        // 3. Configure Keyboard
        // Resize body ensures the input fields stay visible when keyboard opens
        try {
           await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
           if (Capacitor.getPlatform() === 'ios') {
              await Keyboard.setAccessoryBarVisible({ isVisible: false });
           }
        } catch (e) {
           console.log('Keyboard config failed', e);
        }

        // 4. Hide Splash Screen (Wait a moment for React to render)
        setTimeout(async () => {
          try {
            await SplashScreen.hide();
          } catch (e) {
            console.log('SplashScreen hide failed', e);
          }
        }, 500);

      } catch (e) {
        console.warn('Native initialization failed', e);
      }
    }
  },

  haptics: {
    impactLight: async () => {
      if (Capacitor.isNativePlatform()) {
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch(e){}
      }
    },
    impactMedium: async () => {
      if (Capacitor.isNativePlatform()) {
        try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch(e){}
      }
    },
    impactHeavy: async () => {
      if (Capacitor.isNativePlatform()) {
        try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch(e){}
      }
    },
    notificationSuccess: async () => {
      if (Capacitor.isNativePlatform()) {
        try { await Haptics.notification({ type: NotificationType.Success }); } catch(e){}
      }
    },
    notificationError: async () => {
      if (Capacitor.isNativePlatform()) {
        try { await Haptics.notification({ type: NotificationType.Error }); } catch(e){}
      }
    }
  },

  share: async (title: string, text: string) => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: title,
          text: text,
          dialogTitle: 'Share your Score',
        });
        return true;
      } catch (e) {
        console.error('Share failed', e);
        return false;
      }
    } else {
      // Web Fallback
      if (navigator.share) {
        try {
          await navigator.share({ title, text });
          return true;
        } catch (e) {
          return false;
        }
      }
      return false;
    }
  },

  copyToClipboard: async (text: string) => {
    if (Capacitor.isNativePlatform()) {
      await Clipboard.write({ string: text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  }
};