import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import XHR from 'i18next-xhr-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import resources from '../assets/public/js/i18n'

i18n
    .use(XHR)
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        react: {
            useSuspense: false
        },
        resources,
        lng: 'zh',
        fallbackLng: ['zh', 'zh-cn', 'en', 'en-us'],
        lowerCaseLng: true,
        interpolation: {
            escapeValue: false
        }
    }, (err, t) => {
        if (err) throw Error(err)
    })

export default i18n
