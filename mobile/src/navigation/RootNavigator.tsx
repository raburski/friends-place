import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { useSession } from "../auth/useSession";
import { fetchMobileProfile } from "../auth/api";

export function RootNavigator() {
  const { session } = useSession();
  const [profileComplete, setProfileComplete] = useState(false);

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
    <NavigationContainer>
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
