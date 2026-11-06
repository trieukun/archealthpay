import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, Clock, CheckCircle2, Zap, CreditCard, FileText, ShieldCheck } from 'lucide-react'
import { TokenUSDC } from '@web3icons/react'
import { useAccount, useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'
import BillCard from '@/components/BillCard'
import PaymentSheet from '@/components/PaymentSheet'
import PaymentHistory from '@/components/PaymentHistory'
import QRModal from '@/components/QRModal'
import { getAllBills, getBillByInvoice, getBillsByMedicalRecord } from '@/lib/bills'
import type { Bill } from '@/lib/bills'
import { getUsdc } from '@/onchain-facts'
import { Amount, usdcDecimalsFor } from '@/onchain-money'
import { useI18n } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'
import RateNote from '@/components/RateNote'

const TARGET_CHAIN_ID = 5042002
const usdcFact = getUsdc(TARGET_CHAIN_ID)!

type Tab = 'bills' | 'history'
type LookupMode = 'invoice' | 'record'

export default function PatientPortal() {
  const { t } = useI18n()
  const { num, moneyFull, unit } = useCurrency()
  const [searchParams] = useSearchParams()
  const invoiceParam = searchParams.get('invoice') ?? ''

  const [tab, setTab] = useState<Tab>('bills')
  const [lookupMode, setLookupMode] = useState<LookupMode>('invoice')
  const [query, setQuery] = useState(invoiceParam)
  const [searchedQuery, setSearchedQuery] = useState(invoiceParam)
  const [bills, setBills] = useState<Bill[]>(() => {
    if (invoiceParam) {
      const found = getBillByInvoice(invoiceParam)
      return found ? [found] : getAllBills()
    }
    return getAllBills()
  })
  const [selectedBill, setSelectedBill] = useState<Bill | null>(() => {
    if (!invoiceParam) return null
    const found = getBillByInvoice(invoiceParam)
    return found && found.status === 'unpaid' ? found : null
  })
  const [qrBill, setQrBill] = useState<Bill | null>(null)
  const [historyKey, setHistoryKey] = useState(0)
  const [notFound, setNotFound] = useState(false)

  const { address } = useAccount()

  const { data: rawBalance } = useReadContract({
    address: usdcFact.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: TARGET_CHAIN_ID,
    query: { enabled: !!address },
  })

  const balance = rawBalance
    ? Amount.fromRaw(rawBalance, usdcDecimalsFor(TARGET_CHAIN_ID))
    : null
  const formattedBalance = balance ? balance.toFixed(2) : '--'

  const unpaidBills = bills.filter((b) => b.status === 'unpaid')
  const totalDue = unpaidBills.reduce((s, b) => s + parseFloat(b.amount), 0)

  const handleSearch = () => {
    const q = query.trim()
    setSearchedQuery(q)
    setNotFound(false)
    if (!q) {
      setBills(getAllBills())
      return
    }
    if (lookupMode === 'invoice') {
      const found = getBillByInvoice(q)
      if (found) {
        setBills([found])
        if (found.status === 'unpaid') setSelectedBill(found)
      } else {
        setBills([])
        setNotFound(true)
      }
    } else {
      const found = getBillsByMedicalRecord(q)
      if (found.length > 0) {
        setBills(found)
      } else {
        setBills([])
        setNotFound(true)
      }
    }
  }

  const handleClear = () => {
    setQuery('')
    setSearchedQuery('')
    setNotFound(false)
    setBills(getAllBills())
    setSelectedBill(null)
  }

  const handlePaid = (_billId: string, _txHash: string) => {
    setBills(getAllBills())
    setSelectedBill(null)
    setHistoryKey((k) => k + 1)
  }

  // Group bills by patient for family view
  const grouped = bills.reduce<Record<string, Bill[]>>((acc, b) => {
    acc[b.patientName] = acc[b.patientName] ?? []
    acc[b.patientName].push(b)
    return acc
  }, {})
  const patientNames = Object.keys(grouped)
  const showGrouped = patientNames.length > 1

  return (
    <div className="space-y-6">
      {/* ── Hero lookup card ─────────────────────────────────── */}
      <section
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, #0a2f50 0%, #0e5ca8 60%, #1d70c7 100%)',
          boxShadow: '0 16px 56px rgba(10,47,80,0.30)',
        }}
      >
        {/* Background texture circles */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #93c5fd, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-10 -left-10 size-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #bfdbfe, transparent 70%)' }} />

        <div className="relative px-6 pt-7 pb-5">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex size-5 items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <Zap className="size-3 text-white" />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {t('hero.eyebrow')}
                </span>
              </div>
              <h1 className="display text-2xl sm:text-3xl font-bold text-white mb-2" style={{ letterSpacing: '-0.03em' }}>
                {t('hero.title')}
              </h1>
              <p className="text-sm max-w-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {t('hero.subtitle')}
              </p>
            </div>

            {/* Balance widget */}
            {address && (
              <div
                className="sm:shrink-0 flex items-center gap-3 rounded-2xl px-5 py-3.5 self-start"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}
              >
                <TokenUSDC variant="branded" size={28} />
                <div>
                  <p className="display text-2xl font-bold tabular-nums text-white leading-none">
                    {balance ? num(formattedBalance) : formattedBalance}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{t('hero.walletBalance')} ({unit})</p>
                </div>
              </div>
            )}
          </div>

          {/* Lookup bar */}
          <div className="mt-6 space-y-3">
            {/* Mode toggle pills */}
            <div className="flex gap-2">
              {(['invoice', 'record'] as LookupMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setLookupMode(m); setQuery(''); setNotFound(false) }}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all"
                  style={{
                    background: lookupMode === m ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.07)',
                    color: lookupMode === m ? '#fff' : 'rgba(255,255,255,0.50)',
                    border: lookupMode === m ? '1px solid rgba(255,255,255,0.28)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {m === 'invoice' ? <FileText className="size-3" /> : <CreditCard className="size-3" />}
                  {m === 'invoice' ? t('lookup.invoice') : t('lookup.record')}
                </button>
              ))}
            </div>

            {/* Search input */}
            <div className="flex gap-2">
              <div
                className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-3.5"
                style={{ background: 'rgba(255,255,255,0.96)', border: '1px solid rgba(255,255,255,0.50)' }}
              >
                <ScanLine className="size-4 shrink-0" style={{ color: '#4a6175' }} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={lookupMode === 'invoice' ? t('lookup.placeholderInvoice') : t('lookup.placeholderRecord')}
                  className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                  style={{ color: '#0d2137' }}
                />
                {query && (
                  <button onClick={handleClear} className="shrink-0">
                    <X className="size-4 text-slate-400 hover:text-slate-600 transition-colors" />
                  </button>
                )}
              </div>
              <button
                onClick={handleSearch}
                className="flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
                style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.28)' }}
              >
                <Search className="size-4" />
                <span className="hidden sm:inline">{t('lookup.button')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* How it works strip */}
        <div
          className="flex items-stretch divide-x divide-white/10"
          style={{
            background: 'rgba(0,0,0,0.18)',
            borderTop: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          {[
            { icon: <Search className="size-3.5" />, text: t('steps.1') },
            { icon: <CheckCircle2 className="size-3.5" />, text: t('steps.2') },
            { icon: <FileText className="size-3.5" />, text: t('steps.3') },
          ].map(({ icon, text }) => (
            <div key={text} className="flex flex-1 items-center justify-center gap-2 px-3 py-3">
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>{icon}</span>
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Summary strip after search */}
      {searchedQuery && bills.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <SummaryChip label={t('summary.found')} value={String(bills.length)} />
          <SummaryChip label={t('summary.unpaid')} value={String(unpaidBills.length)} danger={unpaidBills.length > 0} />
          <SummaryChip label={t('summary.totalDue')} value={moneyFull(totalDue)} danger={unpaidBills.length > 0} />
        </div>
      )}

      <RateNote />

      {/* Tabs */}
      <div
        className="flex rounded-2xl p-1 gap-1"
        style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(13,33,55,0.06)' }}
      >
        {(['bills', 'history'] as Tab[]).map((tabId) => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all"
            style={{
              background: tab === tabId ? '#fff' : 'transparent',
              color: tab === tabId ? 'var(--ink)' : 'var(--muted)',
              boxShadow: tab === tabId ? '0 1px 6px rgba(13,33,55,0.10)' : 'none',
            }}
          >
            {tabId === 'bills' ? t('tabs.bills') : t('tabs.history')}
          </button>
        ))}
      </div>

      {/* Bills tab */}
      {tab === 'bills' && (
        <>
          {notFound && (
            <div
              className="flex flex-col items-center gap-3 rounded-3xl py-14"
              style={{ background: 'rgba(255,255,255,0.78)', border: '1px solid var(--border)' }}
            >
              <div className="flex size-14 items-center justify-center rounded-full" style={{ background: 'var(--surface-muted)' }}>
                <Search className="size-6" style={{ color: 'var(--subtle)' }} />
              </div>
              <p className="text-base font-semibold" style={{ color: 'var(--ink)' }}>{t('notFound.title')}</p>
              <p className="text-sm text-center px-8 max-w-sm" style={{ color: 'var(--muted)' }}>
                {t('notFound.body', { field: lookupMode === 'invoice' ? t('notFound.field.invoice') : t('notFound.field.record') })}
              </p>
              <button
                onClick={handleClear}
                className="mt-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:scale-[1.01]"
                style={{ background: 'var(--brand-pale)', color: 'var(--brand)', border: '1px solid rgba(14,92,168,0.20)' }}
              >
                {t('notFound.showAll')}
              </button>
            </div>
          )}

          {!notFound && bills.length > 0 && (
            showGrouped ? (
              <div className="space-y-6">
                {patientNames.map((name) => (
                  <div key={name}>
                    <div className="flex items-center gap-2.5 mb-3 px-1">
                      <div
                        className="flex size-7 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ background: 'var(--brand-mid)' }}
                      >
                        {name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>{name}</span>
                      {grouped[name].filter(b => b.status === 'unpaid').length > 0 && (
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
                        >
                          {t('group.unpaid', { n: grouped[name].filter(b => b.status === 'unpaid').length })}
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      {grouped[name].map((bill) => (
                        <BillCard
                          key={bill.id}
                          bill={bill}
                          selected={selectedBill?.id === bill.id}
                          onSelect={(b) => setSelectedBill(selectedBill?.id === b.id ? null : b)}
                          onQR={setQrBill}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {bills.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    selected={selectedBill?.id === bill.id}
                    onSelect={(b) => setSelectedBill(selectedBill?.id === b.id ? null : b)}
                    onQR={setQrBill}
                  />
                ))}
              </div>
            )
          )}

          {!notFound && bills.length === 0 && !searchedQuery && (
            <div className="flex flex-col items-center gap-3 py-14">
              <ScanLine className="size-10" style={{ color: 'var(--subtle)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>
                {t('empty.prompt')}
              </p>
            </div>
          )}
        </>
      )}

      {/* History tab */}
      {tab === 'history' && <PaymentHistory refreshKey={historyKey} />}

      {/* Trust bar */}
      <div
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl px-5 py-4"
        style={{ background: 'rgba(255,255,255,0.68)', border: '1px solid var(--border)' }}
      >
        <TrustChip icon={<Zap className="size-3.5" />} label={t('trust.finality')} />
        <TrustChip icon={<ShieldCheck className="size-3.5" />} label={t('trust.stable')} />
        <TrustChip icon={<CheckCircle2 className="size-3.5" />} label={t('trust.fees')} />
        <TrustChip icon={<Clock className="size-3.5" />} label={t('trust.noQueue')} />
      </div>

      <p className="text-center text-xs pb-2" style={{ color: 'var(--subtle)' }}>
        {t('testnetNote')}
      </p>

      {/* Payment sheet */}
      {selectedBill && selectedBill.status === 'unpaid' && (
        <PaymentSheet
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
          onPaid={handlePaid}
        />
      )}

      {/* QR modal */}
      {qrBill && (
        <QRModal
          invoiceNumber={qrBill.invoiceNumber}
          amount={qrBill.amount}
          onClose={() => setQrBill(null)}
        />
      )}
    </div>
  )
}

function SummaryChip({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div
      className="rounded-2xl p-3.5 text-center"
      style={{
        background: danger ? 'var(--danger-bg)' : 'rgba(255,255,255,0.82)',
        border: `1px solid ${danger ? 'rgba(185,28,63,0.18)' : 'var(--border)'}`,
        boxShadow: '0 2px 8px rgba(13,33,55,0.06)',
      }}
    >
      <p className="display text-xl font-bold tabular-nums" style={{ color: danger ? 'var(--danger)' : 'var(--ink)' }}>
        {value}
      </p>
      <p className="text-xs mt-0.5 font-medium" style={{ color: danger ? 'var(--danger)' : 'var(--muted)' }}>{label}</p>
    </div>
  )
}

function TrustChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color: 'var(--accent)' }}>{icon}</span>
      <span className="text-xs font-medium" style={{ color: 'var(--ink-2)' }}>{label}</span>
    </div>
  )
}

function ScanLine({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  )
}
