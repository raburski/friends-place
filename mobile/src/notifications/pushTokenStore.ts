import * as SecureStore from "expo-secure-store";

const PUSH_TOKEN_KEY = "expo_push_token";

export async function loadPushToken() {
  return SecureStore.getItemAsync(PUSH_TOKEN_KEY);
}

export async function storePushToken(token: string) {
  await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
}

export async function clearPushToken() {
  await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
}
