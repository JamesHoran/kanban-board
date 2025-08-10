This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Init and log into nhost

`pnpm nhost init`

## Database Setup

1. Create tables: `boards`, `columns`, `cards` in Nhost where the cards (cols of id: uuid, name: text, column_id: uuid, description: text) have a fk to columns (cols of id: uuid, name: text, board_id: uuid) and columns has an fk to boards (cols of id: uuid, name: text). Ensure cascade delete is enabled for PKs.
2. Change permissions for users to update, select, delete, insert

## Setup your env.local file

npm install @next/env

envConfig.ts: `
import { loadEnvConfig } from '@next/env'

const projectDir = process.cwd()
loadEnvConfig(projectDir)
`

import env vars with, 'import './envConfig.ts''

.env.local, '
NEXT_PUBLIC_NHOST_SUBDOMAIN=your-project-subdomain
NEXT_PUBLIC_NHOST_REGION=your-region
'

## Run `pnpm run codegen` to generate code
