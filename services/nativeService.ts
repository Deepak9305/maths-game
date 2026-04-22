import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { SplashScreen } from '@capacitor/splash-screen';
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Network } from '@capacitor/network';
import { Dialog } from '@capacitor/dialog';
import { Toast } from '@capacitor/toast';

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
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
      }
    },
    impactMedium: async () => {
      if (Capacitor.isNativePlatform()) {
        try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) { }
      }
    },
    impactHeavy: async () => {
      if (Capacitor.isNativePlatform()) {
        try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch (e) { }
      }
    },
    notificationSuccess: async () => {
      if (Capacitor.isNativePlatform()) {
        try { await Haptics.notification({ type: NotificationType.Success }); } catch (e) { }
      }
    },
    notificationError: async () => {
      if (Capacitor.isNativePlatform()) {
        try { await Haptics.notification({ type: NotificationType.Error }); } catch (e) { }
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
  },

  notifications: {
    requestPermissions: async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          return await LocalNotifications.requestPermissions();
        } catch (e) {
          console.error('Notification permission request failed', e);
        }
      }
    },
    schedule: async (title: string, body: string, delayMs: number = 5000) => {
      if (Capacitor.isNativePlatform()) {
        try {
          await LocalNotifications.schedule({
            notifications: [
              {
                title,
                body,
                id: new Date().getTime(),
                schedule: { at: new Date(Date.now() + delayMs) },
                actionTypeId: '',
                extra: null
              }
            ]
          });
        } catch (e) {
          console.error('Failed to schedule notification', e);
        }
      }
    },
    scheduleRecurring: async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Clear any existing scheduled notifications
          const pending = await LocalNotifications.getPending();
          if (pending.notifications.length > 0) {
            await LocalNotifications.cancel({ notifications: pending.notifications });
          }

          const messages = [
            { title: "🚀 We Miss You!", body: "Your space pet is wondering where you are. Come back and play!" },
            { title: "⚔️ Challenge Ready", body: "Are you brave enough for Survival mode today? Jump in!" },
            { title: "💰 Daily Missions", body: "New daily missions mean new coins! Upgrade your rocket today." },
            { title: "🔥 Keep Your Streak", body: "Don't lose your math streak! Take a fast flight right now." },
            { title: "👽 Hungry Pet?", body: "Your cosmic companion might need feeding. Check on them!" },
            { title: "🌌 The Universe Needs You", body: "We're waiting for our favorite math commander to return." }
          ];

          const now = new Date();
          const notificationsToSchedule = [];

          for (let i = 0; i < messages.length; i++) {
            const scheduleDate = new Date(now);
            // Move forward by exactly (i + 1) * 2 days
            scheduleDate.setDate(scheduleDate.getDate() + ((i + 1) * 2));
            // Force it to 7:30 PM (19:30) local time precisely
            scheduleDate.setHours(19, 30, 0, 0);

            notificationsToSchedule.push({
              title: messages[i].title,
              body: messages[i].body,
              id: 2000 + i, // Fixed sequence IDs
              schedule: { at: scheduleDate },
              actionTypeId: '',
              extra: null
            });
          }

          await LocalNotifications.schedule({ notifications: notificationsToSchedule });
          console.log('Scheduled sequence of 6 bi-daily notifications starting at 19:30');
        } catch (e) {
          console.error('Failed to schedule recurring notifications', e);
        }
      }
    }
  },

  network: {
    getStatus: async () => {
      try {
        return await Network.getStatus();
      } catch (e) {
        console.error('Failed to get network status', e);
        return null;
      }
    }
  },

  ui: {
    showToast: async (text: string) => {
      try {
        await Toast.show({ text });
      } catch (e) {
        console.error('Failed to show toast', e);
      }
    },
    showAlert: async (title: string, message: string) => {
      try {
        await Dialog.alert({ title, message });
      } catch (e) {
        console.error('Failed to show alert', e);
      }
    }
  }
};