import { useState } from 'react'
import { Plus, CheckCircle2, Clock, ExternalLink, TrendingUp, Zap, Users, Activity } from 'lucide-react'
import { getAllBills, addBill, getAllPayments } from '@/lib/bills'
import type { Bill, Department } from '@/lib/bills'
import { DEPT_BG, DEPT_COLOR } from '@/lib/bills'
import { buildTxExplorerUrl } from '@/onchain-facts'
import { useI18n } from '@/lib/i18n'
import type { TKey } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'
import RateNote from '@/components/RateNote'

const TARGET_CHAIN_ID = 5042002

const DEPARTMENTS: Department[] = [
  'Emergency', 'Laboratory', 'Internal Medicine',
  'Radiology', 'Surgery', 'Cardiology', 'Pediatrics', 'Orthopedics',
]

type StaffTab = 'bills' | 'payments' | 'create'

export default function StaffDashboard() {
  const { t, tDept, tData, locale } = useI18n()
  const { money, moneyFull, unit, currency } = useCurrency()
  const [bills, setBills] = useState<Bill[]>(() => getAllBills())
  const [tab, setTab] = useState<StaffTab>('bills')
  const [form, setForm] = useState(() => ({
    patientName: '',
    medicalRecordId: '',
    invoiceNumber: '',
    department: 'Emergency' as Department,
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
  }))
  // Store the message key (not the text) so the error follows the selected language.
  const [formError, setFormError] = useState<TKey | ''>('')
  const [created, setCreated] = useState(false)

  const payments = getAllPayments()
  const unpaid = bills.filter((b) => b.status === 'unpaid')
  const paid = bills.filter((b) => b.status === 'paid')
  const totalSettled = paid.reduce((s, b) => s + parseFloat(b.amount), 0)

  const handleCreate = () => {
    setFormError('')
    if (!form.patientName.trim()) return setFormError('form.errName')
    if (!form.medicalRecordId.trim()) return setFormError('form.errMrn')
    if (!form.invoiceNumber.trim()) return setFormError('form.errInvoice')
    if (!form.description.trim()) return setFormError('form.errDesc')
    const amt = parseFloat(form.amount)
    if (!form.amount || isNaN(amt) || amt <= 0) return setFormError('form.errAmount')
    if (bills.some((b) => b.invoiceNumber === form.invoiceNumber.trim()))
      return setFormError('form.errDuplicate')

    addBill({
      patientName: form.patientName.trim(),
      medicalRecordId: form.medicalRecordId.trim(),
      invoiceNumber: form.invoiceNumber.trim(),
      department: form.department,
      description: form.description.trim(),
      amount: amt.toFixed(2),
      date: form.date,
    })
    setBills(getAllBills())
    setCreated(true)
    setForm({
      patientName: '',
      medicalRecordId: '',
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      department: 'Emergency',
      description: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
    })
    setTimeout(() => setCreated(false), 4000)
  }

  return (
    <div className="space-y-6">
      {/* ── Staff header ──────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl px-6 py-6"
        style={{
          background: 'linear-gradient(135deg, #0a2f50 0%, #0e5ca8 100%)',
          boxShadow: '0 8px 32px rgba(10,47,80,0.22)',
        }}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #93c5fd, transparent 70%)' }} />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="size-4" style={{ color: '#93c5fd' }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {t('staff.eyebrow')}
              </span>
            </div>
            <h2 className="display text-2xl font-bold text-white">{t('staff.title')}</h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.60)' }}>
              {t('staff.subtitle')}
            </p>
          </div>
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <Zap className="size-4" style={{ color: '#86efac' }} />
            <div>
              <p className="text-xs font-bold text-white">{t('staff.instant')}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{t('staff.noRecon')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t('stat.total')} value={String(bills.length)} icon={<Users className="size-4" />} />
        <StatCard label={t('stat.pending')} value={String(unpaid.length)} icon={<Clock className="size-4" />} danger={unpaid.length > 0} />
        <StatCard label={t('stat.settled')} value={String(paid.length)} icon={<CheckCircle2 className="size-4" />} success={paid.length > 0} />
        <StatCard label={t('stat.received')} value={moneyFull(totalSettled)} icon={<TrendingUp className="size-4" />} success={totalSettled > 0} />
      </div>

      <RateNote />

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div
        className="flex rounded-2xl p-1 gap-1"
        style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(13,33,55,0.06)' }}
      >
        {(
          [
            { id: 'bills', label: t('stab.bills') },
            { id: 'payments', label: t('stab.payments') },
            { id: 'create', label: t('stab.create') },
          ] as { id: StaffTab; label: string }[]
        ).map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all"
            style={{
              background: tab === tb.id ? '#fff' : 'transparent',
              color: tab === tb.id ? 'var(--ink)' : 'var(--muted)',
              boxShadow: tab === tb.id ? '0 1px 6px rgba(13,33,55,0.10)' : 'none',
            }}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* ── All Bills ─────────────────────────────────────────── */}
      {tab === 'bills' && (
        <div className="space-y-2.5">
          {bills.length === 0 && (
            <div className="py-14 text-center rounded-3xl" style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {t('staff.noBills')}
              </p>
            </div>
          )}
          {bills.map((b) => <StaffBillRow key={b.id} bill={b} />)}
        </div>
      )}

      {/* ── Incoming Payments ─────────────────────────────────── */}
      {tab === 'payments' && (
        <div className="space-y-2.5">
          {payments.length === 0 && (
            <div className="py-14 text-center rounded-3xl" style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {t('staff.noPayments')}
              </p>
            </div>
          )}
          {payments.map((p) => {
            const txUrl = buildTxExplorerUrl(TARGET_CHAIN_ID, p.txHash)
            return (
              <div
                key={p.id}
                className="rounded-2xl p-4 sm:p-5"
                style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(13,122,68,0.18)', boxShadow: '0 2px 8px rgba(13,122,68,0.06)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{p.patientName}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--subtle)' }}>{tData(p.description)}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                      {p.invoiceNumber} · {p.medicalRecordId} · {tDept(p.department)}
                    </p>
                    <p className="mono text-xs mt-1 truncate" style={{ color: 'var(--subtle)', fontSize: '11px' }}>
                      {p.walletAddress.slice(0, 10)}...{p.walletAddress.slice(-6)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="display text-xl font-bold tabular-nums" style={{ color: 'var(--success)' }}>
                      +{money(p.amount)}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ background: 'var(--success-bg)', color: 'var(--success)' }}
                    >
                      <span className="size-1.5 rounded-full inline-block" style={{ background: 'var(--success)' }} />
                      {unit} · {t('staff.instantTag')}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                    {new Date(p.paidAt).toLocaleString(locale, {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: 'numeric', minute: '2-digit',
                    })}
                  </span>
                  <a
                    href={txUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold"
                    style={{ color: 'var(--accent-hover)' }}
                  >
                    {t('sheet.viewArcscan')} <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Create Bill ───────────────────────────────────────── */}
      {tab === 'create' && (
        <div
          className="rounded-3xl p-5 sm:p-6 space-y-5"
          style={{ background: 'rgba(255,255,255,0.90)', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(13,33,55,0.08)' }}
        >
          <div>
            <h3 className="display text-xl font-bold" style={{ color: 'var(--ink)' }}>{t('form.title')}</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              {t('form.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t('form.patientName')}>
              <input
                value={form.patientName}
                onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))}
                placeholder={t('form.phName')}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                style={{ color: 'var(--ink)' }}
              />
            </Field>
            <Field label={t('form.mrn')}>
              <input
                value={form.medicalRecordId}
                onChange={(e) => setForm((f) => ({ ...f, medicalRecordId: e.target.value }))}
                placeholder={t('form.phMrn')}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                style={{ color: 'var(--ink)' }}
              />
            </Field>
            <Field label={t('form.invoice')}>
              <input
                value={form.invoiceNumber}
                onChange={(e) => setForm((f) => ({ ...f, invoiceNumber: e.target.value }))}
                placeholder="INV-2026-XXXX"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                style={{ color: 'var(--ink)' }}
              />
            </Field>
            <Field label={t('form.date')}>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: 'var(--ink)' }}
              />
            </Field>
          </div>

          <Field label={t('form.department')}>
            <select
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value as Department }))}
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: 'var(--ink)' }}
            >
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{tDept(d)}</option>)}
            </select>
          </Field>

          <Field label={t('form.description')}>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={t('form.phDesc')}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              style={{ color: 'var(--ink)' }}
            />
          </Field>

          <Field
            label={t('form.amount')}
            hint={currency === 'VND' && form.amount ? `≈ ${moneyFull(form.amount)}` : undefined}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>$</span>
              <input
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, '')
                  if (v === '' || /^\d*\.?\d*$/.test(v)) setForm((f) => ({ ...f, amount: v }))
                }}
                placeholder="0.00"
                className="display flex-1 bg-transparent text-2xl font-bold tabular-nums outline-none placeholder:text-slate-300"
                style={{ color: 'var(--ink)' }}
              />
              <span className="text-sm font-medium" style={{ color: 'var(--subtle)' }}>USDC</span>
            </div>
          </Field>

          {formError && (
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{ background: 'var(--danger-bg)', border: '1px solid rgba(185,28,63,0.18)' }}
            >
              <p className="text-xs font-medium" style={{ color: 'var(--danger)' }}>{t(formError)}</p>
            </div>
          )}

          {created && (
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{ background: 'var(--success-bg)', border: '1px solid rgba(13,122,68,0.20)' }}
            >
              <CheckCircle2 className="size-4 shrink-0" style={{ color: 'var(--success)' }} />
              <p className="text-xs font-semibold" style={{ color: 'var(--success)' }}>
                {t('form.success')}
              </p>
            </div>
          )}

          <button
            onClick={handleCreate}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: 'linear-gradient(135deg, #0a2f50 0%, #0e5ca8 100%)', boxShadow: '0 4px 20px rgba(14,92,168,0.35)' }}
          >
            <Plus className="size-4" />
            {t('form.submit')}
          </button>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label, value, icon, danger, success,
}: { label: string; value: string; icon: React.ReactNode; danger?: boolean; success?: boolean }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: danger ? 'var(--danger-bg)' : success ? 'var(--success-bg)' : 'rgba(255,255,255,0.82)',
        border: `1px solid ${danger ? 'rgba(185,28,63,0.15)' : success ? 'rgba(13,122,68,0.15)' : 'var(--border)'}`,
        boxShadow: '0 2px 8px rgba(13,33,55,0.06)',
      }}
    >
      <div
        className="flex items-center gap-1.5 mb-2"
        style={{ color: danger ? 'var(--danger)' : success ? 'var(--success)' : 'var(--muted)' }}
      >
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p
        className="display text-2xl font-bold tabular-nums"
        style={{ color: danger ? 'var(--danger)' : success ? 'var(--success)' : 'var(--ink)' }}
      >
        {value}
      </p>
    </div>
  )
}

