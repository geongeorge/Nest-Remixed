# Nest Remixed

NestJS starter with Remix frontend. This repo is a yarn workspace with two packages: `server` and `remix`

## Features

- Remix js HMR
- Watch mode for NestJS
- One server for both frontend and backend
- Yarn workspace

## Installation

```bash
yarn
```

## Running the app

```bash
yarn dev
```

## Route configuration

- All `/api` routes go to Nest js
- All `/build` and `/assets` is served by nest from `/remix/public`
- All other routes go to Remix

## References

- https://remix.run/docs/en/main/start/quickstart#bring-your-own-server
- https://remix.run/docs/en/main/guides/manual-mode
- https://github.com/remix-run/remix/blob/main/templates/express/server.js

## Assets

Because we use nest to serve remix and both have a concept of assets, We are going to serve assets using our nest js server. But the asset should be placed in `/remix/public/assets` folder.
