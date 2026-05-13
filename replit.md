# Dompetku

Aplikasi keuangan pribadi untuk mencatat saldo, pemasukan, dan pengeluaran.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — DB schema (categories.ts, transactions.ts)
- `artifacts/api-server/src/routes/` — API route handlers
- `artifacts/finance-app/src/` — React frontend

## Architecture decisions

- OpenAPI-first: spec gates codegen which gates frontend hooks
- Finance data stored in Postgres; numeric amounts stored as `numeric(15,2)` strings, parsed to float in API responses
- Summary endpoints (`/summary`, `/summary/by-category`, `/summary/monthly`) aggregate directly in SQL for performance
- Frontend uses `@workspace/api-client-react` generated hooks — never raw fetch

## Product

- Dashboard: saldo total, pemasukan, pengeluaran, grafik arus kas bulanan, top pengeluaran per kategori, transaksi terbaru
- Transaksi: daftar semua transaksi dengan filter tipe dan kategori, tambah/hapus transaksi
- Kategori: kelola kategori pengeluaran dengan label warna

## User preferences

- App name: Dompetku
- Language: Indonesian (UI labels in Indonesian)

## Gotchas

- After schema changes, run `pnpm run typecheck:libs` before typechecking api-server
- Date values from Zod may come as `Date` objects; convert to ISO string (`slice(0,10)`) before inserting to Drizzle's `date` column
