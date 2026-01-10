import { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSession } from "../auth/useSession";
import { apiGet } from "../api/client";
import { theme } from "../theme";
import type { ProfileStackParamList } from "../navigation/ProfileStack";
import { CaretRight, Gear } from "phosphor-react-native";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/query/keys";

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, "ProfileHome">>();
  const { session } = useSession();
  const meQuery = useQuery({
    queryKey: queryKeys.me(),
    queryFn: () =>
      apiGet<{ ok: boolean; data: { displayName?: string; handle?: string } }>("/api/me", session?.token ?? ""),
    enabled: Boolean(session?.token)
  });
  const friendsQuery = useQuery({
    queryKey: queryKeys.friends(),
    queryFn: () =>
      apiGet<{
        ok: boolean;
        data: Array<{ friendshipId: string; friendId: string; handle?: string; displayName?: string }>;
      }>("/api/friends", session?.token ?? ""),
    enabled: Boolean(session?.token)
  });

  const profile = useMemo(() => meQuery.data?.data ?? null, [meQuery.data]);
  const friendsCount = useMemo(() => friendsQuery.data?.data?.length ?? 0, [friendsQuery.data]);
  const error =
    meQuery.isError || friendsQuery.isError ? "Nie udało się pobrać profilu." : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Profil</Text>
          <Pressable
            style={styles.iconButton}
            onPress={() => navigation.navigate("Settings")}
            accessibilityRole="button"
            accessibilityLabel="Ustawienia"
          >
            <Gear color={theme.colors.text} size={20} weight="bold" />
          </Pressable>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Twoje konto</Text>
          {profile ? (
            <>
              <Text style={styles.subtitle}>{profile.displayName ?? "Brak nazwy"}</Text>
              <Text style={styles.muted}>@{profile.handle ?? "bez_handle"}</Text>
            </>
          ) : null}
          <Text style={styles.muted}>Znajomi: {friendsCount}</Text>
        </View>
        <Pressable style={styles.panelButton} onPress={() => navigation.navigate("Friends")}>
          <Text style={styles.panelText}>Koledzy</Text>
          <CaretRight color={theme.colors.muted} size={18} weight="bold" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 0,
    gap: 16,
    backgroundColor: theme.colors.bg
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    fontFamily: "Fraunces_600SemiBold",
    color: theme.colors.text
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text
  },
  sectionCard: {
    padding: 16,
    borderRadius: theme.radius.sheet,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
    ...theme.shadow.soft
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    fontFamily: "Fraunces_600SemiBold"
  },
  muted: {
    fontSize: 14,
    color: theme.colors.muted
  },
  panelButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  panelText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center"
  },
  error: {
    color: theme.colors.error
  }
});
