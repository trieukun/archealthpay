import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useI18n } from '@/lib/i18n'
import {
  CURRENCY_STORAGE_KEY,
  CurrencyContext,
  FALLBACK_VND_PER_USDC,
  RATE_CACHE_KEY,
  RATE_URL,
  detectInitialCurrency,
  isValidRate,
  readCachedRate,
} from '@/lib/currency'
import type { Currency, CurrencyValue, RateSource } from '@/lib/currency'

interface RateState {
  value: number
  source: RateSource
}

export default function CurrencyProvider({ children }: { children: ReactNode }) {
  const { lang, locale } = useI18n()
  const [currency, setCurrencyState] = useState<Currency>(() => detectInitialCurrency())
  const [rateState, setRateState] = useState<RateState>(() => {
    const cached = readCachedRate()
    return cached
      ? { value: cached, source: 'cached' }
      : { value: FALLBACK_VND_PER_USDC, source: 'fallback' }
  })

  // Fetch the live USD/VND rate once; keep the cached/fallback value on failure.
  useEffect(() => {
    const ctrl = new AbortController()
    fetch(RATE_URL, { signal: ctrl.signal })
      .then((r) => r.json() as Promise<{ rates?: { VND?: unknown } }>)
      .then((data) => {
        const vnd = data.rates?.VND
        if (!isValidRate(vnd)) return
        setRateState({ value: vnd, source: 'live' })
        try {
          localStorage.setItem(RATE_CACHE_KEY, JSON.stringify({ rate: vnd, at: Date.now() }))
        } catch {
          // ignore storage errors
        }
      })
      .catch(() => {
        // offline or blocked: keep the cached / reference rate
      })
    return () => ctrl.abort()
  }, [])

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next)
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, next)
    } catch {
      // ignore storage errors
    }
  }, [])

  const value = useMemo<CurrencyValue>(() => {
    const rate = rateState.value
    const unit = currency === 'USDC' ? 'USDC' : lang === 'vi' ? 'VNĐ' : 'VND'
    const toNumber = (a: string | number) => {
      const n = typeof a === 'number' ? a : parseFloat(a)
      return Number.isFinite(n) ? n : 0
    }
    const usdcFixed = (a: string | number) => toNumber(a).toFixed(2)
    const vndText = (a: string | number) => Math.round(toNumber(a) * rate).toLocaleString(locale)

    const num = (a: string | number) => (currency === 'USDC' ? usdcFixed(a) : vndText(a))
    const money = (a: string | number) => (currency === 'USDC' ? `$${usdcFixed(a)}` : vndText(a))
    const moneyFull = (a: string | number) => `${money(a)} ${unit}`
    const usdcHint = (a: string | number) => (currency === 'VND' ? `≈ ${usdcFixed(a)} USDC` : null)

    return {
      currency,
      setCurrency,
      rate,
      rateSource: rateState.source,
      unit,
      num,
      money,
      moneyFull,
      usdcHint,
    }
  }, [currency, setCurrency, rateState, lang, locale])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}
