This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install dependencies

`pnpm install`

## Setup your env.local file

kanban-board/.secrets

```bash
HASURA_GRAPHQL_ADMIN_SECRET='yoursecrethere'
HASURA_GRAPHQL_JWT_SECRET='yourJWThere'
NHOST_WEBHOOK_SECRET='nhost-webhook-secret'
GRAFANA_ADMIN_PASSWORD='grafana-admin-password'
```

kanban-board/.env

```bash
NEXT_PUBLIC_NHOST_SUBDOMAIN=yoursubdomainhere
NEXT_PUBLIC_NHOST_REGION=yourregionhere
ADMIN_KEY=youradminkeyhere
```

## Login to nhost

`pnpm nhost login`

## start your database

`nhost up`

## run dev

`pnpm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
