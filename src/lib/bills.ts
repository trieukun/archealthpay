// Bill data layer — types, localStorage store, and demo seed data.

export type BillStatus = 'unpaid' | 'paid'

export type Department =
  | 'Emergency'
  | 'Laboratory'
  | 'Internal Medicine'
  | 'Radiology'
  | 'Surgery'
  | 'Cardiology'
  | 'Pediatrics'
  | 'Orthopedics'

export interface LineItem {
  label: string
  amount: string // e.g. "4.50"
}

export interface Bill {
  id: string
  patientName: string
  medicalRecordId: string   // e.g. "MRN-10042"
  invoiceNumber: string
  description: string
  date: string              // ISO date string
  amount: string            // total USDC amount, e.g. "12.50"
  department: Department
  status: BillStatus
  lineItems?: LineItem[]
  paidAt?: string           // ISO date string
  paidTxHash?: string
}

export interface PaymentRecord {
  id: string
  billId: string
  invoiceNumber: string
  description: string
  amount: string
  department: string
  patientName: string
  medicalRecordId: string
  paidAt: string
  txHash: string
  walletAddress: string
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const BILLS_KEY = 'archealth:bills'
const PAYMENTS_KEY = 'archealth:payments'

// ─── Demo seed data ───────────────────────────────────────────────────────────

const SEED_BILLS: Bill[] = [
  {
    id: 'bill-001',
    patientName: 'Nguyễn Văn A',
    medicalRecordId: 'MRN-10042',
    invoiceNumber: 'INV-2026-0841',
    description: 'Emergency Room Visit — Consultation & X-Ray',
    date: '2026-10-20',
    amount: '12.50',
    department: 'Emergency',
    status: 'unpaid',
    lineItems: [
      { label: 'Emergency consultation', amount: '5.00' },
      { label: 'X-Ray (chest, 2 views)', amount: '4.50' },
      { label: 'Nursing care & monitoring', amount: '3.00' },
    ],
  },
  {
    id: 'bill-002',
    patientName: 'Nguyễn Văn A',
    medicalRecordId: 'MRN-10042',
    invoiceNumber: 'INV-2026-0902',
    description: 'Lab Work — Blood Panel & Urinalysis',
    date: '2026-10-22',
    amount: '8.00',
    department: 'Laboratory',
    status: 'unpaid',
    lineItems: [
      { label: 'Complete blood count (CBC)', amount: '3.00' },
      { label: 'Comprehensive metabolic panel', amount: '3.00' },
      { label: 'Urinalysis', amount: '2.00' },
    ],
  },
  {
    id: 'bill-003',
    patientName: 'Nguyễn Văn A',
    medicalRecordId: 'MRN-10042',
    invoiceNumber: 'INV-2026-0955',
    description: 'Follow-up Consultation — Internal Medicine',
    date: '2026-10-24',
    amount: '5.00',
    department: 'Internal Medicine',
    status: 'unpaid',
    lineItems: [
      { label: 'Physician consultation', amount: '4.00' },
      { label: 'Prescription processing fee', amount: '1.00' },
    ],
  },
  {
    id: 'bill-004',
    patientName: 'Nguyễn Văn B',
    medicalRecordId: 'MRN-20091',
    invoiceNumber: 'INV-2026-1010',
    description: 'Cardiology Stress Test & ECG',
    date: '2026-10-25',
    amount: '15.00',
    department: 'Cardiology',
    status: 'unpaid',
    lineItems: [
      { label: 'Cardiac stress test', amount: '8.00' },
      { label: 'ECG (12-lead)', amount: '4.00' },
      { label: 'Cardiologist interpretation', amount: '3.00' },
    ],
  },
  {
    id: 'bill-005',
    patientName: 'Đinh Văn C',
    medicalRecordId: 'MRN-30017',
    invoiceNumber: 'INV-2026-1024',
    description: 'Orthopedic Assessment — Knee MRI',
    date: '2026-10-26',
    amount: '20.00',
    department: 'Orthopedics',
    status: 'unpaid',
    lineItems: [
      { label: 'MRI scan (knee)', amount: '12.00' },
      { label: 'Orthopedic consultation', amount: '5.00' },
      { label: 'Radiology report', amount: '3.00' },
    ],
  },
  {
    id: 'bill-006',
    patientName: 'Lê Thị D',
    medicalRecordId: 'MRN-40023',
    invoiceNumber: 'INV-2026-1058',
    description: 'Abdominal Ultrasound — Radiology Report',
    date: '2026-10-27',
    amount: '18.00',
    department: 'Radiology',
    status: 'unpaid',
    lineItems: [
      { label: 'Abdominal ultrasound', amount: '10.00' },
      { label: 'Radiologist consultation', amount: '5.00' },
      { label: 'Radiology report', amount: '3.00' },
    ],
  },
]

// Earlier demo data used different sample names. Rename them in data already
// saved in the browser so existing sessions match the current sample patients.
const NAME_MIGRATION: Record<string, string> = {
  'Alex Johnson': 'Nguyễn Văn A',
  'Maria Chen': 'Nguyễn Văn B',
  'James Patel': 'Đinh Văn C',
}

function migrateBills(bills: Bill[]): { bills: Bill[]; changed: boolean } {
  let changed = false
  const renamed = bills.map((b) => {
    const next = NAME_MIGRATION[b.patientName]
    if (!next) return b
    changed = true
    return { ...b, patientName: next }
  })
  const ids = new Set(renamed.map((b) => b.id))
  const missing = SEED_BILLS.filter((s) => !ids.has(s.id) && s.id === 'bill-006')
  if (missing.length > 0) changed = true
  return { bills: [...renamed, ...missing], changed }
}

// ─── Bills store ──────────────────────────────────────────────────────────────

function loadBills(): Bill[] {
  try {
    const raw = localStorage.getItem(BILLS_KEY)
    if (raw) {
      const { bills, changed } = migrateBills(JSON.parse(raw) as Bill[])
      if (changed) saveBills(bills)
      return bills
    }
  } catch {
    // ignore parse errors
  }
  saveBills(SEED_BILLS)
  return SEED_BILLS
}

function saveBills(bills: Bill[]): void {
  localStorage.setItem(BILLS_KEY, JSON.stringify(bills))
}

export function getAllBills(): Bill[] {
  return loadBills()
}

export function getBillByInvoice(invoiceNumber: string): Bill | undefined {
  return loadBills().find(
    (b) => b.invoiceNumber.toLowerCase() === invoiceNumber.toLowerCase().trim(),
  )
}

export function getBillsByMedicalRecord(medicalRecordId: string): Bill[] {
  return loadBills().filter(
    (b) => b.medicalRecordId.toLowerCase() === medicalRecordId.toLowerCase().trim(),
  )
}

export function addBill(bill: Omit<Bill, 'id' | 'status'>): Bill {
  const bills = loadBills()
  const newBill: Bill = { ...bill, id: 'bill-' + Date.now(), status: 'unpaid' }
  saveBills([...bills, newBill])
  return newBill
}

export function markBillPaid(billId: string, txHash: string, walletAddress: string): void {
  const bills = loadBills()
  const updated = bills.map((b) => {
    if (b.id !== billId) return b
    const paidBill: Bill = { ...b, status: 'paid', paidAt: new Date().toISOString(), paidTxHash: txHash }
    addPaymentRecord({
      billId: b.id,
      invoiceNumber: b.invoiceNumber,
      description: b.description,
      amount: b.amount,
      department: b.department,
      patientName: b.patientName,
      medicalRecordId: b.medicalRecordId,
      txHash,
      walletAddress,
    })
    return paidBill
  })
  saveBills(updated)
}

// ─── Payments history store ───────────────────────────────────────────────────

function loadPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(PAYMENTS_KEY)
    if (raw) {
      return (JSON.parse(raw) as PaymentRecord[]).map((p) => ({
        ...p,
        patientName: NAME_MIGRATION[p.patientName] ?? p.patientName,
      }))
    }
  } catch { /* ignore */ }
  return []
}

