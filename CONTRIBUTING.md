# Contributing to Janus

Thanks for your interest in improving Janus! 🚪

## Development

```bash
npm install
npm run dev        # start the app with hot reload
npm run typecheck  # strict TypeScript checks
npm run build      # production build
```

- **Stack:** Electron + React + TypeScript + Tailwind (electron-vite).
- **Main process:** `src/main` (SSH/SFTP/tunnels, encrypted vault, DB manager).
- **Renderer:** `src/renderer/src` (UI, state in `store.ts`).
- **Shared types & IPC channels:** `src/shared`.

## Pull requests

1. Fork and create a feature branch.
2. Keep changes focused; run `npm run typecheck` before pushing.
3. Match the surrounding code style. No new lint errors.
4. Describe the change and how you tested it.

## Reporting bugs / ideas

Open an issue with clear steps to reproduce (bugs) or a concrete use case (features).
Please don't include real passwords or private server details.

## Security

Never commit secrets. For vulnerabilities, see [SECURITY.md](SECURITY.md).
