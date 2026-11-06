import { createContext, useContext } from 'react'

export type Lang = 'en' | 'vi'

export const LANG_STORAGE_KEY = 'archealth:lang'

const en = {
  // Nav
  'app.tagline': 'Hospital Bill Payment Portal',
  'nav.patientPortal': 'Patient Portal',
  'nav.staffDashboard': 'Staff Dashboard',
  'nav.patient': 'Patient',
  'nav.staff': 'Staff',
  'nav.secured': 'Secured by USDC',
  'lang.label': 'Language',
  'nav.connect': 'Connect Wallet',
  'currency.label': 'Currency',
  'currency.rateNote':
    'Amounts are shown in {unit} for reference only. Payments are always made in USDC. 1 USDC ≈ {rate} VND ({source}).',
  'currency.src.live': 'live rate',
  'currency.src.cached': 'last saved rate',
  'currency.src.fallback': 'reference rate',
  'chat.title': 'Billing Assistant',
  'chat.subtitle': 'Ask about paying your bill',
  'chat.open': 'Open assistant',
  'chat.close': 'Close assistant',
  'chat.placeholder': 'Type your question...',
  'chat.send': 'Send',
  'chat.greeting':
    "Hi! I'm the ArcHealth Pay assistant. I can help you find a bill, pay with USDC, get a receipt and more. You can also send me an invoice number (e.g. INV-2026-0841) or a medical record ID to check a bill.",
  'chat.typing': 'Assistant is typing',
  'chat.suggested': 'Suggested questions',
  'chat.disclaimer': 'Automated assistant. It cannot give medical advice.',

  // Patient hero
  'hero.eyebrow': 'Skip the Queue · Pay Instantly',
  'hero.title': 'Pay Your Hospital Bills',
  'hero.subtitle':
    'Enter your invoice number or medical record ID to view and pay your bills with USDC — near-zero fees, confirmed in under a second.',
  'hero.walletBalance': 'Wallet Balance',
  'lookup.invoice': 'Invoice Number',
  'lookup.record': 'Medical Record ID',
  'lookup.placeholderInvoice': 'Enter invoice number, e.g. INV-2026-0841',
  'lookup.placeholderRecord': 'Enter medical record ID, e.g. MRN-10042',
  'lookup.button': 'Look up',
  'steps.1': '1. Look up your bill',
  'steps.2': '2. Confirm with USDC',
  'steps.3': '3. Get instant receipt',

  // Portal body
  'summary.found': 'Bills found',
  'summary.unpaid': 'Unpaid',
  'summary.totalDue': 'Total due',
  'tabs.bills': 'My Bills',
  'tabs.history': 'Payment History',
  'notFound.title': 'No bills found',
  'notFound.body':
    'We could not find any bills for that {field}. Please check the number and try again, or contact the front desk.',
  'notFound.field.invoice': 'invoice number',
  'notFound.field.record': 'medical record ID',
  'notFound.showAll': 'Show all bills',
  'group.unpaid': '{n} unpaid',
  'empty.prompt': 'Enter your invoice number or medical record ID above',
  'trust.finality': 'Sub-second finality',
  'trust.stable': 'USDC — stable value',
  'trust.fees': 'Near-zero fees',
  'trust.noQueue': 'No cashier queue',
  'testnetNote': 'Arc Testnet · Use "Get test USDC" in the sidebar to fund your wallet for demo payments',

  // Bill card
  'bill.hideBreakdown': 'Hide breakdown',
  'bill.viewBreakdown': 'View charge breakdown',
  'bill.qrTitle': 'Generate QR payment link',
  'bill.breakdown': 'Charge Breakdown',
  'bill.total': 'Total',
  'bill.paidReceipt': 'Paid — Receipt Available',
  'bill.selected': 'Selected — Confirm payment below',
  'bill.pay': 'Pay with USDC',

  // QR modal
  'qr.title': 'Payment QR Code',
  'qr.scan': 'Scan to open this bill pre-filled on another device',
  'qr.copied': 'Copied!',
  'qr.copy': 'Copy payment link',

  // History
  'hist.connect': 'Connect your wallet',
  'hist.connectSub': 'Your payment history will appear here once connected',
  'hist.none': 'No payments yet',
  'hist.noneSub': 'Payments you make will be recorded here',

  // Payment sheet
  'sheet.confirmTitle': 'Confirm Payment',
  'sheet.confirmedTitle': 'Payment Confirmed',
  'sheet.total': 'Total',
  'sheet.yourBalance': 'Your balance',
  'sheet.to': 'To',
  'sheet.insufficient':
    'Insufficient balance. Use "Get test USDC" in the Arc Studio sidebar to fund your wallet.',
  'sheet.connectToPay': 'Connect Wallet to Pay',
  'sheet.switching': 'Switching network...',
  'sheet.switchTo': 'Switch to Arc Testnet',
  'sheet.confirmWallet': 'Confirm in wallet...',
  'sheet.confirming': 'Confirming payment...',
  'sheet.pay': 'Pay {amount}',
  'sheet.usdcOnArc': 'USDC on Arc Network',
  'sheet.nearZero': 'Near-zero fees',
  'sheet.sent': 'Payment Sent',
  'sheet.receiptReady':
    'Your digital receipt is ready. Show it at the lab or pharmacy — no cashier visit needed.',
  'sheet.eReceipt': 'ArcHealth Pay — E-Receipt',
  'sheet.patient': 'Patient',
  'sheet.medicalRecord': 'Medical Record',
  'sheet.invoice': 'Invoice',
  'sheet.department': 'Department',
  'sheet.description': 'Description',
  'sheet.amountPaid': 'Amount Paid',
  'sheet.transaction': 'Transaction',
  'sheet.viewArcscan': 'View on ArcScan',
  'sheet.syncNote':
    'This receipt has been synchronized to the hospital management system. Present it at the laboratory or pharmacy counter to proceed without queuing.',
  'sheet.print': 'Print Receipt',
  'sheet.back': 'Back to Bills',
  'err.cancelled': 'Transaction cancelled.',
  'err.insufficient':
    'Insufficient USDC balance. Use "Get test USDC" in the sidebar to fund your wallet.',
  'err.failed': 'Transaction failed. Please try again.',
  'err.network': 'Network error. Check your connection and retry.',
  'err.generic': 'Something went wrong. Please try again.',

  // Receipt (print)
  'receipt.subtitle': 'Hospital Payment Gateway',
  'receipt.paid': 'PAID',
  'receipt.title': 'Payment Receipt',
  'receipt.invoiceNumber': 'Invoice Number',
  'receipt.patientName': 'Patient Name',
  'receipt.department': 'Department',
  'receipt.description': 'Description',
  'receipt.serviceDate': 'Service Date',
  'receipt.amountPaid': 'Amount Paid',
  'receipt.blockchainTx': 'Blockchain Transaction',
  'receipt.network': 'Network',
  'receipt.token': 'Token',
  'receipt.reference': 'Reference value',
  'receipt.payingWallet': 'Paying Wallet',
  'receipt.txHash': 'Transaction Hash',
  'receipt.verify': 'Verify on ArcScan: ',
  'receipt.footer':
    'This receipt is a record of a USDC transfer on Arc Testnet. Keep this document for your records. Powered by Arc Studio.',

  // Staff
  'staff.eyebrow': 'Hospital Management',
  'staff.title': 'Staff Dashboard',
  'staff.subtitle': 'Create bills and monitor real-time USDC settlements on Arc Network.',
  'staff.instant': 'Instant Settlement',
  'staff.noRecon': 'No end-of-day reconciliation',
  'stat.total': 'Total Bills',
  'stat.pending': 'Pending Payment',
  'stat.settled': 'Settled',
  'stat.received': 'Amount Received',
  'stab.bills': 'All Bills',
  'stab.payments': 'Incoming Payments',
  'stab.create': 'Create Bill',
  'staff.noBills': 'No bills yet. Use "Create Bill" to add the first one.',
  'staff.noPayments': 'No payments received yet. Payments appear here as patients pay their bills.',
  'staff.instantTag': 'Instant',
  'status.settled': 'Settled',
  'status.pending': 'Pending',
  'form.title': 'New Patient Bill',
  'form.subtitle': 'The bill appears immediately in the patient portal after creation.',
  'form.patientName': 'Patient Full Name',
  'form.mrn': 'Medical Record ID',
  'form.invoice': 'Invoice Number',
  'form.date': 'Service Date',
  'form.department': 'Department',
  'form.description': 'Bill Description',
  'form.amount': 'Total Amount (USDC)',
  'form.phName': 'e.g. Nguyễn Văn A',
  'form.phMrn': 'e.g. MRN-10042',
  'form.phDesc': 'e.g. Emergency Room Visit — Consultation & X-Ray',
  'form.errName': 'Patient name is required.',
  'form.errMrn': 'Medical record ID is required.',
  'form.errInvoice': 'Invoice number is required.',
  'form.errDesc': 'Description is required.',
  'form.errAmount': 'Enter a valid amount.',
  'form.errDuplicate': 'Invoice number already exists.',
  'form.success': 'Bill created — patient can pay via invoice number or medical record ID.',
  'form.submit': 'Create Bill',

  // Departments
  'dept.Emergency': 'Emergency',
  'dept.Laboratory': 'Laboratory',
  'dept.Internal Medicine': 'Internal Medicine',
  'dept.Radiology': 'Radiology',
  'dept.Surgery': 'Surgery',
  'dept.Cardiology': 'Cardiology',
  'dept.Pediatrics': 'Pediatrics',
  'dept.Orthopedics': 'Orthopedics',
} as const

