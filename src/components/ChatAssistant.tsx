import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, MessageCircle, Send, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'
import { SUGGESTIONS, getAnswer } from '@/lib/assistant'

interface Msg {
  role: 'user' | 'bot'
  text: string
}

const REPLY_DELAY_MS = 550

export default function ChatAssistant() {
  const { t, lang, tDept, tData } = useI18n()
  const { moneyFull } = useCurrency()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, typing, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const send = (raw: string) => {
    const text = raw.trim()
    if (!text || typing) return
    setMessages((m) => [...m, { role: 'user', text }])
    setDraft('')
    setTyping(true)
    const reply = getAnswer(text, { lang, moneyFull, tDept, tData })
    timer.current = setTimeout(() => {
      setMessages((m) => [...m, { role: 'bot', text: reply }])
      setTyping(false)
    }, REPLY_DELAY_MS)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    send(draft)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label={t('chat.title')}
            onKeyDown={onKeyDown}
            className="flex w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl"
            style={{
              height: 'min(34rem, calc(100dvh - 7rem))',
              background: 'rgba(255,255,255,0.97)',
              border: '1px solid var(--border)',
              boxShadow: '0 24px 64px rgba(10,47,80,0.28)',
            }}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ background: 'linear-gradient(135deg, #0a2f50 0%, #0e5ca8 100%)' }}
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.20)' }}
              >
                <Bot className="size-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="display truncate text-sm font-bold text-white">{t('chat.title')}</p>
                <p className="truncate text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {t('chat.subtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('chat.close')}
                className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              >
                <X className="size-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div
              role="log"
              aria-live="polite"
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
              style={{ background: 'var(--surface-muted)' }}
            >
              <Bubble role="bot" text={t('chat.greeting')} />
              {messages.map((m, i) => (
                <Bubble key={i} role={m.role} text={m.text} />
              ))}
              {typing && (
                <div className="flex items-center gap-1.5 pl-1" role="status" aria-label={t('chat.typing')}>
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="size-2 animate-bounce rounded-full"
                      style={{ background: 'var(--subtle)', animationDelay: `${d * 140}ms` }}
                    />
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Suggestions */}
            <div
              className="flex gap-2 overflow-x-auto px-4 py-2.5"
              style={{ borderTop: '1px solid var(--border)' }}
              aria-label={t('chat.suggested')}
            >
              {SUGGESTIONS[lang].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  disabled={typing}
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:brightness-95 disabled:opacity-50"
                  style={{ background: 'var(--brand-pale)', color: 'var(--brand)' }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 px-3 pb-2 pt-1"
            >
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t('chat.placeholder')}
                maxLength={300}
                className="h-11 flex-1 rounded-2xl px-4 text-sm outline-none placeholder:text-slate-400"
                style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--ink)' }}
              />
              <button
                type="submit"
                disabled={!draft.trim() || typing}
                aria-label={t('chat.send')}
                className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-white transition-all hover:scale-[1.03] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #0a2f50 0%, #0e5ca8 100%)' }}
              >
                <Send className="size-4" />
              </button>
            </form>
            <p className="px-4 pb-3 text-center" style={{ color: 'var(--subtle)', fontSize: '11px' }}>
              {t('chat.disclaimer')}
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Launcher */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t('chat.close') : t('chat.open')}
        aria-expanded={open}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex size-14 items-center justify-center rounded-full text-white"
        style={{
          background: 'linear-gradient(135deg, #0a2f50 0%, #0e5ca8 100%)',
          boxShadow: '0 8px 28px rgba(10,47,80,0.40)',
        }}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </motion.button>
    </div>
  )
}

function Bubble({ role, text }: { role: 'user' | 'bot'; text: string }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
        style={
          isUser
            ? { background: 'var(--brand-mid)', color: '#fff', borderBottomRightRadius: 6 }
            : {
                background: '#fff',
                color: 'var(--ink)',
                border: '1px solid var(--border)',
                borderBottomLeftRadius: 6,
              }
        }
      >
        {text}
      </div>
    </div>
  )
}
