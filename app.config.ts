export default {
  expo: {
    name: "FullBelly Janken",
    slug: "fullbelly-janken",
    scheme: "fullbelly",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: { supportsTablet: false, bundleIdentifier: "com.example.fullbelly" },
    android: { package: "com.example.fullbelly" },
    extra: {
      // 将来Supabase使うなら EXPO_PUBLIC_* を追加
    },
  },
};
