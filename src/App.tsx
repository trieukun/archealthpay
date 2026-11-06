import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { ConnectKitButton } from 'connectkit'
import { User, LayoutDashboard, Shield, Activity } from 'lucide-react'
import PatientPortal from './pages/PatientPortal'
import StaffDashboard from './pages/StaffDashboard'
import LanguageProvider from '@/components/LanguageProvider'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import CurrencyProvider from '@/components/CurrencyProvider'
import CurrencySwitcher from '@/components/CurrencySwitcher'
import ChatAssistant from '@/components/ChatAssistant'
import { useI18n } from '@/lib/i18n'

function Nav() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const isStaff = location.pathname === '/staff'

  return (
    <header className="sticky top-0 z-40 w-full" style={{ background: '#0a3d6b', boxShadow: '0 1px 0 rgba(255,255,255,0.08), 0 4px 24px rgba(10,61,107,0.35)' }}>
      {/* Top accent strip */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 35%, #93c5fd 65%, #bfdbfe 100%)' }} />

      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {/* Hospital cross mark */}
          <div className="relative flex size-10 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)' }}>
            <Activity className="size-5 text-white" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="display text-lg font-bold text-white tracking-tight">ArcHealth</span>
              <span className="display text-lg font-bold" style={{ color: '#60a5fa' }}>Pay</span>
            </div>
            <p className="text-xs leading-none" style={{ color: 'rgba(255,255,255,0.50)' }}>
              {t('app.tagline')}
            </p>
          </div>
        </div>

        {/* Center: view pills */}
        <nav className="hidden sm:flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <NavPill
            active={!isStaff}
            icon={<User className="size-3.5" />}
            label={t('nav.patientPortal')}
            onClick={() => { void navigate('/') }}
          />
          <NavPill
            active={isStaff}
            icon={<LayoutDashboard className="size-3.5" />}
            label={t('nav.staffDashboard')}
            onClick={() => { void navigate('/staff') }}
          />
        </nav>

        {/* Right: wallet */}
        <div className="flex items-center gap-3">
          <ConnectKitButton label={t('nav.connect')} />
        </div>
      </div>

      {/* Preferences bar: language + currency */}
      <div style={{ background: 'rgba(0,0,0,0.14)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-2">
          <div className="hidden sm:flex items-center gap-1.5">
            <Shield className="size-3" style={{ color: '#86efac' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.70)' }}>{t('nav.secured')}</span>
          </div>
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
            <LanguageSwitcher />
            <CurrencySwitcher />
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="flex sm:hidden border-t px-4 pb-2 pt-2 gap-1" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
        <MobileNavPill active={!isStaff} icon={<User className="size-4" />} label={t('nav.patient')} onClick={() => { void navigate('/') }} />
        <MobileNavPill active={isStaff} icon={<LayoutDashboard className="size-4" />} label={t('nav.staff')} onClick={() => { void navigate('/staff') }} />
      </div>
    </header>
  )
}

function NavPill({ active, icon, label, onClick }: {
  active: boolean; icon: React.ReactNode; label: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all"
      style={{
        background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
        color: active ? '#fff' : 'rgba(255,255,255,0.55)',
        border: active ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function MobileNavPill({ active, icon, label, onClick }: {
  active: boolean; icon: React.ReactNode; label: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all"
      style={{
        background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
        color: active ? '#fff' : 'rgba(255,255,255,0.45)',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function Layout() {
  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg-gradient)' }}>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6">
        <Routes>
          <Route path="/" element={<PatientPortal />} />
          <Route path="/staff" element={<StaffDashboard />} />
        </Routes>
      </main>
      <ChatAssistant />
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <HashRouter>
          <Layout />
        </HashRouter>
      </CurrencyProvider>
    </LanguageProvider>
  )
}
