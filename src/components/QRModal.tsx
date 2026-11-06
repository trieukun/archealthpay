import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Copy, Check } from 'lucide-react'
import QRCode from 'qrcode'
import { buildShareLink } from '@/lib/share'
import { useI18n } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'

interface QRModalProps {
  invoiceNumber: string
  amount: string
  onClose: () => void
}

export default function QRModal({ invoiceNumber, amount, onClose }: QRModalProps) {
  const { t } = useI18n()
  const { moneyFull } = useCurrency()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    void buildShareLink(`/?invoice=${encodeURIComponent(invoiceNumber)}`).then((link) => {
      if (cancelled) return
      setUrl(link)
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, link, {
          width: 240,
          margin: 2,
          color: { dark: '#122d45', light: '#ffffff' },
        }).catch(() => {/* ignore */})
      }
    })
    return () => { cancelled = true }
  }, [invoiceNumber])

  const handleCopy = async () => {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <motion.div
          className="relative w-full max-w-xs overflow-hidden rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow: '0 24px 64px rgba(18,45,69,0.18)',
          }}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Spectral strip */}
          <div
            className="h-1"
            style={{
              background: 'linear-gradient(90deg,#4ade80,#60a5fa,#a78bfa,#f472b6)',
            }}
          />

          <div className="px-6 pt-5 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="display text-lg font-bold" style={{ color: 'var(--ink)' }}>
                  {t('qr.title')}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {invoiceNumber} · {moneyFull(amount)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-full hover:bg-black/5 transition-colors"
                style={{ color: 'var(--muted)' }}
              >
                <X className="size-4" />
              </button>
            </div>

            {/* QR canvas */}
            <div className="flex justify-center mb-4">
              <div
                className="rounded-2xl p-3"
                style={{ background: '#fff', border: '1px solid var(--border)' }}
              >
                <canvas ref={canvasRef} />
              </div>
            </div>

            <p className="text-xs text-center mb-4" style={{ color: 'var(--muted)' }}>
              {t('qr.scan')}
            </p>

            {/* Copy link */}
            <button
              onClick={() => { void handleCopy() }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: copied ? 'rgba(26,128,71,0.10)' : 'var(--surface-muted)',
                color: copied ? 'var(--success)' : 'var(--ink-2)',
                border: '1px solid var(--border)',
              }}
            >
              {copied ? (
                <><Check className="size-4" /> {t('qr.copied')}</>
              ) : (
                <><Copy className="size-4" /> {t('qr.copy')}</>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
