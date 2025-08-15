import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "react-native-gesture-handler";
import React, { useEffect } from "react";
import mobileAds from "react-native-google-mobile-ads";

export default function RootLayout() {
  useEffect(() => {
    mobileAds().initialize();
  }, []);
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
