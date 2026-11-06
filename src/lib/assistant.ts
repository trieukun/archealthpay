import { getBillByInvoice, getBillsByMedicalRecord } from '@/lib/bills'
import type { Lang } from '@/lib/i18n'

export interface AssistantContext {
  lang: Lang
  moneyFull: (amount: string | number) => string
  tDept: (department: string) => string
  tData: (text: string) => string
}

interface Topic {
  id: string
  /** Lower-case, accent-free keywords. Short words are padded with spaces to match whole words only. */
  kw: string[]
  en: string
  vi: string
}

/** Lower-case, strip Vietnamese accents and punctuation, pad with spaces for whole-word matching. */
function normalize(s: string): string {
  const cleaned = s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\- ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return ` ${cleaned} `
}

export const SUGGESTIONS: Record<Lang, string[]> = {
  en: [
    'How do I pay my bill?',
    'How do I find my bill?',
    'Do I need a wallet?',
    'What are the fees?',
    'How do I get a receipt?',
    'Can I see amounts in VND?',
  ],
  vi: [
    'Tôi thanh toán hóa đơn như thế nào?',
    'Làm sao để tìm hóa đơn của tôi?',
    'Tôi có cần ví điện tử không?',
    'Phí giao dịch là bao nhiêu?',
    'Làm sao để nhận biên lai?',
    'Tôi có xem được số tiền bằng VNĐ không?',
  ],
}

