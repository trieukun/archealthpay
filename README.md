# MedPay — Hospital Payment Gateway

A two-view USDC hospital payment gateway. Patients look up bills by invoice number, pay with USDC in one tap, get a printable receipt, and share a QR payment link. Hospital staff manage bills and view incoming payments from a separate dashboard.

Built with [Arc Studio](https://studio.arc.io)

## Tech Stack

- React + TypeScript + Vite
- React Router v7 (patient / staff views)
- wagmi v2 + ConnectKit (wallet connection)
- viem (EVM interactions)
- USDC on Arc Testnet (chain ID 5042002)
- Framer Motion (payment sheet animation)
- `qrcode` (QR code generation)
- `react-to-print` (printable receipts)
- Tailwind CSS + Arc Light design tokens

## Development

### Prerequisites

- Node 18+ / Bun

### Install

```bash
bun install
```

### Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID (optional — injected wallet works without it) |
| `RPC_PROXY_BASE_URL` | Arc Studio RPC proxy base URL (optional outside Arc Studio) |
| `RPC_PROXY_TOKEN` | Arc Studio RPC proxy token (optional outside Arc Studio) |
| `RPC_PROXY_CHAINS` | Comma-separated proxy chain keys (optional outside Arc Studio) |

### Run

```bash
bun run dev
```

### Build

```bash
bun run build
```

## Features

**Language and currency (both views)**
- English / Vietnamese switch: every label, message, receipt and bill detail follows the chosen language
- USDC / VND display switch: amounts can be shown in VND for reference. Payments are always made in USDC, and the real USDC amount is shown next to the VND value. The USD/VND rate is fetched live; if it is unavailable the last saved rate (or a built-in reference rate) is used and labelled as such
- Both choices are remembered in the browser

**Billing assistant (both views)**
- Chat button at the bottom right answers common questions in English or Vietnamese: paying, finding a bill, wallets, fees, receipts, QR codes, VND display, history, refunds and safety
- Type an invoice number or medical record ID to get that bill's status and amount
- It is an automated assistant that answers from a built-in list of topics (no external AI service) and declines medical questions

**Patient Portal (`/`)**
- Invoice number or patient name search to find a bill
- USDC balance shown live from Arc Testnet
- One-tap USDC payment with wallet confirmation
- Printable payment receipt after each transaction
- QR code per bill — scannable link pre-filled with invoice number
- Payment history tab with ArcScan explorer links

**Staff Dashboard (`/staff`)**
- Stats overview (total bills, unpaid, paid counts)
- All bills table with paid/unpaid status and explorer links
- Payment log showing all incoming USDC payments with wallet and tx hash
- Create-bill form (patient name, invoice number, department, description, amount, date)

## Data

Bills and payment records are stored in `localStorage` for this testnet build. A production deployment would replace `src/lib/bills.ts` with API calls to a backend database.

## Notes

- `HOSPITAL_WALLET` in `src/components/PaymentSheet.tsx` is a demo address. Replace it with your real hospital treasury wallet before production.
- URL parameter `?invoice=INV-XXXX` auto-fills and opens the matching bill on page load (used by QR codes).
