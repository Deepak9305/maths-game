# Capacitor-specific ProGuard rules
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends com.getcapacitor.NativePlugin
-keep public class * extends com.getcapacitor.Plugin
-keep public class * extends com.getcapacitor.Bridge
-keep public class * extends com.getcapacitor.BridgeActivity
-keep class com.getcapacitor.** { *; }

# Keeping JavaScript Interfaces for Capacitor plugin bridge
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Google AdMob (GMS) ProGuard rules
-keep class com.google.android.gms.ads.** { *; }
-keep interface com.google.android.gms.ads.** { *; }
-keep class com.google.android.gms.common.** { *; }
-keep interface com.google.android.gms.common.** { *; }

# Allow GMS to stay for Ads identity
-keep class com.google.android.gms.ads.identifier.AdvertisingIdClient { *; }
-keep class com.google.android.gms.ads.identifier.AdvertisingIdClient$Info { *; }

# Optimization for better stack traces in Google Play Console
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
