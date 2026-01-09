import { en } from "./en";
import { pl } from "./pl";
import type { Locale } from "../domain/enums";

export const translations = {
  pl,
  en
};

export function getTranslations(locale: Locale) {
  return translations[locale] ?? translations.pl;
}
