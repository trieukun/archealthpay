import { useAccount } from 'wagmi'
import { ExternalLink, Clock, Wallet } from 'lucide-react'
import { TokenUSDC } from '@web3icons/react'
import { getPaymentsByWallet } from '@/lib/bills'
import { buildTxExplorerUrl } from '@/onchain-facts'
import { useI18n } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'

const TARGET_CHAIN_ID = 5042002

interface PaymentHistoryProps {
  // Refresh key — increment to re-read from storage after a new payment
  refreshKey?: number
}

export default function PaymentHistory({ refreshKey = 0 }: PaymentHistoryProps) {
  const { address, isConnected } = useAccount()
  const { t, tDept, tData, locale } = useI18n()
  const { money, unit, usdcHint } = useCurrency()

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div
          className="flex size-12 items-center justify-center rounded-2xl"
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
        >
          <Wallet className="size-5" style={{ color: 'var(--muted)' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>
          {t('hist.connect')}
        </p>
        <p className="text-xs text-center" style={{ color: 'var(--subtle)' }}>
          {t('hist.connectSub')}
        </p>
      </div>
    )
  }

  // Re-read on each render (refreshKey change forces a re-render from parent)
  void refreshKey
  const payments = getPaymentsByWallet(address)

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div
          className="flex size-12 items-center justify-center rounded-2xl"
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
        >
          <Clock className="size-5" style={{ color: 'var(--muted)' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>
          {t('hist.none')}
        </p>
        <p className="text-xs text-center" style={{ color: 'var(--subtle)' }}>
          {t('hist.noneSub')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {payments.map((p) => {
        const txUrl = buildTxExplorerUrl(TARGET_CHAIN_ID, p.txHash)
        const paidAt = new Date(p.paidAt).toLocaleString(locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })

        return (
          <div
            key={p.id}
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(26,128,71,0.10)' }}
                >
                  <TokenUSDC variant="branded" size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                    {tData(p.description)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    {p.patientName ?? ''}{p.patientName ? ' · ' : ''}{p.invoiceNumber} · {tDept(p.department)}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="display text-base font-bold tabular-nums" style={{ color: 'var(--success)' }}>
                  −{money(p.amount)}
                </p>
                <p className="text-xs" style={{ color: 'var(--subtle)' }}>{unit}</p>
                {usdcHint(p.amount) && (
                  <p className="mono tabular-nums" style={{ color: 'var(--subtle)', fontSize: '10px' }}>
                    {usdcHint(p.amount)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--subtle)' }}>
                <Clock className="size-3" />
                {paidAt}
              </span>
              <a
                href={txUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: 'var(--accent-hover)' }}
              >
                ArcScan <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}
