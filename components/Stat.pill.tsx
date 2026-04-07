import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColor";

interface StatPillProps {
  label: string;
  value: number;
  dotColor: string;
  textColor: string;
  loading?: boolean;
}

export default function StatPill({
  label,
  value,
  dotColor,
  textColor,
  loading,
}: StatPillProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.value, { color: textColor }]}>
        {loading ? "–" : value}
      </Text>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  dot: { width: 7, height: 7, borderRadius: 99 },
  value: { fontSize: 12, fontWeight: "700" },
  label: { fontSize: 11 },
});
