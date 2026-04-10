# Contributing

Thank you for your interest in contributing to the HSML Playground!

## Getting Started

1. Fork and clone the repository
2. Make sure you have [Node.js](https://nodejs.org/) >= 24 and [pnpm](https://pnpm.io/) installed
3. Run `pnpm install` to install dependencies

## Useful Commands

### Dev Server

```sh
pnpm run dev
```

### Build

```sh
pnpm run build
```

### Format

```sh
pnpm run format
```

### Lint

```sh
pnpm run lint
```

### Type Check

```sh
pnpm run ts-check
```

### Preflight

Runs all checks (format, lint, type check, build) in sequence:

```sh
pnpm run preflight
```

## Claude Code

This project includes a `.mcp.json` configuration for [Playwright MCP](https://github.com/microsoft/playwright-mcp), which provides browser automation capabilities for AI-assisted development with [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

When using Claude Code, the Playwright MCP server allows the AI to take screenshots, interact with the dev server, and verify changes visually. It starts automatically when Claude Code opens the project.
