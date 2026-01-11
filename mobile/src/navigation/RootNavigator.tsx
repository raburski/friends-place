import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { useSession } from "../auth/useSession";
import { fetchMobileProfile } from "../auth/api";
import { useTheme } from "../theme";

export function RootNavigator() {
  const { session } = useSession();
  const [profileComplete, setProfileComplete] = useState(false);
  const theme = useTheme();
  const navigationTheme = useMemo(() => {
    const baseTheme = theme.mode === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: theme.colors.primary,
        background: theme.colors.bg,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.accent
      }
    };
  }, [theme]);

  useEffect(() => {
    if (!session) {
      setProfileComplete(false);
      return;
    }
    fetchMobileProfile(session.token)
      .then((payload) => {
        setProfileComplete(Boolean(payload?.data?.profileComplete));
      })
      .catch(() => {
        setProfileComplete(false);
      });
  }, [session]);

  useEffect(() => {
    if (!session || profileComplete) {
      return;
    }
    const interval = setInterval(() => {
      fetchMobileProfile(session.token)
        .then((payload) => {
          setProfileComplete(Boolean(payload?.data?.profileComplete));
        })
        .catch(() => null);
    }, 1500);
    return () => clearInterval(interval);
  }, [session, profileComplete]);

  return (
    <NavigationContainer theme={navigationTheme}>
      {session ? (
        profileComplete ? (
          <MainTabs />
        ) : (
          <AuthStack isProfileComplete={profileComplete} forceProfileSetup />
        )
      ) : (
        <AuthStack isProfileComplete={false} />
      )}
    </NavigationContainer>
  );
}
