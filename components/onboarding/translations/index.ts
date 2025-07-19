import { nl } from './nl';
import { en } from './en';
import { de } from './de';
import { fr } from './fr';
import { it } from './it';
import { es } from './es';
import { ar } from './ar';

export const onboardingTranslations = {
  nl,
  en,
  de,
  fr,
  it,
  es,
  ar,
};

export type SupportedLanguages = keyof typeof onboardingTranslations;
export type TranslationKeys = keyof typeof nl; 