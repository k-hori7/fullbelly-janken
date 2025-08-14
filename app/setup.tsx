// app/setup.tsx
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useConfigStore } from "../src/store/configStore";

export default function Setup() {
  const router = useRouter();
  const {
    hydrate,
    config,
    setPlayerName,
    setPointTarget,
    setScoring,
    setFixedPoint,
    foods,
    addFood,
    updateFood,
    deleteFood,
    toggleFood,
    saveTemplate,
    loadTemplate,
    saveAsLast,
  } = useConfigStore();

  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      await hydrate(true);
      setReady(true);
    })();
  }, []);

  if (!ready || !config) {
    return (
      <View style={[s.center, { backgroundColor: "#fff" }]}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  const list = foods();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* タイトル */}
        <Text style={s.title}>設定</Text>

        {/* プレイヤー */}
        <View style={s.box}>
          <Text style={s.label}>プレイヤー</Text>
          <View style={s.row}>
            <TextInput
              style={[s.input, s.flex1]}
              placeholder="P1"
              value={config.players.p1Name}
              onChangeText={(t) => setPlayerName("p1", t)}
              returnKeyType="next"
            />
            <TextInput
              style={[s.input, s.flex1]}
              placeholder="P2"
              value={config.players.p2Name}
              onChangeText={(t) => setPlayerName("p2", t)}
              returnKeyType="done"
            />
          </View>
        </View>

        {/* ルール */}
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
            <View style={[s.row, { marginTop: 8 }]}>
              <Text style={s.help}>固定点：</Text>
              <TextInput
                keyboardType="number-pad"
                style={[s.input, { width: 100 }]}
                value={String(config.rule.fixedPointValue ?? 3)}
                onChangeText={(t) => setFixedPoint(Number(t || "0"))}
              />
            </View>
          )}

          <View style={[s.row, { marginTop: 8 }]}>
            <Text style={s.help}>目標ポイント：</Text>
            <TextInput
              keyboardType="number-pad"
              style={[s.input, { width: 120 }]}
              value={String(config.rule.pointTarget)}
              onChangeText={(t) => setPointTarget(Number(t || "50"))}
            />
          </View>
        </View>

        {/* 候補（全手共通） */}
        <View style={s.box}>
          <Text style={s.label}>候補（全手共通）</Text>
          <Text style={s.help}>
            ここに登録した候補から毎ラウンド3つを抽選します。候補が3つ以上なら重複なし、3つ以下なら重複あり。
          </Text>

          <View style={{ marginTop: 8 }}>
            {list.map((item) => (
              <View key={item.id} style={s.foodRow}>
                <TextInput
                  style={[s.input, s.flex1]}
                  value={item.name}
                  placeholder="料理名を入力（例：からあげ）"
                  onChangeText={(t) => updateFood(item.id, { name: t })}
                  returnKeyType="done"
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
            ))}

            <TouchableOpacity style={s.add} onPress={() => addFood()}>
              <Text style={{ fontWeight: "700" }}>＋ 候補を追加</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* お気に入り（テンプレ） */}
        <View style={s.box}>
          <Text style={s.label}>お気に入り</Text>
          <Text style={s.help}>よく使う設定を保存できます（3つまで）。</Text>
          <View style={[s.row, { marginTop: 8 }]}>
            {[0, 1, 2].map((i) => (
              <TouchableOpacity
                key={i}
                style={[s.btn, s.flex1]}
                onPress={() => {
                  Alert.alert("お気に入り", `お気に入り ${i + 1}`, [
                    { text: "読み込む", onPress: () => loadTemplate(i) },
                    { text: "上書き保存", onPress: () => saveTemplate(i) },
                    { text: "キャンセル", style: "cancel" },
                  ]);
                }}
              >
                <Text style={s.btnTxt}>お気に入り {i + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 保存/開始 */}
        <View style={[s.row, { marginTop: 4 }]}>
          <TouchableOpacity
            style={[s.btn, s.primary, s.flex1]}
            onPress={async () => {
              await saveAsLast();
              Alert.alert("保存しました");
            }}
          >
            <Text style={s.btnTxtW}>前回設定として保存</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btn, s.primary, s.flex1]}
            onPress={async () => {
              await saveAsLast();
              router.push("/game");
            }}
          >
            <Text style={s.btnTxtW}>この設定で開始</Text>
          </TouchableOpacity>
        </View>

        {/* 下余白（キーボード対策） */}
        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 48,
    paddingBottom: 48,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 12 },
  box: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eef2f7",
  },
  label: { fontWeight: "700", marginBottom: 6 },
  help: { color: "#6b7280", fontSize: 12 },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    marginTop: 4,
  },
  btn: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnTxt: { fontWeight: "700", color: "#111" },
  primary: { backgroundColor: "#111" },
  btnTxtW: { fontWeight: "700", color: "#fff" },
  flex1: { flex: 1 },
});
