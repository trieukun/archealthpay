import { forwardRef } from 'react'
import type { Bill } from '@/lib/bills'
import { buildTxExplorerUrl } from '@/onchain-facts'
import { useI18n } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'

const TARGET_CHAIN_ID = 5042002

interface ReceiptPrintProps {
  bill: Bill
  txHash: string
  walletAddress: string
  /** Pre-formatted paid-at string so the component stays pure (no new Date() during render). */
  paidAtFormatted: string
}

// This component is rendered off-screen and passed to react-to-print.
// It uses only inline styles so the printed output is self-contained.
const ReceiptPrint = forwardRef<HTMLDivElement, ReceiptPrintProps>(
  ({ bill, txHash, walletAddress, paidAtFormatted }, ref) => {
    const { t, tDept, tData, locale } = useI18n()
    const { currency, moneyFull } = useCurrency()
    const txUrl = buildTxExplorerUrl(TARGET_CHAIN_ID, txHash)
    const paidAt = paidAtFormatted

    return (
      <div
        ref={ref}
        style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
          color: '#122d45',
          background: '#ffffff',
          padding: '48px 40px',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 32,
            paddingBottom: 24,
            borderBottom: '2px solid #122d45',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#122d45',
              }}
            >
              ArcHealth Pay
            </div>
            <div style={{ fontSize: 12, color: '#6b6580', marginTop: 2 }}>
              {t('receipt.subtitle')}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: 20,
                background: 'rgba(26,128,71,0.12)',
                color: '#1a8047',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {t('receipt.paid')}
            </div>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {t('receipt.title')}
          </div>
          <div style={{ fontSize: 13, color: '#6b6580', marginTop: 4 }}>
            {paidAt}
          </div>
        </div>

        {/* Bill details */}
        <div
          style={{
            background: '#f5f5f8',
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 24,
          }}
        >
          <Row label={t('receipt.invoiceNumber')} value={bill.invoiceNumber} />
          <Row label={t('receipt.patientName')} value={bill.patientName} />
          <Row label={t('receipt.department')} value={tDept(bill.department)} />
          <Row label={t('receipt.description')} value={tData(bill.description)} />
          <Row label={t('receipt.serviceDate')} value={new Date(bill.date).toLocaleDateString(locale, { dateStyle: 'long' })} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: 12,
              marginTop: 12,
              borderTop: '1px solid rgba(18,45,69,0.12)',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: '#122d45' }}>{t('receipt.amountPaid')}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#122d45', letterSpacing: '-0.02em' }}>
              ${bill.amount} USDC
            </span>
          </div>
          {currency === 'VND' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: '#6b6580' }}>
              <span>{t('receipt.reference')}</span>
              <span>≈ {moneyFull(bill.amount)}</span>
            </div>
          )}
        </div>

        {/* Transaction details */}
        <div
          style={{
            background: '#f5f5f8',
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6b6580', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            {t('receipt.blockchainTx')}
          </div>
          <Row label={t('receipt.network')} value="Arc Testnet" />
          <Row label={t('receipt.token')} value="USDC" />
          <Row
            label={t('receipt.payingWallet')}
            value={`${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`}
            mono
          />
          <Row
            label={t('receipt.txHash')}
            value={`${txHash.slice(0, 10)}...${txHash.slice(-8)}`}
            mono
          />
          <div style={{ marginTop: 10 }}>
            <span style={{ fontSize: 11, color: '#8a849c' }}>{t('receipt.verify')}</span>
            <span style={{ fontSize: 11, color: '#1061a6', wordBreak: 'break-all' }}>{txUrl}</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            fontSize: 11,
            color: '#8a849c',
            textAlign: 'center',
            paddingTop: 20,
            borderTop: '1px solid rgba(18,45,69,0.10)',
          }}
        >
          {t('receipt.footer')}
        </div>
      </div>
    )
  },
)

ReceiptPrint.displayName = 'ReceiptPrint'

function Row({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 8,
        gap: 16,
      }}
    >
      <span style={{ fontSize: 13, color: '#6b6580', flexShrink: 0 }}>{label}</span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: '#334155',
          textAlign: 'right',
          fontFamily: mono ? "'JetBrains Mono', Menlo, monospace" : 'inherit',
          wordBreak: 'break-all',
        }}
      >
        {value}
      </span>
    </div>
  )
}

export default ReceiptPrint
