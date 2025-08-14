import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "react-native-gesture-handler";
import React from "react";

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
