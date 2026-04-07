import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { useAuth } from "../context/Auth.context";
import { useColors } from "@/hooks/useColor";
import type { RootStackParamList } from "../types/index";

type OAuthRoute = RouteProp<RootStackParamList, "OAuthRedirect">;

export default function OAuthRedirectScreen() {
  const route = useRoute<OAuthRoute>();
  const { setToken } = useAuth();
  const colors = useColors();

  useEffect(() => {
    const token = route.params?.token;
    if (token) {
      setToken(token);
    }
  }, [route.params]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Signing you in...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  text: { fontSize: 14 },
});
