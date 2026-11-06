import { Globe } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'

const OPTIONS: { id: Lang; label: string; full: string }[] = [
  { id: 'en', label: 'EN', full: 'English' },
  { id: 'vi', label: 'VI', full: 'Tiếng Việt' },
]

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t('lang.label')}
      className="flex items-center gap-0.5 rounded-lg p-0.5"
      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
    >
      <Globe className="mx-1.5 hidden size-3.5 sm:block" style={{ color: 'rgba(255,255,255,0.55)' }} />
      {OPTIONS.map((o) => {
        const active = lang === o.id
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => setLang(o.id)}
            aria-pressed={active}
            title={o.full}
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
