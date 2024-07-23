import { useTranslation } from 'react-i18next';

export const NAMESPACE = 'community-ding-talk';

export function usePluginTranslation() {
  return useTranslation(NAMESPACE);
}
