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

## Install

`pnpm install`

## Login to nhost

`pnpm nhost login`

## Setup your env.local file

kanban-board/.secrets:

```bash
HASURA_GRAPHQL_ADMIN_SECRET='yoursecrethere'
HASURA_GRAPHQL_JWT_SECRET='yourJWThere'
NHOST_WEBHOOK_SECRET='nhost-webhook-secret'
GRAFANA_ADMIN_PASSWORD='grafana-admin-password'
```

kanban-board/.env:

```bash
NEXT_PUBLIC_NHOST_SUBDOMAIN=yoursubdomainhere
NEXT_PUBLIC_NHOST_REGION=yourregionhere
ADMIN_KEY=youradminkeyhere
```

## run dev

`pnpm run dev`

# to do

## set up project to be hosted on verecel or whatever that is

## clean up top of readme

## create ci.yml