function addPaymentRecord(record: Omit<PaymentRecord, 'id' | 'paidAt'>): void {
  const payments = loadPayments()
  const newRecord: PaymentRecord = { ...record, id: 'pay-' + Date.now(), paidAt: new Date().toISOString() }
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify([newRecord, ...payments]))
}

export function getPaymentsByWallet(walletAddress: string): PaymentRecord[] {
  return loadPayments().filter(
    (p) => p.walletAddress.toLowerCase() === walletAddress.toLowerCase(),
  )
}

export function getAllPayments(): PaymentRecord[] {
  return loadPayments()
}

// ─── Department styling helpers ───────────────────────────────────────────────

export const DEPT_BG: Record<string, string> = {
  Emergency: 'rgba(186,43,76,0.10)',
  Laboratory: 'rgba(26,128,71,0.10)',
  'Internal Medicine': 'rgba(16,97,166,0.10)',
  Radiology: 'rgba(99,74,158,0.10)',
  Surgery: 'rgba(220,88,36,0.10)',
  Cardiology: 'rgba(186,43,76,0.08)',
  Pediatrics: 'rgba(16,97,166,0.08)',
  Orthopedics: 'rgba(101,75,20,0.10)',
}

export const DEPT_COLOR: Record<string, string> = {
  Emergency: '#ba2b4c',
  Laboratory: '#1a8047',
  'Internal Medicine': '#1061a6',
  Radiology: '#634a9e',
  Surgery: '#dc5824',
  Cardiology: '#ba2b4c',
  Pediatrics: '#1061a6',
  Orthopedics: '#65551e',
}
