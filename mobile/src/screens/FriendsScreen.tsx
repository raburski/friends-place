import { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, Share } from "react-native";
import { API_BASE_URL } from "../config";
import { type Theme, useTheme } from "../theme";
import { useMobileApiOptions, useMobileApiQueryOptions } from "../api/useMobileApiOptions";
import { useFriendsQuery, useInvitesQuery } from "../../../shared/query/hooks/useQueries";
import { useRevokeInviteMutation, useUnfriendMutation } from "../../../shared/query/hooks/useMutations";
import { Button, IconButton } from "../ui/Button";
import { Screen } from "../ui/Screen";
import { List } from "../ui/List";
import { ListRow } from "../ui/ListRow";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { useActionSheet } from "@expo/react-native-action-sheet";

export function FriendsScreen() {
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const apiOptions = useMobileApiOptions();
  const apiQueryOptions = useMobileApiQueryOptions();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { showActionSheetWithOptions } = useActionSheet();
  const friendsQuery = useFriendsQuery(apiQueryOptions);
  const invitesQuery = useInvitesQuery(apiQueryOptions);
  const unfriendMutation = useUnfriendMutation(apiOptions);
  const revokeInviteMutation = useRevokeInviteMutation(apiOptions);
  const unfriendIsPending =
    (unfriendMutation as { isPending?: boolean }).isPending ??
    (unfriendMutation as { isLoading?: boolean }).isLoading ??
    false;
  const revokeIsPending =
    (revokeInviteMutation as { isPending?: boolean }).isPending ??
    (revokeInviteMutation as { isLoading?: boolean }).isLoading ??
    false;

  const friends = useMemo(
    () => friendsQuery.data?.data ?? [],
    [friendsQuery.data]
  ) as Array<{ friendshipId: string; friendId: string; handle?: string; displayName?: string }>;
  const invites = useMemo(
    () => invitesQuery.data?.data ?? [],
    [invitesQuery.data]
  ) as Array<{ id: string; code: string; type: string; revokedAt?: string | null }>;
  const error =
    friendsQuery.isError || invitesQuery.isError
      ? "Nie udało się pobrać danych."
      : null;

  const handleFriendAction = useCallback(
    (friendId: string, friendName?: string | null) => {
      if (unfriendIsPending) {
        return;
      }
      showActionSheetWithOptions(
        {
          title: friendName ?? undefined,
          options: ["Usuń kolegę", "Anuluj"],
          cancelButtonIndex: 1,
          destructiveButtonIndex: 0
        },
        (selectedIndex?: number) => {
          if (selectedIndex === 0) {
            void unfriendMutation.mutateAsync(friendId);
          }
        }
      );
    },
    [showActionSheetWithOptions, unfriendIsPending, unfriendMutation]
  );

  return (
    <Screen withHeader>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <List>
        {friends.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.muted}>Brak znajomych.</Text>
          </View>
        ) : (
          friends.map((friend, index) => (
            <ListRow
              key={friend.friendshipId}
              isLastRow={index === friends.length - 1}
              onPress={() => handleFriendAction(friend.friendId, friend.displayName)}
              disabled={unfriendIsPending}
              accessibilityRole="button"
              accessibilityLabel="Opcje znajomego"
            >
              <View style={styles.rowMeta}>
                <Text style={styles.rowTitle}>{friend.displayName ?? "Znajomy"}</Text>
                <Text style={styles.rowText}>@{friend.handle ?? "bez_handle"}</Text>
              </View>
            </ListRow>
          ))
        )}
      </List>
      <List title="Dodaj znajomego" subtitle="Udostępnij swój link zaproszenia.">
        {invites.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.muted}>Brak linków.</Text>
          </View>
        ) : (
          invites
            .filter((invite) => !invite.revokedAt)
            .map((invite, index, filteredInvites) => (
              <ListRow
                key={invite.id}
                isLastRow={index === filteredInvites.length - 1}
                onPress={async () => {
                  await Share.share({
                    message: `${API_BASE_URL}/auth/invite/${invite.code}`
                  });
                }}
                right={
                  <View style={styles.inviteActions}>
                    <Button
                      label="Udostępnij"
                      size="sm"
                      onPress={async (event) => {
                        event.stopPropagation?.();
                        await Share.share({
                          message: `${API_BASE_URL}/auth/invite/${invite.code}`
                        });
                      }}
                    />
                    <IconButton
                      accessibilityLabel="Wycofaj link"
                      variant="secondary"
                      size="sm"
                      icon={<Text style={styles.iconAccent}>🗑</Text>}
                      onPress={(event) => {
                        event.stopPropagation?.();
                        setRevokeId(invite.id);
                      }}
                    />
                  </View>
                }
              >
                <View style={styles.rowMeta}>
                  <Text style={styles.rowTitle}>
                    {invite.type === "single" ? "Jednorazowy" : "Wielorazowy"}
                  </Text>
                  <Text style={styles.rowText}>Kod: {invite.code}</Text>
                </View>
              </ListRow>
            ))
        )}
        <View style={styles.listFooter}>
          <Text style={styles.muted}>Link jest tworzony automatycznie.</Text>
        </View>
      </List>
      <ConfirmDialog
        visible={Boolean(revokeId)}
        title="Wycofać link?"
        description="Link przestanie działać natychmiast."
        confirmLabel="Wycofaj"
        confirmLoading={revokeIsPending}
        confirmLoadingLabel="Wycofywanie..."
        onCancel={() => setRevokeId(null)}
        onConfirm={async () => {
          if (!revokeId) {
            return;
          }
          await revokeInviteMutation.mutateAsync(revokeId);
          setRevokeId(null);
        }}
      />
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  muted: {
    fontSize: 14,
    color: theme.colors.muted
  },
  inviteActions: {
    flexDirection: "row",
    gap: 8
  },
  rowMeta: {
    gap: 4
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text
  },
  rowText: {
    fontSize: 12,
    color: theme.colors.muted
  },
  iconAccent: {
    color: theme.colors.accent,
    fontWeight: "600",
    fontSize: 14
  },
  emptyState: {
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  listFooter: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12
  },
  error: {
    color: theme.colors.error
  }
  });
