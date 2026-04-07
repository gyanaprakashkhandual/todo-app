import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "../hooks/useColor";
import { API_CONFIG, API_ENDPOINTS } from "../config/config";

const features = [
  { icon: "lightning-bolt", text: "Kanban board with status columns" },
  { icon: "tag-multiple", text: "Tags, priorities & due dates" },
  { icon: "cellphone", text: "Mobile-first, native experience" },
  { icon: "shield-lock", text: "Secure OAuth2 authentication" },
];

export default function AuthScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState<"google" | "github" | null>(null);

  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(provider);
    const endpoint =
      provider === "google"
        ? API_ENDPOINTS.AUTH.GOOGLE_LOGIN
        : API_ENDPOINTS.AUTH.GITHUB_LOGIN;
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    try {
      await Linking.openURL(url);
    } catch {
      // handle error
    } finally {
      setLoading(null);
    }
  };

  const s = styles(colors);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={s.logoRow}>
          <View style={s.logoBox}>
            <MaterialCommunityIcons
              name="check-bold"
              size={20}
              color={colors.primaryFg}
            />
          </View>
          <Text style={s.logoText}>TODO</Text>
        </View>

        {/* Hero */}
        <View style={s.heroSection}>
          <View style={s.badge}>
            <View style={s.badgeDot} />
            <Text style={s.badgeText}>Available on mobile &amp; desktop</Text>
          </View>

          <Text style={s.heroTitle}>
            TASK THAT ACT{"\n"}
            <Text style={s.heroSub}>...ually get done.</Text>
          </Text>

          <Text style={s.heroDesc}>
            A focused todo manager with Kanban boards, smart filters, and a
            clean UI built for how you actually work.
          </Text>

          <View style={s.features}>
            {features.map((f) => (
              <View key={f.text} style={s.featureRow}>
                <View style={s.featureIconBox}>
                  <MaterialCommunityIcons
                    name={f.icon as any}
                    size={16}
                    color={colors.textSecondary}
                  />
                </View>
                <Text style={s.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Auth Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Sign in to Todo</Text>
          <Text style={s.cardSub}>Choose a provider to get started</Text>

          {/* Google Button */}
          <TouchableOpacity
            style={s.oauthBtn}
            onPress={() => handleOAuth("google")}
            disabled={loading !== null}
            activeOpacity={0.8}
          >
            {loading === "google" ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <GoogleIcon />
            )}
            <Text style={s.oauthBtnText}>Continue with Google</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {/* GitHub Button */}
          <TouchableOpacity
            style={s.oauthBtn}
            onPress={() => handleOAuth("github")}
            disabled={loading !== null}
            activeOpacity={0.8}
          >
            {loading === "github" ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <GitHubIcon color={colors.text} />
            )}
            <Text style={s.oauthBtnText}>Continue with GitHub</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          <Text style={s.tos}>
            By signing in you agree to our <Text style={s.tosLink}>Terms</Text>{" "}
            and <Text style={s.tosLink}>Privacy Policy</Text>
          </Text>
        </View>

        <Text style={s.noPassword}>
          No password needed — sign in with your existing account
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function GoogleIcon() {
  return (
    <View style={{ width: 20, height: 20 }}>
      {/* Simplified Google G */}
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#4285F4" }}>
        G
      </Text>
    </View>
  );
}

function GitHubIcon({ color }: { color: string }) {
  return <MaterialCommunityIcons name="github" size={20} color={color} />;
}

const styles = (
  colors: ReturnType<typeof import("../hooks/useColor").useColors>,
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: 24, paddingBottom: 40 },

    logoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 32,
    },
    logoBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: {
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 4,
      color: colors.text,
    },

    heroSection: { marginBottom: 32 },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      backgroundColor: colors.surfaceElevated,
      borderRadius: 99,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
    },
    badgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#22c55e",
    },
    badgeText: { fontSize: 12, color: colors.textSecondary, fontWeight: "500" },

    heroTitle: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.text,
      lineHeight: 40,
      letterSpacing: -0.5,
      marginBottom: 12,
    },
    heroSub: {
      fontSize: 28,
      fontWeight: "400",
      color: colors.textMuted,
    },
    heroDesc: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 24,
      marginBottom: 24,
    },

    features: { gap: 12 },
    featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    featureIconBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    featureText: { fontSize: 14, color: colors.textSecondary, flex: 1 },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    cardSub: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },

    oauthBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceElevated,
      marginBottom: 12,
    },
    oauthBtnText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },

    tos: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 18,
      marginTop: 8,
    },
    tosLink: { color: colors.textSecondary },

    noPassword: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: "center",
    },
  });