const TOPICS: Topic[] = [
  {
    id: 'medical',
    kw: ['symptom', 'trieu chung', 'diagnos', 'dosage', 'treatment', 'dieu tri', 'uong thuoc', 'lieu luong', 'bi benh', 'toi bi dau', 'medical advice', 'loi khuyen y te', 'headache', ' medicine ', ' pain ', ' fever ', 'dau dau', ' sot ', 'thuoc gi', 'nen uong', 'what disease'],
    en: "I can't give medical advice or interpret results. Please talk to your doctor or the care team. I can help with paying your bill, receipts and using this portal.",
    vi: 'Mình không thể đưa ra lời khuyên y tế hay giải thích kết quả khám. Vui lòng hỏi bác sĩ hoặc đội ngũ chăm sóc. Mình có thể hỗ trợ về thanh toán viện phí, biên lai và cách dùng cổng này.',
  },
  {
    id: 'greeting',
    kw: [' hello ', ' hi ', ' hey ', ' xin chao ', ' chao ', ' chao ban '],
    en: 'Hello! I can help you find a bill, pay with USDC, get a receipt and more. What would you like to know?',
    vi: 'Xin chào! Mình có thể giúp bạn tìm hóa đơn, thanh toán bằng USDC, nhận biên lai và nhiều việc khác. Bạn cần hỗ trợ gì?',
  },
  {
    id: 'thanks',
    kw: [' thanks ', ' thank ', ' thank you ', ' cam on '],
    en: "You're welcome! Let me know if you need anything else.",
    vi: 'Không có gì! Cần hỗ trợ thêm bạn cứ hỏi nhé.',
  },
  {
    id: 'pay',
    kw: ['how to pay', 'how do i pay', 'pay my bill', 'pay bill', 'pay a bill', 'thanh toan', 'tra vien phi', 'cach tra', 'dong vien phi', 'tra tien', ' pay '],
    en: 'To pay a bill:\n1. Enter your invoice number or medical record ID and tap Look up.\n2. Tap "Pay with USDC" on the bill you want to pay.\n3. Connect your wallet if asked, then tap Pay and confirm in your wallet.\n4. Your e-receipt appears right after the payment is confirmed.\nPayments are always made in USDC on Arc Testnet.',
    vi: 'Để thanh toán hóa đơn:\n1. Nhập số hóa đơn hoặc mã hồ sơ bệnh án rồi bấm Tra cứu.\n2. Bấm "Thanh toán bằng USDC" ở hóa đơn cần trả.\n3. Kết nối ví nếu được yêu cầu, bấm Thanh toán và xác nhận trong ví.\n4. Biên lai điện tử hiện ngay sau khi giao dịch được xác nhận.\nThanh toán luôn được thực hiện bằng USDC trên Arc Testnet.',
  },
  {
    id: 'lookup',
    kw: ['find my bill', 'find a bill', 'look up', 'lookup', 'invoice number', 'medical record', 'so hoa don', 'ma ho so', 'tra cuu', 'tim hoa don', 'where is my bill', ' mrn ', 'hoa don o dau'],
    en: 'Use the search box at the top of the Patient Portal. Choose "Invoice Number" (for example INV-2026-0841) or "Medical Record ID" (for example MRN-10042) and tap Look up. A medical record ID shows every bill for that patient, grouped by family member. You can also type an invoice number or record ID here and I will check it for you.',
    vi: 'Dùng ô tìm kiếm ở đầu Cổng bệnh nhân. Chọn "Số hóa đơn" (ví dụ INV-2026-0841) hoặc "Mã hồ sơ bệnh án" (ví dụ MRN-10042) rồi bấm Tra cứu. Mã hồ sơ bệnh án sẽ hiện tất cả hóa đơn của bệnh nhân đó, nhóm theo từng thành viên gia đình. Bạn cũng có thể gõ số hóa đơn hoặc mã hồ sơ vào đây để mình kiểm tra giúp.',
  },
  {
    id: 'wallet',
    kw: ['wallet', 'connect', ' vi ', 'vi dien tu', 'ket noi', 'test usdc', 'faucet', 'nap vi', 'get test', 'balance', 'so du', 'metamask'],
    en: 'Yes, you need a crypto wallet to pay. Tap "Connect Wallet" at the top right and choose your wallet. This demo runs on Arc Testnet, so you need free test USDC (not real money) in the wallet. Your balance is shown in the Patient Portal once connected, and the app offers to switch your wallet to Arc Testnet if needed.',
    vi: 'Có, bạn cần một ví tiền mã hóa để thanh toán. Bấm "Kết nối ví" ở góc trên bên phải và chọn ví của bạn. Bản demo này chạy trên Arc Testnet nên ví cần có USDC thử nghiệm miễn phí (không phải tiền thật). Số dư hiển thị trong Cổng bệnh nhân sau khi kết nối, và ứng dụng sẽ đề nghị chuyển ví sang Arc Testnet nếu cần.',
  },
  {
    id: 'fees',
    kw: [' fee ', ' fees ', ' gas ', 'phi giao dich', 'phi gas', 'mat phi', 'how much does it cost', 'chi phi', ' cost ', 'bao nhieu phi'],
    en: 'Network fees on Arc are very low and are paid in USDC, so you do not need any other token for gas. Your wallet shows the exact fee before you confirm. The hospital bill amount itself is the amount shown on the bill.',
    vi: 'Phí mạng trên Arc rất thấp và được trả bằng USDC, nên bạn không cần token nào khác để trả phí gas. Ví của bạn sẽ hiển thị chính xác mức phí trước khi bạn xác nhận. Số tiền viện phí chính là số tiền ghi trên hóa đơn.',
  },
  {
    id: 'receipt',
    kw: ['receipt', 'bien lai', 'print', 'in bien lai', 'proof of payment', 'chung tu', 'xac nhan thanh toan'],
    en: 'After a payment is confirmed you get a digital e-receipt with a link to verify the transaction on ArcScan. Tap "Print Receipt" to print it or save it as a PDF. You can show the e-receipt at the laboratory or pharmacy instead of visiting the cashier.',
    vi: 'Sau khi thanh toán được xác nhận, bạn nhận biên lai điện tử kèm liên kết kiểm tra giao dịch trên ArcScan. Bấm "In biên lai" để in hoặc lưu thành PDF. Bạn có thể xuất trình biên lai điện tử tại phòng xét nghiệm hoặc nhà thuốc mà không cần đến quầy thu ngân.',
  },
  {
    id: 'qr',
    kw: [' qr ', 'ma qr', 'quet ma', 'payment link', 'lien ket thanh toan', 'scan'],
    en: 'Each unpaid bill has a QR icon. Tap it to see a QR code for that bill. Scanning it on another device opens the portal with that invoice already filled in. You can also copy the payment link from the same window.',
    vi: 'Mỗi hóa đơn chưa thanh toán có biểu tượng QR. Bấm vào để xem mã QR của hóa đơn đó. Quét mã trên thiết bị khác sẽ mở cổng với số hóa đơn đã được điền sẵn. Bạn cũng có thể sao chép liên kết thanh toán trong cùng cửa sổ.',
  },
  {
    id: 'currency',
    kw: ['vnd', ' dong ', 'tien viet', 'currency', 'tien te', 'ty gia', 'exchange rate', ' rate ', 'quy doi'],
    en: 'Use the USDC / VND switch in the top bar to see amounts in Vietnamese dong. VND is for reference only: payments are always made in USDC, and the real USDC amount is shown next to the VND value. The rate is fetched live when available, and the app says which rate it is using.',
    vi: 'Dùng nút chuyển USDC / VNĐ ở thanh trên cùng để xem số tiền bằng đồng Việt Nam. VNĐ chỉ để tham khảo: thanh toán luôn bằng USDC và số USDC thực tế được hiển thị cạnh giá trị VNĐ. Tỷ giá được lấy trực tiếp khi có thể, và ứng dụng cho biết đang dùng tỷ giá nào.',
  },
  {
    id: 'history',
    kw: ['history', 'lich su', 'previous payment', 'past payment', 'da tra', 'family', 'gia dinh', 'nguoi than'],
    en: 'Open the "Payment History" tab in the Patient Portal (connect your wallet first) to see every payment made from that wallet, with amounts, dates and ArcScan links. To manage a family, look up each member by their medical record ID: bills are grouped by patient.',
    vi: 'Mở tab "Lịch sử thanh toán" trong Cổng bệnh nhân (hãy kết nối ví trước) để xem mọi khoản đã trả từ ví đó, kèm số tiền, ngày và liên kết ArcScan. Để quản lý cho gia đình, hãy tra cứu từng thành viên bằng mã hồ sơ bệnh án: hóa đơn được nhóm theo bệnh nhân.',
  },
  {
    id: 'failed',
    kw: ['failed', 'fail', 'error', 'insufficient', 'not enough', 'stuck', 'pending', 'loi ', 'that bai', 'khong du', 'bi tru tien', 'khong thanh toan duoc', 'khong tra duoc'],
    en: 'If a payment fails:\n- Check that your wallet has enough USDC for the bill.\n- Make sure your wallet is on Arc Testnet (the Pay button changes to "Switch to Arc Testnet" if not).\n- If you rejected the request in your wallet, tap Pay again.\nIf money left your wallet but you got no receipt, check the transaction on ArcScan and ask the hospital front desk with your invoice number.',
    vi: 'Nếu thanh toán không thành công:\n- Kiểm tra ví có đủ USDC cho hóa đơn.\n- Đảm bảo ví đang ở mạng Arc Testnet (nút Thanh toán sẽ đổi thành "Chuyển sang Arc Testnet" nếu chưa đúng).\n- Nếu bạn đã từ chối yêu cầu trong ví, hãy bấm Thanh toán lại.\nNếu tiền đã rời ví nhưng chưa có biên lai, hãy kiểm tra giao dịch trên ArcScan và liên hệ quầy lễ tân bệnh viện kèm số hóa đơn.',
  },
  {
    id: 'refund',
    kw: ['refund', 'hoan tien', 'hoan lai', 'cancel payment', 'huy thanh toan', 'overcharged', 'tinh sai'],
    en: 'Refunds and billing corrections are handled by the hospital billing office, not by this portal. Please contact the front desk with your invoice number and the transaction link from your receipt.',
    vi: 'Việc hoàn tiền và điều chỉnh hóa đơn do phòng thu viện phí của bệnh viện xử lý, không thực hiện qua cổng này. Vui lòng liên hệ quầy lễ tân kèm số hóa đơn và liên kết giao dịch trong biên lai.',
  },
  {
    id: 'staff',
    kw: ['staff', 'nhan vien', 'create bill', 'tao hoa don', 'add bill', 'them hoa don', 'dashboard', 'bang dieu khien', 'incoming payment'],
    en: 'Hospital staff use the "Staff" view. "Create Bill" adds a new bill that patients can find immediately, "All Bills" shows status for every bill, and "Incoming Payments" lists payments received with transaction links. In this demo, data is stored in the browser only.',
    vi: 'Nhân viên bệnh viện dùng giao diện "Nhân viên". "Tạo hóa đơn" thêm hóa đơn mới để bệnh nhân tra cứu ngay, "Tất cả hóa đơn" hiển thị trạng thái từng hóa đơn và "Thanh toán đến" liệt kê các khoản đã nhận kèm liên kết giao dịch. Trong bản demo này, dữ liệu chỉ được lưu trong trình duyệt.',
  },
  {
    id: 'language',
    kw: ['language', 'english', 'ngon ngu', 'doi ngon', 'switch language', 'tieng anh'],
    en: 'Use the EN / VI switch in the top bar to change the language. Everything in the app, including receipts and this assistant, follows your choice.',
    vi: 'Dùng nút EN / VI ở thanh trên cùng để đổi ngôn ngữ. Toàn bộ ứng dụng, kể cả biên lai và trợ lý này, sẽ theo lựa chọn của bạn.',
  },
  {
    id: 'safety',
    kw: ['safe', 'secure', 'security', 'scam', 'an toan', 'bao mat', 'lua dao', 'seed phrase', 'private key', 'cum tu khoi phuc', 'khoa rieng'],
    en: 'Never share your seed phrase or private key with anyone. This portal never asks for them: you only approve a payment inside your own wallet. Before you confirm, check that the amount matches your bill and that the destination shown in the "To" field is the hospital wallet.',
    vi: 'Không bao giờ chia sẻ cụm từ khôi phục hoặc khóa riêng của bạn. Cổng này không bao giờ yêu cầu những thông tin đó: bạn chỉ phê duyệt thanh toán trong chính ví của mình. Trước khi xác nhận, hãy kiểm tra số tiền khớp với hóa đơn và địa chỉ ở mục "Đến" là ví của bệnh viện.',
  },
  {
    id: 'human',
    kw: ['human', 'real person', 'agent', 'phone', 'hotline', 'contact', 'lien he', 'nguoi that', 'tong dai', 'le tan', 'front desk'],
    en: 'For anything I cannot answer, please ask the hospital front desk or billing office. Have your invoice number or medical record ID ready.',
    vi: 'Với những vấn đề mình chưa trả lời được, vui lòng liên hệ quầy lễ tân hoặc phòng thu viện phí của bệnh viện. Hãy chuẩn bị sẵn số hóa đơn hoặc mã hồ sơ bệnh án.',
  },
]

