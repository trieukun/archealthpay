import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  DICTIONARIES,
  I18nContext,
  LANG_STORAGE_KEY,
  VI_DATA,
  detectInitialLang,
} from '@/lib/i18n'
import type { I18nValue, Lang, TKey } from '@/lib/i18n'

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectInitialLang())

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next)
    } catch {
      // ignore storage errors
    }
  }, [])

  // Keep the document language and tab title in sync with the selected language.
  useEffect(() => {
    document.documentElement.lang = lang
    document.title =
      lang === 'vi'
        ? 'ArcHealth Pay — Thanh toán viện phí bằng USDC'
        : 'ArcHealth Pay — Hospital Bill Payment via USDC'
  }, [lang])

  const value = useMemo<I18nValue>(() => {
    const dict = DICTIONARIES[lang]
    const t = (key: TKey, vars?: Record<string, string | number>) => {
      let s: string = dict[key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v))
      }
      return s
    }
    const tDept = (department: string) => {
      const key = `dept.${department}` as TKey
      return dict[key] ?? department
    }
    const tData = (text: string) => (lang === 'vi' ? VI_DATA[text] ?? text : text)
    return { lang, setLang, locale: lang === 'vi' ? 'vi-VN' : 'en-US', t, tDept, tData }
  }, [lang, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
