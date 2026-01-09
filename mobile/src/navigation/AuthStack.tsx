import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthScreen } from "../screens/AuthScreen";
import { ProfileSetupScreen } from "../screens/ProfileSetupScreen";

export type AuthStackParamList = {
  Auth: undefined;
  ProfileSetup: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack({
  isProfileComplete,
  forceProfileSetup
}: {
  isProfileComplete: boolean;
  forceProfileSetup?: boolean;
}) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {forceProfileSetup ? (
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      ) : (
        <>
          <Stack.Screen name="Auth" component={AuthScreen} />
          {!isProfileComplete && (
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}
