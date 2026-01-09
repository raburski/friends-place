const HANDLE_REGEX = /^[a-zA-Z0-9_]+$/;

export function isValidHandle(value: string) {
  return value.length >= 3 && value.length <= 24 && HANDLE_REGEX.test(value);
}
