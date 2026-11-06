import { Info } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { TKey } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'

const SOURCE_KEY: Record<string, TKey> = {
  live: 'currency.src.live',
  cached: 'currency.src.cached',
  fallback: 'currency.src.fallback',
}

/** Shown only in VND mode: explains the conversion is display-only. */
export default function RateNote() {
  const { t, locale } = useI18n()
  const { currency, rate, rateSource, unit } = useCurrency()
  if (currency !== 'VND') return null

  return (
    <div
      className="flex items-start gap-2 rounded-2xl px-4 py-3"
      style={{ background: 'rgba(14,92,168,0.06)', border: '1px solid rgba(14,92,168,0.15)' }}
    >
      <Info className="mt-0.5 size-4 shrink-0" style={{ color: 'var(--accent)' }} />
      <p className="text-xs" style={{ color: 'var(--ink-2)' }}>
        {t('currency.rateNote', {
          unit,
          rate: Math.round(rate).toLocaleString(locale),
          source: t(SOURCE_KEY[rateSource]),
        })}
      </p>
    </div>
  )
}