export type TKey = keyof typeof en

const vi: Record<TKey, string> = {
  'app.tagline': 'Cổng thanh toán viện phí',
  'nav.patientPortal': 'Cổng bệnh nhân',
  'nav.staffDashboard': 'Bảng điều khiển nhân viên',
  'nav.patient': 'Bệnh nhân',
  'nav.staff': 'Nhân viên',
  'nav.secured': 'Bảo mật bởi USDC',
  'lang.label': 'Ngôn ngữ',
  'nav.connect': 'Kết nối ví',
  'currency.label': 'Tiền tệ',
  'currency.rateNote':
    'Số tiền được hiển thị bằng {unit} chỉ để tham khảo. Thanh toán luôn được thực hiện bằng USDC. 1 USDC ≈ {rate} VNĐ ({source}).',
  'currency.src.live': 'tỷ giá trực tiếp',
  'currency.src.cached': 'tỷ giá đã lưu gần nhất',
  'currency.src.fallback': 'tỷ giá tham khảo',
  'chat.title': 'Trợ lý thanh toán',
  'chat.subtitle': 'Hỏi về cách thanh toán viện phí',
  'chat.open': 'Mở trợ lý',
  'chat.close': 'Đóng trợ lý',
  'chat.placeholder': 'Nhập câu hỏi của bạn...',
  'chat.send': 'Gửi',
  'chat.greeting':
    'Xin chào! Mình là trợ lý của ArcHealth Pay. Mình có thể giúp bạn tìm hóa đơn, thanh toán bằng USDC, nhận biên lai và nhiều việc khác. Bạn cũng có thể gửi số hóa đơn (ví dụ INV-2026-0841) hoặc mã hồ sơ bệnh án để mình kiểm tra.',
  'chat.typing': 'Trợ lý đang trả lời',
  'chat.suggested': 'Câu hỏi gợi ý',
  'chat.disclaimer': 'Trợ lý tự động. Không đưa ra lời khuyên y tế.',

  'hero.eyebrow': 'Không phải xếp hàng · Thanh toán tức thì',
  'hero.title': 'Thanh toán viện phí của bạn',
  'hero.subtitle':
    'Nhập số hóa đơn hoặc mã hồ sơ bệnh án để xem và thanh toán bằng USDC — phí gần như bằng 0, xác nhận trong chưa đầy một giây.',
  'hero.walletBalance': 'Số dư ví',
  'lookup.invoice': 'Số hóa đơn',
  'lookup.record': 'Mã hồ sơ bệnh án',
  'lookup.placeholderInvoice': 'Nhập số hóa đơn, ví dụ INV-2026-0841',
  'lookup.placeholderRecord': 'Nhập mã hồ sơ bệnh án, ví dụ MRN-10042',
  'lookup.button': 'Tra cứu',
  'steps.1': '1. Tra cứu hóa đơn',
  'steps.2': '2. Xác nhận bằng USDC',
  'steps.3': '3. Nhận biên lai ngay',

  'summary.found': 'Hóa đơn tìm thấy',
  'summary.unpaid': 'Chưa thanh toán',
  'summary.totalDue': 'Tổng cần trả',
  'tabs.bills': 'Hóa đơn của tôi',
  'tabs.history': 'Lịch sử thanh toán',
  'notFound.title': 'Không tìm thấy hóa đơn',
  'notFound.body':
    'Không tìm thấy hóa đơn nào cho {field} này. Vui lòng kiểm tra lại hoặc liên hệ quầy lễ tân.',
  'notFound.field.invoice': 'số hóa đơn',
  'notFound.field.record': 'mã hồ sơ bệnh án',
  'notFound.showAll': 'Hiện tất cả hóa đơn',
  'group.unpaid': '{n} chưa thanh toán',
  'empty.prompt': 'Nhập số hóa đơn hoặc mã hồ sơ bệnh án ở trên',
  'trust.finality': 'Xác nhận dưới một giây',
  'trust.stable': 'USDC — giá trị ổn định',
  'trust.fees': 'Phí gần như bằng 0',
  'trust.noQueue': 'Không xếp hàng ở quầy thu ngân',
  'testnetNote':
    'Arc Testnet · Dùng "Get test USDC" ở thanh bên để nạp ví cho các giao dịch thử nghiệm',

  'bill.hideBreakdown': 'Ẩn chi tiết',
  'bill.viewBreakdown': 'Xem chi tiết các khoản phí',
  'bill.qrTitle': 'Tạo liên kết thanh toán QR',
  'bill.breakdown': 'Chi tiết các khoản phí',
  'bill.total': 'Tổng',
  'bill.paidReceipt': 'Đã thanh toán — Có biên lai',
  'bill.selected': 'Đã chọn — Xác nhận thanh toán bên dưới',
  'bill.pay': 'Thanh toán bằng USDC',

  'qr.title': 'Mã QR thanh toán',
  'qr.scan': 'Quét để mở hóa đơn này trên thiết bị khác',
  'qr.copied': 'Đã sao chép!',
  'qr.copy': 'Sao chép liên kết thanh toán',

  'hist.connect': 'Kết nối ví của bạn',
  'hist.connectSub': 'Lịch sử thanh toán sẽ hiển thị ở đây sau khi kết nối',
  'hist.none': 'Chưa có thanh toán nào',
  'hist.noneSub': 'Các khoản bạn thanh toán sẽ được ghi lại ở đây',

  'sheet.confirmTitle': 'Xác nhận thanh toán',
  'sheet.confirmedTitle': 'Thanh toán thành công',
  'sheet.total': 'Tổng',
  'sheet.yourBalance': 'Số dư của bạn',
  'sheet.to': 'Đến',
  'sheet.insufficient':
    'Số dư không đủ. Dùng "Get test USDC" ở thanh bên Arc Studio để nạp ví.',
  'sheet.connectToPay': 'Kết nối ví để thanh toán',
  'sheet.switching': 'Đang chuyển mạng...',
  'sheet.switchTo': 'Chuyển sang Arc Testnet',
  'sheet.confirmWallet': 'Xác nhận trong ví...',
  'sheet.confirming': 'Đang xác nhận thanh toán...',
  'sheet.pay': 'Thanh toán {amount}',
  'sheet.usdcOnArc': 'USDC trên mạng Arc',
  'sheet.nearZero': 'Phí gần như bằng 0',
  'sheet.sent': 'Đã gửi thanh toán',
  'sheet.receiptReady':
    'Biên lai điện tử của bạn đã sẵn sàng. Xuất trình tại phòng xét nghiệm hoặc nhà thuốc — không cần đến quầy thu ngân.',
  'sheet.eReceipt': 'ArcHealth Pay — Biên lai điện tử',
  'sheet.patient': 'Bệnh nhân',
  'sheet.medicalRecord': 'Hồ sơ bệnh án',
  'sheet.invoice': 'Hóa đơn',
  'sheet.department': 'Khoa',
  'sheet.description': 'Mô tả',
  'sheet.amountPaid': 'Số tiền đã trả',
  'sheet.transaction': 'Giao dịch',
  'sheet.viewArcscan': 'Xem trên ArcScan',
  'sheet.syncNote':
    'Biên lai này đã được đồng bộ với hệ thống quản lý bệnh viện. Xuất trình tại quầy xét nghiệm hoặc nhà thuốc để tiếp tục mà không cần xếp hàng.',
  'sheet.print': 'In biên lai',
  'sheet.back': 'Quay lại hóa đơn',
  'err.cancelled': 'Giao dịch đã bị hủy.',
  'err.insufficient':
    'Số dư USDC không đủ. Dùng "Get test USDC" ở thanh bên để nạp ví.',
  'err.failed': 'Giao dịch thất bại. Vui lòng thử lại.',
  'err.network': 'Lỗi mạng. Kiểm tra kết nối và thử lại.',
  'err.generic': 'Đã xảy ra lỗi. Vui lòng thử lại.',

  'receipt.subtitle': 'Cổng thanh toán bệnh viện',
  'receipt.paid': 'ĐÃ THANH TOÁN',
  'receipt.title': 'Biên lai thanh toán',
  'receipt.invoiceNumber': 'Số hóa đơn',
  'receipt.patientName': 'Tên bệnh nhân',
  'receipt.department': 'Khoa',
  'receipt.description': 'Mô tả',
  'receipt.serviceDate': 'Ngày khám',
  'receipt.amountPaid': 'Số tiền đã trả',
  'receipt.blockchainTx': 'Giao dịch blockchain',
  'receipt.network': 'Mạng',
  'receipt.token': 'Token',
  'receipt.reference': 'Giá trị quy đổi tham khảo',
  'receipt.payingWallet': 'Ví thanh toán',
  'receipt.txHash': 'Mã giao dịch',
  'receipt.verify': 'Xác minh trên ArcScan: ',
  'receipt.footer':
    'Biên lai này là bản ghi của giao dịch chuyển USDC trên Arc Testnet. Vui lòng lưu giữ tài liệu này. Vận hành bởi Arc Studio.',

  'staff.eyebrow': 'Quản lý bệnh viện',
  'staff.title': 'Bảng điều khiển nhân viên',
  'staff.subtitle': 'Tạo hóa đơn và theo dõi thanh toán USDC theo thời gian thực trên mạng Arc.',
  'staff.instant': 'Quyết toán tức thì',
  'staff.noRecon': 'Không cần đối soát cuối ngày',
  'stat.total': 'Tổng hóa đơn',
  'stat.pending': 'Chờ thanh toán',
  'stat.settled': 'Đã quyết toán',
  'stat.received': 'Số tiền đã nhận',
  'stab.bills': 'Tất cả hóa đơn',
  'stab.payments': 'Thanh toán đến',
  'stab.create': 'Tạo hóa đơn',
  'staff.noBills': 'Chưa có hóa đơn. Dùng "Tạo hóa đơn" để thêm hóa đơn đầu tiên.',
  'staff.noPayments':
    'Chưa nhận được thanh toán nào. Các khoản thanh toán sẽ hiển thị ở đây khi bệnh nhân trả tiền.',
  'staff.instantTag': 'Tức thì',
  'status.settled': 'Đã quyết toán',
  'status.pending': 'Đang chờ',
  'form.title': 'Hóa đơn bệnh nhân mới',
  'form.subtitle': 'Hóa đơn sẽ xuất hiện ngay trong cổng bệnh nhân sau khi tạo.',
  'form.patientName': 'Họ tên bệnh nhân',
  'form.mrn': 'Mã hồ sơ bệnh án',
  'form.invoice': 'Số hóa đơn',
  'form.date': 'Ngày khám',
  'form.department': 'Khoa',
  'form.description': 'Mô tả hóa đơn',
  'form.amount': 'Tổng số tiền (USDC)',
  'form.phName': 'ví dụ: Nguyễn Văn A',
  'form.phMrn': 'ví dụ: MRN-10042',
  'form.phDesc': 'ví dụ: Khám cấp cứu — Tư vấn & chụp X-quang',
  'form.errName': 'Vui lòng nhập tên bệnh nhân.',
  'form.errMrn': 'Vui lòng nhập mã hồ sơ bệnh án.',
  'form.errInvoice': 'Vui lòng nhập số hóa đơn.',
  'form.errDesc': 'Vui lòng nhập mô tả.',
  'form.errAmount': 'Vui lòng nhập số tiền hợp lệ.',
  'form.errDuplicate': 'Số hóa đơn đã tồn tại.',
  'form.success': 'Đã tạo hóa đơn — bệnh nhân có thể thanh toán bằng số hóa đơn hoặc mã hồ sơ bệnh án.',
  'form.submit': 'Tạo hóa đơn',

  'dept.Emergency': 'Cấp cứu',
  'dept.Laboratory': 'Xét nghiệm',
  'dept.Internal Medicine': 'Nội khoa',
  'dept.Radiology': 'Chẩn đoán hình ảnh',
  'dept.Surgery': 'Phẫu thuật',
  'dept.Cardiology': 'Tim mạch',
  'dept.Pediatrics': 'Nhi khoa',
  'dept.Orthopedics': 'Chỉnh hình',
}

