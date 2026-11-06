import { AnimatePresence, motion } from 'framer-motion'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useReadContract,
} from 'wagmi'
import { erc20Abi, isAddress } from 'viem'
import {
  X, Loader2, CheckCircle2, ExternalLink, ShieldCheck,
  AlertCircle, Printer, Zap, Heart,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import { ConnectKitButton } from 'connectkit'
import { getUsdc, buildTxExplorerUrl } from '@/onchain-facts'
import { parseAmount, Amount, usdcDecimalsFor } from '@/onchain-money'
import { markBillPaid } from '@/lib/bills'
import ReceiptPrint from './ReceiptPrint'
import type { Bill } from '@/lib/bills'
import { useI18n } from '@/lib/i18n'
import type { I18nValue } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'

const TARGET_CHAIN_ID = 5042002

// Hospital treasury wallet — replace with real hospital wallet before production
const HOSPITAL_WALLET = '0x5B12Ce46C7194aD57d143bC22847224047b1Ef42' as const

const springs = {
  sheet: { type: 'spring' as const, damping: 30, stiffness: 280, mass: 0.8 },
}

function parseOnchainError(error: unknown, t: I18nValue['t']): string {
  const msg = (error as { message?: string })?.message?.toLowerCase() ?? ''
  if (msg.includes('user rejected') || (error as { code?: number })?.code === 4001)
    return t('err.cancelled')
  if (msg.includes('insufficient funds') || msg.includes('exceeds balance'))
    return t('err.insufficient')
  if (msg.includes('reverted')) return t('err.failed')
  if (msg.includes('network') || msg.includes('timeout')) return t('err.network')
  return t('err.generic')
}

interface PaymentSheetProps {
  bill: Bill
  onClose: () => void
  onPaid: (billId: string, txHash: string) => void
}

export default function PaymentSheet({ bill, onClose, onPaid }: PaymentSheetProps) {
  const { t, tDept, tData, locale } = useI18n()
  const { currency, num, money, moneyFull, unit, usdcHint } = useCurrency()
  const { address, isConnected, chainId } = useAccount()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  const [showReceipt, setShowReceipt] = useState(false)

  const receiptRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({ contentRef: receiptRef })

  const usdcFact = getUsdc(TARGET_CHAIN_ID)!
  const USDC_ADDRESS = usdcFact.address as `0x${string}`

  const onPaidRef = useRef(onPaid)
  onPaidRef.current = onPaid

  useEffect(() => {
    if (!isSuccess || !hash || !address) return
    markBillPaid(bill.id, hash, address)
    onPaidRef.current(bill.id, hash)
    setShowReceipt(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess])

  const { data: rawBalance } = useReadContract({
    address: USDC_ADDRESS,
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
  const billAmount = parseFloat(bill.amount)
  const hasEnoughBalance = balance ? parseFloat(balance.toFixed(6)) >= billAmount : false
  const wrongChain = isConnected && chainId !== TARGET_CHAIN_ID
  const txUrl = hash ? buildTxExplorerUrl(TARGET_CHAIN_ID, hash) : null
  const paid = showReceipt || isSuccess

  const paidAtFormatted = bill.paidAt
    ? new Date(bill.paidAt).toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' })
    : ''

  const handlePay = () => {
    if (wrongChain) { switchChain({ chainId: TARGET_CHAIN_ID }); return }
    if (!isAddress(HOSPITAL_WALLET)) return
    const parsed = parseAmount(TARGET_CHAIN_ID, bill.amount)
    writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [HOSPITAL_WALLET, parsed.raw],
      chainId: TARGET_CHAIN_ID,
    })
  }

  const errorMsg = writeError ? parseOnchainError(writeError, t) : null
  const busy = isPending || isConfirming || isSwitching
  // The transfer is always in USDC; in VND mode show the VND value with the real USDC amount.
  const payLabel =
    currency === 'VND'
      ? `${moneyFull(bill.amount)} (${usdcHint(bill.amount) ?? ''})`
      : moneyFull(bill.amount)

  return (
    <>
      {/* Hidden print layout */}
      {paid && hash && address && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <ReceiptPrint
            ref={receiptRef}
            bill={{ ...bill, paidTxHash: hash }}
            txHash={hash}
            walletAddress={address}
            paidAtFormatted={paidAtFormatted}
          />
        </div>
      )}

      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
          <motion.section
            className="relative w-full max-w-lg overflow-hidden rounded-t-3xl"
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={springs.sheet}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Spectral strip */}
            <div
              className="h-1 w-full"
              style={{ background: 'linear-gradient(90deg,#4ade80 0%,#60a5fa 35%,#a78bfa 65%,#f472b6 100%)' }}
            />
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-black/10" />
            </div>

            <div className="px-6 pb-8 pt-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div
                    className="flex size-8 items-center justify-center rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #122d45 0%, #1061a6 100%)' }}
                  >
                    <Heart className="size-4 text-white" />
                  </div>
                  <div>
                    <h2 className="display text-xl font-bold" style={{ color: 'var(--ink)' }}>
                      {paid ? t('sheet.confirmedTitle') : t('sheet.confirmTitle')}
                    </h2>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {bill.invoiceNumber} · {bill.patientName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex size-8 items-center justify-center rounded-full hover:bg-black/5 transition-colors"
                  style={{ color: 'var(--muted)' }}
                >
                  <X className="size-4" />
                </button>
              </div>

              {!paid ? (
                <>
                  {/* Bill summary */}
                  <div
                    className="rounded-2xl p-4 mb-4"
                    style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
                  >
                    <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                      {tData(bill.description)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                      {tDept(bill.department)} · {new Date(bill.date).toLocaleDateString(locale, { dateStyle: 'medium' })}
                    </p>

                    {/* Itemized lines */}
                    {bill.lineItems && bill.lineItems.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {bill.lineItems.map((item, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-xs" style={{ color: 'var(--ink-2)' }}>{tData(item.label)}</span>
                            <span className="mono text-xs tabular-nums" style={{ color: 'var(--ink-2)' }}>{money(item.amount)}</span>
                          </div>
                        ))}
                        <div
                          className="flex justify-between pt-2 mt-1"
                          style={{ borderTop: '1px solid var(--border)' }}
                        >
                          <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{t('sheet.total')}</span>
                          <div className="flex items-baseline gap-1">
                            <span className="display text-2xl font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
                              {money(bill.amount)}
                            </span>
                            <span className="text-sm" style={{ color: 'var(--subtle)' }}>{unit}</span>
                            {usdcHint(bill.amount) && (
                              <span className="mono ml-1 text-xs tabular-nums" style={{ color: 'var(--subtle)' }}>
                                {usdcHint(bill.amount)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {!bill.lineItems && (
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="display text-3xl font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
                          {money(bill.amount)}
                        </span>
                        <span className="text-base font-medium" style={{ color: 'var(--subtle)' }}>{unit}</span>
                        {usdcHint(bill.amount) && (
                          <span className="mono ml-1 text-xs tabular-nums" style={{ color: 'var(--subtle)' }}>
                            {usdcHint(bill.amount)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Balance + destination row */}
                  {isConnected && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="rounded-xl p-2.5" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('sheet.yourBalance')}</p>
                        <p
                          className="mono text-sm font-semibold tabular-nums mt-0.5"
                          style={{ color: hasEnoughBalance ? 'var(--success)' : 'var(--danger)' }}
                        >
                          {balance ? num(formattedBalance) : formattedBalance} {unit}
                        </p>
                      </div>
                      <div className="rounded-xl p-2.5" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('sheet.to')}</p>
                        <p className="mono text-sm font-semibold truncate mt-0.5" style={{ color: 'var(--ink-2)' }}>
                          {HOSPITAL_WALLET.slice(0, 6)}...{HOSPITAL_WALLET.slice(-4)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Insufficient balance */}
                  {isConnected && !wrongChain && !hasEnoughBalance && balance !== null && (
                    <div
                      className="flex items-start gap-2 rounded-xl p-3 mb-4"
                      style={{ background: 'rgba(186,43,76,0.07)', border: '1px solid rgba(186,43,76,0.20)' }}
                    >
                      <AlertCircle className="size-4 mt-0.5 shrink-0" style={{ color: 'var(--danger)' }} />
                      <p className="text-xs" style={{ color: 'var(--danger)' }}>
                        {t('sheet.insufficient')}
                      </p>
                    </div>
                  )}

                  {/* Error */}
                  {errorMsg && (
                    <div
                      className="flex items-start gap-2 rounded-xl p-3 mb-4"
                      style={{ background: 'rgba(186,43,76,0.07)', border: '1px solid rgba(186,43,76,0.20)' }}
                    >
                      <AlertCircle className="size-4 mt-0.5 shrink-0" style={{ color: 'var(--danger)' }} />
                      <p className="text-xs" style={{ color: 'var(--danger)' }}>{errorMsg}</p>
                    </div>
                  )}

                  {/* CTA */}
                  {!isConnected ? (
                    <div className="flex justify-center mb-4">
                      <ConnectKitButton label={t('sheet.connectToPay')} />
                    </div>
                  ) : (
                    <button
                      disabled={busy || (!wrongChain && !hasEnoughBalance && balance !== null)}
                      onClick={() => { if (errorMsg) reset(); handlePay() }}
                      className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 mb-4"
                      style={{ background: 'linear-gradient(135deg, #122d45 0%, #1061a6 100%)' }}
                    >
                      {isSwitching ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="size-4 animate-spin" /> {t('sheet.switching')}
                        </span>
                      ) : wrongChain ? (
                        t('sheet.switchTo')
                      ) : isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="size-4 animate-spin" /> {t('sheet.confirmWallet')}
                        </span>
                      ) : isConfirming ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="size-4 animate-spin" /> {t('sheet.confirming')}
                        </span>
                      ) : (
                        t('sheet.pay', { amount: payLabel })
                      )}
                    </button>
                  )}

                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="size-3" style={{ color: 'var(--subtle)' }} />
                      <p className="text-xs" style={{ color: 'var(--subtle)' }}>{t('sheet.usdcOnArc')}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="size-3" style={{ color: 'var(--subtle)' }} />
                      <p className="text-xs" style={{ color: 'var(--subtle)' }}>{t('sheet.nearZero')}</p>
                    </div>
                  </div>
                </>
              ) : (
                /* E-Receipt */
                <div className="flex flex-col items-center gap-4 py-2">
                  <div
                    className="flex size-16 items-center justify-center rounded-full"
                    style={{ background: 'rgba(26,128,71,0.10)' }}
                  >
                    <CheckCircle2 className="size-8" style={{ color: 'var(--success)' }} />
                  </div>
                  <div className="text-center">
                    <h3 className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                      {t('sheet.sent')}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                      {t('sheet.receiptReady')}
                    </p>
                  </div>

                  {/* Receipt card */}
                  <div
                    className="w-full rounded-2xl p-4 space-y-2"
                    style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="size-4" style={{ color: '#1061a6' }} />
                      <span className="text-xs font-bold tracking-wide uppercase" style={{ color: '#1061a6' }}>
                        {t('sheet.eReceipt')}
                      </span>
                    </div>
                    <ReceiptRow label={t('sheet.patient')} value={bill.patientName} />
                    <ReceiptRow label={t('sheet.medicalRecord')} value={bill.medicalRecordId} />
                    <ReceiptRow label={t('sheet.invoice')} value={bill.invoiceNumber} />
                    <ReceiptRow label={t('sheet.department')} value={tDept(bill.department)} />
                    <ReceiptRow label={t('sheet.description')} value={tData(bill.description)} />
                    <ReceiptRow label={t('sheet.amountPaid')} value={`$${bill.amount} USDC`} bold />
                    {currency === 'VND' && (
                      <ReceiptRow label={t('receipt.reference')} value={`≈ ${moneyFull(bill.amount)}`} />
                    )}
                    {txUrl && (
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span style={{ color: 'var(--muted)' }}>{t('sheet.transaction')}</span>
                        <a
                          href={txUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 font-medium underline"
                          style={{ color: 'var(--accent-hover)' }}
                        >
                          {t('sheet.viewArcscan')} <ExternalLink className="size-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Sync note */}
                  <div
                    className="w-full flex items-start gap-2 rounded-xl p-3"
                    style={{ background: 'rgba(16,97,166,0.06)', border: '1px solid rgba(16,97,166,0.15)' }}
                  >
                    <Zap className="size-4 mt-0.5 shrink-0" style={{ color: '#1061a6' }} />
                    <p className="text-xs" style={{ color: '#1061a6' }}>
                      {t('sheet.syncNote')}
                    </p>
                  </div>

                  <button
                    onClick={() => handlePrint()}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: 'linear-gradient(135deg, #122d45 0%, #1061a6 100%)' }}
                  >
                    <Printer className="size-4" />
                    {t('sheet.print')}
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full rounded-2xl py-3 text-sm font-semibold"
                    style={{ background: 'var(--surface-muted)', color: 'var(--ink-2)', border: '1px solid var(--border)' }}
                  >
                    {t('sheet.back')}
                  </button>
                </div>
              )}
            </div>
          </motion.section>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

function ReceiptRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-xs gap-3">
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span
        className={`text-right ${bold ? 'font-semibold tabular-nums' : 'font-medium'}`}
        style={{ color: bold ? 'var(--ink)' : 'var(--ink-2)' }}
      >
        {value}
      </span>
    </div>
  )
}
