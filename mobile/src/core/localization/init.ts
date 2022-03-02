import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import english from './translations/en';

const initTranslations = (): void => {
  i18n.use(initReactI18next).init({
    resources: {
      en: {
        translation: english,
      },
    },
    compatibilityJSON: 'v3',
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
};

export { initTranslations };
