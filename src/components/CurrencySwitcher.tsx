import { Coins } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'
import type { Currency } from '@/lib/currency'

export default function CurrencySwitcher() {
  const { t, lang } = useI18n()
  const { currency, setCurrency } = useCurrency()

  const options: { id: Currency; label: string }[] = [
    { id: 'USDC', label: 'USDC' },
    { id: 'VND', label: lang === 'vi' ? 'VNĐ' : 'VND' },
  ]

  return (
    <div
      role="group"
      aria-label={t('currency.label')}
      className="flex items-center gap-0.5 rounded-lg p-0.5"
      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
    >
      <Coins className="mx-1.5 hidden size-3.5 sm:block" style={{ color: 'rgba(255,255,255,0.55)' }} />
      {options.map((o) => {
        const active = currency === o.id
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => setCurrency(o.id)}
            aria-pressed={active}
            className="rounded-md px-2.5 py-1.5 text-xs font-bold transition-all"
            style={{
              background: active ? 'rgba(255,255,255,0.20)' : 'transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.55)',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
