import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useConfigStore } from "../src/store/configStore";

export default function Home() {
  const router = useRouter();
  const {
    hydrate,
    hasAnyConfig,
    loadTemplate,
    useLastConfig,
    templateSummary,
  } = useConfigStore();

  useEffect(() => {
    hydrate(true);
  }, []);

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.title}>満腹ジャンケン</Text>
        <Text style={s.sub}>前回の設定ですぐ始められます</Text>

        <TouchableOpacity
          style={[s.primaryBtn, !hasAnyConfig && s.disabled]}
          onPress={() => {
            useLastConfig();
            router.push("/game");
          }}
          disabled={!hasAnyConfig}
        >
          <Text style={s.primaryTxt}>前回の設定で開始</Text>
        </TouchableOpacity>

        <View style={{ height: 12 }} />

        <Text style={s.label}>お気に入りから開始</Text>
        {[0, 1, 2].map((i) => (
          <TouchableOpacity
            key={i}
            style={s.templateBtn}
            onPress={() => {
              loadTemplate(i);
              router.push("/game");
            }}
          >
            <Text style={s.templateTitle}>お気に入り {i + 1}</Text>
            <Text style={s.templateDesc}>{templateSummary(i)}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={s.link} onPress={() => router.push("/setup")}>
          <Text style={s.linkTxt}>設定を編集</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    alignItems: "stretch",
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#eef2f7",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  sub: { textAlign: "center", color: "#6b7280", marginBottom: 16 },
  label: { fontWeight: "700", marginTop: 8, marginBottom: 8 },
  primaryBtn: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryTxt: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.5 },
  templateBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
  },
  templateTitle: { fontWeight: "700" },
  templateDesc: { color: "#6b7280", marginTop: 2 },
  link: { marginTop: 12, alignItems: "center" },
  linkTxt: { color: "#2563eb", fontWeight: "700" },
});