export const DICTIONARIES: Record<Lang, Record<TKey, string>> = { en, vi }

/**
 * Vietnamese translations of bill content (descriptions and line items) shown
 * in the demo data. Keyed by the exact English text so it also works for bills
 * already saved in the browser. Text with no entry (e.g. a bill typed by staff)
 * is shown as entered.
 */
export const VI_DATA: Record<string, string> = {
  'Emergency Room Visit — Consultation & X-Ray': 'Khám cấp cứu — Tư vấn & chụp X-quang',
  'Lab Work — Blood Panel & Urinalysis': 'Xét nghiệm — Công thức máu & nước tiểu',
  'Follow-up Consultation — Internal Medicine': 'Tái khám — Nội khoa',
  'Cardiology Stress Test & ECG': 'Nghiệm pháp gắng sức tim & điện tâm đồ',
  'Orthopedic Assessment — Knee MRI': 'Đánh giá chỉnh hình — MRI đầu gối',
  'Abdominal Ultrasound — Radiology Report': 'Siêu âm bụng — Báo cáo chẩn đoán hình ảnh',
  'Abdominal ultrasound': 'Siêu âm ổ bụng',
  'Radiologist consultation': 'Tư vấn bác sĩ chẩn đoán hình ảnh',
  'Emergency consultation': 'Tư vấn cấp cứu',
  'X-Ray (chest, 2 views)': 'X-quang (ngực, 2 tư thế)',
  'Nursing care & monitoring': 'Chăm sóc điều dưỡng & theo dõi',
  'Complete blood count (CBC)': 'Tổng phân tích tế bào máu (CBC)',
  'Comprehensive metabolic panel': 'Bộ xét nghiệm chuyển hóa toàn diện',
  Urinalysis: 'Xét nghiệm nước tiểu',
  'Physician consultation': 'Khám với bác sĩ',
  'Prescription processing fee': 'Phí xử lý đơn thuốc',
  'Cardiac stress test': 'Nghiệm pháp gắng sức tim',
  'ECG (12-lead)': 'Điện tâm đồ (12 chuyển đạo)',
  'Cardiologist interpretation': 'Bác sĩ tim mạch đọc kết quả',
  'MRI scan (knee)': 'Chụp MRI (đầu gối)',
  'Orthopedic consultation': 'Tư vấn chỉnh hình',
  'Radiology report': 'Báo cáo chẩn đoán hình ảnh',
}

export interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /** BCP-47 locale for Intl / toLocaleString */
  locale: string
  t: (key: TKey, vars?: Record<string, string | number>) => string
  /** Translate a department name (falls back to the raw value) */
  tDept: (department: string) => string
  /** Translate bill content (description / line item label); unknown text is returned as-is */
  tData: (text: string) => string
}

export const I18nContext = createContext<I18nValue | null>(null)

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside LanguageProvider')
  return ctx
}

export function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    if (saved === 'en' || saved === 'vi') return saved
  } catch {
    // ignore storage errors
  }
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('vi')
    ? 'vi'
    : 'en'
}
