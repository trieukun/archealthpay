# Hospital Payment Gateway — Implementation Plan

## Summary
A two-view USDC payment gateway on Arc Testnet. Patients look up bills by invoice number, pay with USDC in one tap, download a printable receipt, scan a QR code link, and review their full payment history. Hospital staff use a separate dashboard to create bills and watch incoming payments in real time.

## Architecture
- **Blockchain:** Arc Testnet (chain ID 5042002) — USDC is the native gas token, sub-second finality, stable fees
- **Contract:** No smart contract — direct ERC-20 USDC `transfer` to a hospital treasury wallet; all state (bills, history) lives in localStorage for this testnet build
- **Frontend:** React + TypeScript + Vite, wagmi v2 + ConnectKit, Framer Motion, Tailwind CSS + Arc Light tokens; `qrcode` package for QR generation; `react-to-print` for printable receipts; `react-router-dom` for patient / staff views
- **Wallet:** ConnectKit (already wired in `src/main.tsx`)

## Files to Create / Modify

1. `src/lib/bills.ts` — bill store: types, demo seed data, CRUD helpers using localStorage
2. `src/lib/share.ts` — `getShareBase` / `buildShareLink` helper (canonical share-safe URLs)
3. `src/components/BillCard.tsx` — replace existing; extended card with QR popover and paid badge
4. `src/components/PaymentSheet.tsx` — replace existing; adds printable receipt and explorer link
5. `src/components/QRModal.tsx` — modal that shows a QR code linking to a prefilled payment URL
6. `src/components/ReceiptPrint.tsx` — print-only receipt layout (hidden on screen, rendered for react-to-print)
7. `src/components/PaymentHistory.tsx` — scrollable transaction log for the connected wallet
8. `src/pages/PatientPortal.tsx` — patient view: bill-ID lookup field, bill list, payment sheet trigger
9. `src/pages/StaffDashboard.tsx` — staff view: create-bill form, live bill table, payment status column
10. `src/App.tsx` — replace existing; adds router, tab navigation between Patient / Staff views
11. `src/index.css` — already updated; no further changes needed
12. `index.html` — already updated; no further changes needed
13. `package.json` — add `qrcode`, `@types/qrcode`, `react-to-print`, `react-router-dom`

## Build Sequence

1. Install new packages (`qrcode`, `@types/qrcode`, `react-to-print`, `react-router-dom`)
2. Write `src/lib/bills.ts` — shared data layer (bill types, localStorage store, demo seed)
3. Write `src/lib/share.ts` — share-safe URL helper
4. Write `src/components/QRModal.tsx` — QR code modal
5. Write `src/components/ReceiptPrint.tsx` — printable receipt layout
6. Write `src/components/PaymentHistory.tsx` — transaction log component
7. Write `src/components/BillCard.tsx` — updated bill card with QR button
8. Write `src/components/PaymentSheet.tsx` — updated payment sheet with receipt + print trigger
9. Write `src/pages/PatientPortal.tsx` — invoice lookup + bill list + payment flow
10. Write `src/pages/StaffDashboard.tsx` — create-bill form + live bills table
11. Write `src/App.tsx` — router + tab nav wiring
12. Run `bun run check`; fix any lint or type errors

## Done When
- [ ] Patient can type an invoice number (e.g. `INV-2026-0841`) and see the matching bill
- [ ] Clicking "Pay" opens the payment sheet; USDC transfer executes on Arc Testnet
- [ ] On success, a printable receipt is available and the bill flips to "Paid"
- [ ] Each bill card has a QR icon that shows a scannable link pre-filled with that bill's invoice
- [ ] Payment history tab lists every transaction for the connected wallet (amount, date, tx hash)
- [ ] Staff tab can create a new bill (patient name, invoice #, department, amount) — it appears immediately in the patient view
- [ ] Staff table shows all bills with paid/unpaid status
- [ ] Zero lint errors, zero TypeScript errors (`bun run check` passes clean)
