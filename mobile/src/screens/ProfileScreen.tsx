import { useMemo } from "react";
import { Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { type Theme, useTheme } from "../theme";
import type { ProfileStackParamList } from "../navigation/ProfileStack";
import { CaretRight, Gear } from "phosphor-react-native";
import { useMobileApiQueryOptions } from "../api/useMobileApiOptions";
import { useFriendsQuery, useMeQuery } from "../../../shared/query/hooks/useQueries";
import { IconButton } from "../ui/Button";
import { Screen } from "../ui/Screen";
import { SectionCard } from "../ui/SectionCard";
import { List } from "../ui/List";
import { ListRow } from "../ui/ListRow";

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, "ProfileHome">>();
  const apiQueryOptions = useMobileApiQueryOptions();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const meQuery = useMeQuery(apiQueryOptions);
  const friendsQuery = useFriendsQuery(apiQueryOptions);

  const profile = useMemo(() => meQuery.data?.data ?? null, [meQuery.data]);
  const friendsCount = useMemo(() => friendsQuery.data?.data?.length ?? 0, [friendsQuery.data]);
  const error =
    meQuery.isError || friendsQuery.isError ? "Nie udało się pobrać profilu." : null;

  return (
    <Screen
      title="Profil"
      right={
        <IconButton
          accessibilityLabel="Ustawienia"
          icon={<Gear color={theme.colors.text} size={20} weight="bold" />}
          size="md"
          onPress={() => navigation.navigate("Settings")}
        />
      }
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <SectionCard title="Twoje konto" contentStyle={styles.sectionContent}>
        {profile ? (
          <>
            <Text style={styles.subtitle}>{profile.displayName ?? "Brak nazwy"}</Text>
            <Text style={styles.muted}>@{profile.handle ?? "bez_handle"}</Text>
          </>
        ) : null}
        <Text style={styles.muted}>Znajomi: {friendsCount}</Text>
      </SectionCard>
      <List>
        <ListRow
          onPress={() => navigation.navigate("Friends")}
          right={<CaretRight color={theme.colors.muted} size={18} weight="bold" />}
          accessibilityRole="button"
          accessibilityLabel="Koledzy"
          isLastRow
        >
          <Text style={styles.rowText}>Koledzy</Text>
        </ListRow>
      </List>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  subtitle: {
    fontSize: 16,
    color: theme.colors.text
  },
  sectionContent: {
    gap: 12
  },
  muted: {
    fontSize: 14,
    color: theme.colors.muted
  },
  rowText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text
  },
  error: {
    color: theme.colors.error
  }
  });
