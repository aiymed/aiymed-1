import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import uz from './i18n/uz.json'
import ru from './i18n/ru.json'
import en from './i18n/en.json'
import hi from './i18n/hi.json'

const resources = {
  uz: { translation: uz },
  ru: { translation: ru },
  en: { translation: en },
  hi: { translation: hi },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'uz', // Agar til topilmasa, o'zbek tilida ko'rsatadi
    debug: false,
    interpolation: {
      escapeValue: false
    }
  })

export default i18n