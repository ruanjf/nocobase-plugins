import { useTranslation } from 'react-i18next';

export const NAMESPACE = 'nocobase-plugin-ext';

export function usePluginTranslation() {
  return useTranslation(NAMESPACE);
}
