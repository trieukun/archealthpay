import { createContext, useContext } from 'react'

/**
 * Display currency. Payments are ALWAYS settled in USDC onchain; VND is a
 * display-only conversion at the current USD/VND rate (USDC is pegged 1:1 to USD).
 */
export type Currency = 'USDC' | 'VND'
export type RateSource = 'live' | 'cached' | 'fallback'

export const CURRENCY_STORAGE_KEY = 'archealth:currency'
export const RATE_CACHE_KEY = 'archealth:vndRate'
export const RATE_URL = 'https://open.er-api.com/v6/latest/USD'

/** Reference rate used only until a live (or previously saved) rate is available. */
export const FALLBACK_VND_PER_USDC = 25400

/** Sanity bounds so a bad API response can never produce absurd prices. */
export const MIN_VALID_RATE = 5000
export const MAX_VALID_RATE = 200000

export interface CurrencyValue {
  currency: Currency
  setCurrency: (c: Currency) => void
  /** VND per 1 USDC */
  rate: number
  rateSource: RateSource
  /** Unit label for the selected currency: "USDC" or "VND"/"VNĐ" */
  unit: string
  /** Number only, in the selected currency (no symbol) */
  num: (usdcAmount: string | number) => string
  /** USDC: "$12.50"  |  VND: "318,750" (pair with `unit`) */
  money: (usdcAmount: string | number) => string
  /** USDC: "$12.50 USDC"  |  VND: "318,750 VND" */
  moneyFull: (usdcAmount: string | number) => string
  /** VND mode only: "≈ 12.50 USDC" (the real onchain amount); null in USDC mode */
  usdcHint: (usdcAmount: string | number) => string | null
}

export const CurrencyContext = createContext<CurrencyValue | null>(null)

export function useCurrency(): CurrencyValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider')
  return ctx
}

export function detectInitialCurrency(): Currency {
  try {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (saved === 'USDC' || saved === 'VND') return saved
  } catch {
    // ignore storage errors
  }
  return 'USDC'
}

export function isValidRate(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= MIN_VALID_RATE && v <= MAX_VALID_RATE
}

export function readCachedRate(): number | null {
  try {
    const raw = localStorage.getItem(RATE_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { rate?: unknown }
    return isValidRate(parsed.rate) ? parsed.rate : null
  } catch {
    return null
  }
}
