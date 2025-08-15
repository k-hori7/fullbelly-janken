// app/inventory.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { SwipeListView } from "react-native-swipe-list-view";
import { useConfigStore } from "../src/store/configStore";

export default function Inventory() {
  const router = useRouter();
  const { hydrate, foods, addFood, deleteFood, saveAsLast, updateFood } =
    useConfigStore();
  const [q, setQ] = useState("");

  useEffect(() => {
    hydrate(true);
  }, []);

  const data = foods();
  const filtered = useMemo(
    () => data.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())),
    [data, q]
  );

  const onDelete = (id: string) => {
    Alert.alert("削除しますか？", "この候補は元に戻せません", [
      { text: "キャンセル", style: "cancel" },
      { text: "削除", style: "destructive", onPress: () => deleteFood(id) },
    ]);
  };

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={s.backTx}>戻る</Text>
        </TouchableOpacity>
        <Text style={s.title}>在庫管理</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={s.tools}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="候補を検索"
          style={s.input}
          returnKeyType="search"
        />
        <View style={s.row}>
          <TouchableOpacity style={s.toolBtn} onPress={() => addFood()}>
            <Text style={s.toolTx}>追加</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.toolBtn}
            onPress={() => {
              saveAsLast();
              Alert.alert("保存しました");
            }}
          >
            <Text style={s.toolTx}>保存</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.hint}>左にスワイプ：削除</Text>
      </View>

      <SwipeListView
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={s.rowItem}>
            <TextInput
              value={item.name}
              onChangeText={(t) => updateFood(item.id, { name: t })}
              style={s.nameInput}
            />
            <TextInput
              value={String(item.points)}
              onChangeText={(t) =>
                updateFood(item.id, { points: Number(t) || 0 })
              }
              style={s.pointInput}
              keyboardType="numeric"
            />
            <Text style={s.pointLabel}>点</Text>
          </View>
        )}
        renderHiddenItem={({ item }) => (
          <View style={s.hiddenRow}>
            <TouchableOpacity
              style={s.delBtn}
              onPress={() => onDelete(item.id)}
            >
              <Text style={s.delTx}>削除</Text>
            </TouchableOpacity>
          </View>
        )}
        rightOpenValue={-80} // ← 左に80px開く：削除
        disableLeftSwipe={false}
        disableRightSwipe={true}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#fff", paddingTop: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  back: { padding: 8 },
  backTx: { color: "#2563eb", fontWeight: "700" },
  title: { fontSize: 18, fontWeight: "800" },
  tools: { paddingHorizontal: 16, marginBottom: 12 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: { flexDirection: "row", gap: 8, marginTop: 8 },
  toolBtn: {
    backgroundColor: "#eef2ff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  toolTx: { color: "#111", fontWeight: "600" },
  hint: { marginTop: 8, color: "#6b7280", fontSize: 12 },
  rowItem: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#eef2f7",
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  nameInput: { flex: 1, fontWeight: "700" },
  pointInput: { width: 40, marginLeft: 8, textAlign: "right" },
  pointLabel: { marginLeft: 4 },
  hiddenRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  delBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  delTx: { fontWeight: "700", color: "#fff" },
});
