import { Hospital, FileText, Calendar, User, QrCode, ChevronDown, ChevronUp, CreditCard } from 'lucide-react'
import { useState } from 'react'
import type { Bill } from '@/lib/bills'
import { DEPT_BG, DEPT_COLOR } from '@/lib/bills'
import { useI18n } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'

interface BillCardProps {
  bill: Bill
  selected: boolean
  onSelect: (bill: Bill) => void
  onQR: (bill: Bill) => void
}

export default function BillCard({ bill, selected, onSelect, onQR }: BillCardProps) {
  const { t, tDept, tData, locale } = useI18n()
  const { money, moneyFull, unit, usdcHint } = useCurrency()
  const [expanded, setExpanded] = useState(false)
  const deptBg = DEPT_BG[bill.department] ?? 'rgba(14,92,168,0.08)'
  const deptTxt = DEPT_COLOR[bill.department] ?? 'var(--ink-2)'
  const paid = bill.status === 'paid'
  const hasItems = (bill.lineItems?.length ?? 0) > 0

  return (
    <div
      className="w-full overflow-hidden rounded-2xl transition-all duration-200"
      style={{
        background: paid
          ? 'rgba(255,255,255,0.70)'
          : selected
          ? 'rgba(255,255,255,0.96)'
          : 'rgba(255,255,255,0.80)',
        border: paid
          ? '1px solid rgba(13,122,68,0.22)'
          : selected
          ? '2px solid var(--accent)'
          : '1px solid var(--border)',
        boxShadow: selected && !paid
          ? '0 4px 20px rgba(14,92,168,0.14)'
          : '0 2px 8px rgba(13,33,55,0.06)',
      }}
    >
      {/* Paid green top strip */}
      {paid && (
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #0d7a44, #34d399)' }} />
      )}
      {/* Selected blue top strip */}
      {selected && !paid && (
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #0e5ca8, #60a5fa)' }} />
      )}

      <div className="p-4 sm:p-5">
        {/* Top row: dept icon + description + amount */}
        <div className="flex items-start gap-3">
          {/* Dept icon */}
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: deptBg }}
          >
            <Hospital className="size-5" style={{ color: deptTxt }} />
          </div>

          {/* Main content */}
          <button
            disabled={paid}
            onClick={() => onSelect(bill)}
            className="flex-1 min-w-0 text-left disabled:cursor-default"
          >
            <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--ink)' }}>
              {tData(bill.description)}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: deptBg, color: deptTxt }}
              >
                {tDept(bill.department)}
              </span>
            </div>
          </button>

          {/* Amount + actions */}
          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="text-right">
              <p className="display text-xl font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
                {money(bill.amount)}
              </p>
              <p className="text-xs font-medium" style={{ color: 'var(--subtle)' }}>{unit}</p>
              {usdcHint(bill.amount) && (
                <p className="mono tabular-nums" style={{ color: 'var(--subtle)', fontSize: '10px' }}>
                  {usdcHint(bill.amount)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {hasItems && (
                <button
                  onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
                  className="flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
                  style={{ color: 'var(--muted)' }}
                  title={expanded ? t('bill.hideBreakdown') : t('bill.viewBreakdown')}
                >
                  {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>
              )}
              {!paid && (
                <button
                  onClick={(e) => { e.stopPropagation(); onQR(bill) }}
                  className="flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
                  style={{ color: 'var(--muted)' }}
                  title={t('bill.qrTitle')}
                >
                  <QrCode className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
            <FileText className="size-3" />
            {bill.invoiceNumber}
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
            <Calendar className="size-3" />
            {new Date(bill.date).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
            <User className="size-3" />
            {bill.patientName}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-mono" style={{ color: 'var(--subtle)', fontSize: '11px' }}>
            <CreditCard className="size-3" />
            {bill.medicalRecordId}
          </span>
        </div>

        {/* Itemized breakdown */}
        {expanded && hasItems && (
          <div
            className="mt-3 rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="px-3 py-2" style={{ background: 'var(--surface-muted)', borderBottom: '1px solid var(--border)' }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--muted)', letterSpacing: '0.07em' }}>
                {t('bill.breakdown')}
              </p>
            </div>
            <div className="px-3 py-2 space-y-2" style={{ background: 'rgba(255,255,255,0.70)' }}>
              {bill.lineItems!.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--ink-2)' }}>{tData(item.label)}</span>
                  <span className="mono text-xs font-medium tabular-nums" style={{ color: 'var(--ink)', fontSize: '11px' }}>
                    {money(item.amount)}
                  </span>
                </div>
              ))}
              <div
                className="flex items-center justify-between pt-2"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>{t('bill.total')}</span>
                <span className="mono text-xs font-bold tabular-nums" style={{ color: 'var(--ink)', fontSize: '12px' }}>
                  {moneyFull(bill.amount)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Status / CTA */}
        {paid ? (
          <div className="mt-3 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: 'var(--success-bg)', color: 'var(--success)' }}
            >
              <span className="size-1.5 rounded-full inline-block" style={{ background: 'var(--success)' }} />
              {t('bill.paidReceipt')}
            </span>
            {bill.paidAt && (
              <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                {new Date(bill.paidAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        ) : (
          <button
            onClick={() => onSelect(bill)}
            className="mt-3 w-full rounded-xl py-2.5 text-sm font-semibold transition-all hover:scale-[1.005] active:scale-[0.995]"
            style={selected ? {
              background: 'var(--accent)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(14,92,168,0.35)',
            } : {
              background: 'var(--surface-muted)',
              color: 'var(--ink-2)',
              border: '1px solid var(--border)',
            }}
          >
            {selected ? t('bill.selected') : t('bill.pay')}
          </button>
        )}
      </div>
    </div>
  )
}
