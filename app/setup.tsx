import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useConfigStore } from "../src/store/configStore";
import { Pool } from "../src/types";

const POOLS: { key: Pool; label: string }[] = [
  { key: "rock", label: "🪨 グー" },
  { key: "scissors", label: "✂️ チョキ" },
  { key: "paper", label: "🧻 パー" },
];

export default function Setup() {
  const router = useRouter();
  const {
    hydrate,
    config,
    setPlayerName,
    setPointTarget,
    setScoring,
    setFixedPoint,
    foodsByPool,
    addFood,
    updateFood,
    deleteFood,
    toggleFood,
    saveTemplate,
    loadTemplate,
    saveAsLast,
  } = useConfigStore();

  useEffect(() => {
    hydrate(true);
  }, []);

  if (!config)
    return (
      <View style={s.container}>
        <Text>読み込み中...</Text>
      </View>
    );

  return (
    <View style={s.container}>
      <Text style={s.title}>設定</Text>

      <View style={s.box}>
        <Text style={s.label}>プレイヤー</Text>
        <View style={s.row}>
          <TextInput
            style={s.input}
            placeholder="P1"
            value={config.players.p1Name}
            onChangeText={(t) => setPlayerName("p1", t)}
          />
          <TextInput
            style={s.input}
            placeholder="P2"
            value={config.players.p2Name}
            onChangeText={(t) => setPlayerName("p2", t)}
          />
        </View>
      </View>

      <View style={s.box}>
        <Text style={s.label}>ルール</Text>
        <View style={s.row}>
          <TouchableOpacity
            style={[s.chip, config.rule.scoring === "fixed" && s.chipOn]}
            onPress={() => setScoring("fixed")}
          >
            <Text
              style={[
                s.chipTxt,
                config.rule.scoring === "fixed" && s.chipTxtOn,
              ]}
            >
              固定点
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.chip, config.rule.scoring === "nameLen" && s.chipOn]}
            onPress={() => setScoring("nameLen")}
          >
            <Text
              style={[
                s.chipTxt,
                config.rule.scoring === "nameLen" && s.chipTxtOn,
              ]}
            >
              名前の文字数
            </Text>
          </TouchableOpacity>
        </View>
        {config.rule.scoring === "fixed" && (
          <View style={{ marginTop: 8 }}>
            <Text>固定点：</Text>
            <TextInput
              keyboardType="number-pad"
              style={s.input}
              value={String(config.rule.fixedPointValue ?? 3)}
              onChangeText={(t) => setFixedPoint(Number(t || "0"))}
            />
          </View>
        )}
        <View style={{ marginTop: 8 }}>
          <Text>目標ポイント：</Text>
          <TextInput
            keyboardType="number-pad"
            style={s.input}
            value={String(config.rule.pointTarget)}
            onChangeText={(t) => setPointTarget(Number(t || "50"))}
          />
        </View>
      </View>

      {POOLS.map((pool) => (
        <View style={s.box} key={pool.key}>
          <Text style={s.label}>{pool.label} の候補</Text>
          <FlatList
            data={foodsByPool(pool.key)}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={s.foodRow}>
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  value={item.name}
                  onChangeText={(t) => updateFood(item.id, { name: t })}
                />
                <TouchableOpacity
                  style={[s.tgl, item.enabled ? s.tglOn : s.tglOff]}
                  onPress={() => toggleFood(item.id, !item.enabled)}
                >
                  <Text style={{ color: item.enabled ? "#fff" : "#111" }}>
                    {item.enabled ? "表示" : "非表示"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.del}
                  onPress={() => deleteFood(item.id)}
                >
                  <Text style={{ color: "#fff" }}>削除</Text>
                </TouchableOpacity>
              </View>
            )}
            ListFooterComponent={() => (
              <TouchableOpacity style={s.add} onPress={() => addFood(pool.key)}>
                <Text style={{ color: "#111", fontWeight: "600" }}>
                  ＋ 追加
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ))}

      <View style={s.row}>
        {[0, 1, 2].map((i) => (
          <TouchableOpacity
            key={i}
            style={s.btn}
            onPress={() => {
              Alert.alert("テンプレ", `テンプレ${i + 1} をどうしますか？`, [
                { text: "読み込む", onPress: () => loadTemplate(i) },
                { text: "上書き保存", onPress: () => saveTemplate(i) },
                { text: "キャンセル", style: "cancel" },
              ]);
            }}
          >
            <Text style={s.btnTxt}>テンプレ {i + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.row}>
        <TouchableOpacity
          style={[s.btn, s.primary]}
          onPress={() => {
            saveAsLast();
            Alert.alert("保存しました");
          }}
        >
          <Text style={s.btnTxtW}>前回設定として保存</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.btn, s.primary]}
          onPress={() => {
            saveAsLast();
            Alert.alert("ゲーム開始", "", [{ text: "OK", onPress: () => {} }]);
          }}
        >
          <Text style={s.btnTxtW}>保存のみ</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[s.start]}
        onPress={() => {
          saveAsLast();
          Alert.alert("開始します", "", [{ text: "OK", onPress: () => {} }]);
          router.push("/game");
        }}
      >
        <Text style={s.startTxt}>この設定で開始</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16, paddingTop: 48 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  box: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eef2f7",
  },
  label: { fontWeight: "700", marginBottom: 6 },
  row: { flexDirection: "row", gap: 8, marginTop: 8 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: "#e5e7eb",
  },
  chipOn: { backgroundColor: "#111" },
  chipTxt: { color: "#111", fontWeight: "600" },
  chipTxtOn: { color: "#fff" },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  tgl: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  tglOn: { backgroundColor: "#111" },
  tglOff: { backgroundColor: "#e5e7eb" },
  del: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  add: {
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  btn: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnTxt: { fontWeight: "700", color: "#111" },
  primary: { backgroundColor: "#111" },
  btnTxtW: { fontWeight: "700", color: "#fff" },
  start: {
    marginTop: 12,
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  startTxt: { color: "#fff", fontWeight: "700" },
});