function fallback(lang: Lang): string {
  return lang === 'vi'
    ? 'Mình chưa hiểu rõ câu hỏi này. Bạn có thể hỏi về: cách thanh toán, tìm hóa đơn, ví và USDC, phí, biên lai, mã QR, đổi sang VNĐ hoặc lịch sử thanh toán. Bạn cũng có thể gõ số hóa đơn (ví dụ INV-2026-0841) hoặc mã hồ sơ (ví dụ MRN-10042) để mình kiểm tra.'
    : 'I am not sure I understood. You can ask about paying a bill, finding a bill, wallets and USDC, fees, receipts, QR codes, switching to VND or payment history. You can also type an invoice number (for example INV-2026-0841) or a medical record ID (for example MRN-10042) and I will check it.'
}

function answerInvoice(code: string, ctx: AssistantContext): string {
  const { lang, moneyFull, tDept, tData } = ctx
  const bill = getBillByInvoice(code)
  if (!bill) {
    return lang === 'vi'
      ? `Mình không tìm thấy hóa đơn ${code.toUpperCase()}. Vui lòng kiểm tra lại số hóa đơn hoặc hỏi quầy lễ tân.`
      : `I could not find invoice ${code.toUpperCase()}. Please check the number or ask the front desk.`
  }
  const paid = bill.status === 'paid'
  if (lang === 'vi') {
    return `Hóa đơn ${bill.invoiceNumber} (${bill.patientName}, ${tDept(bill.department)}): ${tData(bill.description)}.\nSố tiền: ${moneyFull(bill.amount)}.\nTrạng thái: ${paid ? 'đã thanh toán' : 'chưa thanh toán'}.${paid ? ' Bạn có thể xem biên lai trong tab Lịch sử thanh toán.' : ' Hãy tra cứu hóa đơn này và bấm "Thanh toán bằng USDC".'}`
  }
  return `Invoice ${bill.invoiceNumber} (${bill.patientName}, ${tDept(bill.department)}): ${tData(bill.description)}.\nAmount: ${moneyFull(bill.amount)}.\nStatus: ${paid ? 'paid' : 'unpaid'}.${paid ? ' You can find the receipt in the Payment History tab.' : ' Look it up and tap "Pay with USDC".'}`
}

