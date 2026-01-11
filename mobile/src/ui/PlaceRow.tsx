import { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { type Theme, useTheme } from "../theme";
import { ListRow, type ListRowProps } from "./ListRow";
import { Pill, type PillTone } from "./Pill";

const THUMBNAIL_SIZE = 52;

type PlaceRowProps = Omit<ListRowProps, "children" | "right"> & {
  name: string;
  address?: string | null;
  imageUrl?: string | null;
  badgeLabel?: string;
  badgeTone?: PillTone;
};

export function PlaceRow({
  name,
  address,
  imageUrl,
  badgeLabel,
  badgeTone = "primary",
  onPress,
  accessibilityRole,
  accessibilityLabel,
  accessibilityState,
  contentStyle,
  ...props
}: PlaceRowProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ListRow
      {...props}
      onPress={onPress}
      accessibilityRole={accessibilityRole ?? (onPress ? "button" : undefined)}
      accessibilityLabel={accessibilityLabel ?? name}
      accessibilityState={accessibilityState}
      contentStyle={[styles.rowContent, contentStyle]}
      left={
        <View style={styles.thumbnail}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.thumbnailImage}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Text style={styles.thumbnailText}>Brak zdjęcia</Text>
            </View>
          )}
        </View>
      }
      right={badgeLabel ? <Pill label={badgeLabel} tone={badgeTone} /> : undefined}
    >
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {name}
          </Text>
        {address ? (
          <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
            {address}
          </Text>
        ) : null}
      </View>
    </ListRow>
  );
}

(PlaceRow as typeof PlaceRow & { isListRow?: boolean }).isListRow = true;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    rowContent: {
      paddingVertical: 8,
      paddingLeft: 10,
      paddingRight: 14
    },
    thumbnail: {
      width: THUMBNAIL_SIZE,
      height: THUMBNAIL_SIZE,
      borderRadius: theme.radius.card,
      backgroundColor: theme.colors.mutedSoft,
      flexShrink: 0,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center"
    },
    thumbnailImage: {
      width: THUMBNAIL_SIZE,
      height: THUMBNAIL_SIZE,
      borderRadius: theme.radius.card
    },
    thumbnailPlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6
    },
    thumbnailText: {
      fontSize: 10,
      textAlign: "center",
      color: theme.colors.muted
    },
    meta: {
      gap: 4,
      flex: 1,
      justifyContent: 'center',
      minWidth: 0
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      flexShrink: 1
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.muted
    }
  });