function StaffBillRow({ bill }: { bill: Bill }) {
  const { t, tDept, tData } = useI18n()
  const { moneyFull } = useCurrency()
  const deptBg = DEPT_BG[bill.department] ?? 'rgba(14,92,168,0.08)'
  const deptTxt = DEPT_COLOR[bill.department] ?? 'var(--ink-2)'
  const isPaid = bill.status === 'paid'
  const txUrl = bill.paidTxHash ? buildTxExplorerUrl(TARGET_CHAIN_ID, bill.paidTxHash) : null

  return (
    <div
      className="rounded-2xl p-4 sm:p-5"
      style={{
        background: isPaid ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.82)',
        border: `1px solid ${isPaid ? 'rgba(13,122,68,0.18)' : 'var(--border)'}`,
        boxShadow: '0 2px 8px rgba(13,33,55,0.05)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-xl mt-0.5"
            style={{ background: deptBg }}
          >
            {isPaid
              ? <CheckCircle2 className="size-4" style={{ color: 'var(--success)' }} />
              : <Clock className="size-4" style={{ color: deptTxt }} />
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{bill.patientName}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
              {bill.invoiceNumber} · {bill.medicalRecordId}
            </p>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--subtle)' }}>
              {tDept(bill.department)} · {tData(bill.description)}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="display text-lg font-bold tabular-nums" style={{ color: 'var(--ink)' }}>{moneyFull(bill.amount)}</p>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold mt-1"
            style={{
              background: isPaid ? 'var(--success-bg)' : 'var(--danger-bg)',
              color: isPaid ? 'var(--success)' : 'var(--danger)',
            }}
          >
            <span className="size-1.5 rounded-full inline-block" style={{ background: isPaid ? 'var(--success)' : 'var(--danger)' }} />
            {isPaid ? t('status.settled') : t('status.pending')}
          </span>
        </div>
      </div>
      {isPaid && txUrl && (
        <div className="mt-3 flex justify-end">
          <a
            href={txUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: 'var(--accent-hover)' }}
          >
            ArcScan <ExternalLink className="size-3" />
          </a>
        </div>
      )}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--muted)', letterSpacing: '0.06em' }}>
        <span>{label}</span>
        {hint && (
          <span className="mono normal-case tabular-nums" style={{ color: 'var(--accent)', letterSpacing: 0 }}>{hint}</span>
        )}
      </label>
      <div
        className="rounded-xl px-3.5 py-3"
        style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
      >
        {children}
      </div>
    </div>
  )
}