function answerRecord(code: string, ctx: AssistantContext): string {
  const { lang, moneyFull } = ctx
  const bills = getBillsByMedicalRecord(code)
  if (bills.length === 0) {
    return lang === 'vi'
      ? `Mình không tìm thấy hóa đơn nào cho mã hồ sơ ${code.toUpperCase()}. Vui lòng kiểm tra lại hoặc hỏi quầy lễ tân.`
      : `I could not find any bills for medical record ${code.toUpperCase()}. Please check the ID or ask the front desk.`
  }
  const unpaid = bills.filter((b) => b.status === 'unpaid')
  const due = unpaid.reduce((sum, b) => sum + parseFloat(b.amount), 0)
  const name = bills[0].patientName
  if (lang === 'vi') {
    return `Hồ sơ ${bills[0].medicalRecordId} (${name}) có ${bills.length} hóa đơn, trong đó ${unpaid.length} chưa thanh toán.${unpaid.length > 0 ? ` Tổng cần trả: ${moneyFull(due)}.` : ' Không còn khoản nào cần trả.'}\nNhập mã hồ sơ vào ô tra cứu để xem và thanh toán từng hóa đơn.`
  }
  return `Record ${bills[0].medicalRecordId} (${name}) has ${bills.length} bill${bills.length === 1 ? '' : 's'}, ${unpaid.length} unpaid.${unpaid.length > 0 ? ` Total due: ${moneyFull(due)}.` : ' Nothing is due.'}\nEnter the record ID in the search box to view and pay each bill.`
}

/** Answer from the built-in knowledge base. Bill questions use the real bill data. */
export function getAnswer(input: string, ctx: AssistantContext): string {
  const inv = input.match(/inv-\d{4}-\d{3,5}/i)
  if (inv) return answerInvoice(inv[0], ctx)
  const mrn = input.match(/mrn-\d{3,8}/i)
  if (mrn) return answerRecord(mrn[0], ctx)

  const text = normalize(input)
  let best: Topic | null = null
  let bestScore = 0
  for (const topic of TOPICS) {
    let score = 0
    for (const kw of topic.kw) {
      if (text.includes(kw)) score += kw.trim().length
    }
    if (score > bestScore) {
      best = topic
      bestScore = score
    }
  }
  if (!best) return fallback(ctx.lang)
  return ctx.lang === 'vi' ? best.vi : best.en
}
