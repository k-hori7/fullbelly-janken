import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useGameStore } from "../src/store/gameStore";
import { useConfigStore } from "../src/store/configStore";
import { Pool } from "../src/types";

export default function Game() {
  const router = useRouter();
  const {
    players,
    rule,
    preview,
    p1,
    p2,
    startMatch,
    confirmTurn,
    newPreview,
    undo,
    resetMatch,
    isReady,
  } = useGameStore();
  const { config, toggleFood } = useConfigStore();

  const [selectWinner, setSelectWinner] = useState<"p1" | "p2" | null>(null);

  useEffect(() => {
    if (!config) {
      Alert.alert("設定がありません", "設定画面で初期設定をしてください", [
        { text: "OK", onPress: () => router.replace("/setup") },
      ]);
      return;
    }
    startMatch(config);
  }, [config]);

  useEffect(() => {
    if (isReady) newPreview();
  }, [isReady]);

  const done = useMemo(() => {
    if (!rule) return false;
    return p1.points >= rule.pointTarget || p2.points >= rule.pointTarget;
  }, [p1.points, p2.points, rule]);

  useEffect(() => {
    if (done) {
      const winner = p1.points > p2.points ? players[0].name : players[1].name;
      Alert.alert("勝負あり！", `${winner} の勝ち`, [
        {
          text: "同じ設定で再戦",
          onPress: () => {
            resetMatch();
            startMatch(config!);
            newPreview();
          },
        },
        { text: "ホームへ", onPress: () => router.replace("/") },
      ]);
    }
  }, [done]);

  if (!isReady || !preview) {
    return (
      <View style={s.container}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  const Card = ({ hand, label }: { hand: Pool; label: string }) => {
    const item = preview.byHand[hand];
    const f = item?.food;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => {
          if (f) toggleFood(f.id, false);
        }}
        style={s.card}
      >
        <Text style={s.cardHand}>{label}</Text>
        {f ? (
          <>
            <Text style={s.cardName}>{f.name}</Text>
            <Text style={s.cardPts}>+{item!.points} pt</Text>
            <Text style={s.cardHelp}>長押しで非表示（次ラウンドから反映）</Text>
          </>
        ) : (
          <Text style={s.none}>候補なし</Text>
        )}
      </TouchableOpacity>
    );
  };

  const choose = (loserHand: Pool) => {
    if (!selectWinner) return;
    confirmTurn(selectWinner, loserHand);
    setSelectWinner(null);
  };

  // app/game.tsx（抜粋：return部）
  return (
    <View style={s.container}>
      <Text style={s.title}>目標 {rule?.pointTarget} 点</Text>

      <View style={s.scoreRow}>
        <View style={s.scoreBox}>
          <Text style={s.pName}>{players[0].name}</Text>
          <Text style={s.pPoints}>{p1.points}</Text>
        </View>
        <View style={s.scoreBox}>
          <Text style={s.pName}>{players[1].name}</Text>
          <Text style={s.pPoints}>{p2.points}</Text>
        </View>
      </View>

      <View style={s.previewRow}>
        <Card hand="rock" label="グー" />
        <Card hand="scissors" label="チョキ" />
        <Card hand="paper" label="パー" />
      </View>

      {!selectWinner ? (
        <View style={s.row}>
          <TouchableOpacity
            style={s.bigBtn}
            onPress={() => setSelectWinner("p1")}
          >
            <Text style={s.bigTxt}>{players[0].name} 勝ち</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.bigBtn}
            onPress={() => setSelectWinner("p2")}
          >
            <Text style={s.bigTxt}>{players[1].name} 勝ち</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.row}>
          <TouchableOpacity
            style={[s.smallBtn, s.rock]}
            onPress={() => choose("rock")}
          >
            <Text style={s.smallTxt}>敗者: グー</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.smallBtn, s.scissors]}
            onPress={() => choose("scissors")}
          >
            <Text style={s.smallTxt}>敗者: チョキ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.smallBtn, s.paper]}
            onPress={() => choose("paper")}
          >
            <Text style={s.smallTxt}>敗者: パー</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={s.footerRow}>
        <TouchableOpacity style={s.undo} onPress={undo}>
          <Text style={s.undoTxt}>直前を取り消す</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.secondary}
          onPress={() => {
            resetMatch();
          }}
        >
          <Text style={s.secondaryTxt}>リセット</Text>
        </TouchableOpacity>
      </View>

      {/* ← 必ず親Viewの“内側”に置く */}
      <TouchableOpacity
        onPress={() => router.push("/inventory")}
        style={{
          position: "absolute",
          right: 16,
          bottom: 24,
          backgroundColor: "#111",
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 999,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>在庫管理</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16, paddingTop: 48 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  scoreRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  scoreBox: {
    flex: 1,
    backgroundColor: "#f4f4f5",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  pName: { fontWeight: "600", fontSize: 16 },
  pPoints: { fontSize: 24, fontWeight: "800", marginTop: 4 },
  previewRow: { flexDirection: "row", gap: 8 },
  card: {
    flex: 1,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardHand: { fontWeight: "700", marginBottom: 6 },
  cardName: { fontSize: 16, fontWeight: "700" },
  cardPts: { marginTop: 4, color: "#555" },
  cardHelp: { marginTop: 6, fontSize: 12, color: "#6b7280" },
  none: { color: "#999", marginTop: 16 },
  row: { flexDirection: "row", gap: 8, marginTop: 16 },
  bigBtn: {
    flex: 1,
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  bigTxt: { color: "#fff", fontWeight: "700" },
  smallBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: "center" },
  smallTxt: { color: "#fff", fontWeight: "700" },
  rock: { backgroundColor: "#7c3aed" },
  scissors: { backgroundColor: "#2563eb" },
  paper: { backgroundColor: "#059669" },
  footerRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  undo: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  undoTxt: { fontWeight: "600", color: "#111" },
  secondary: { padding: 12, borderRadius: 12, backgroundColor: "#eee" },
  secondaryTxt: { fontWeight: "600" },
});
