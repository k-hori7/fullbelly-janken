import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useConfigStore } from "../src/store/configStore";

export default function Home() {
  const router = useRouter();
  const { hydrate, hasAnyConfig, loadTemplate, useLastConfig } =
    useConfigStore();

  useEffect(() => {
    hydrate();
  }, []);

  return (
    <View style={s.container}>
      <Text style={s.title}>満腹ジャンケン</Text>
      <TouchableOpacity
        style={[s.btn, !hasAnyConfig && s.btnDisabled]}
        onPress={() => {
          useLastConfig();
          router.push("/game");
        }}
        disabled={!hasAnyConfig}
      >
        <Text style={s.btnText}>すぐ始める（前回設定）</Text>
      </TouchableOpacity>

      <View style={{ height: 12 }} />

      <View style={s.row}>
        {[0, 1, 2].map((i) => (
          <TouchableOpacity
            key={i}
            style={s.template}
            onPress={() => {
              loadTemplate(i);
              router.push("/game");
            }}
          >
            <Text style={s.templateText}>テンプレ {i + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 16 }} />

      <TouchableOpacity
        style={[s.btn, s.secondary]}
        onPress={() => router.push("/setup")}
      >
        <Text style={s.btnText}>設定を編集</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },
  btn: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secondary: { backgroundColor: "#444" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  template: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  templateText: { fontWeight: "600" },
});
