# HSML Playground

An online playground for [HSML (Hyper Short Markup Language)](https://github.com/hsml-lab/hsml) — write HSML, see compiled HTML in real-time.

## Features

- Live compilation as you type, powered by HSML's WASM package
- HSML syntax highlighting with CodeMirror
- HTML output with syntax highlighting
- Formatter with configurable indent size and print width
- Inline diagnostics (errors and warnings)
- Dark and light theme
- Shareable URLs — the HSML source is encoded in the URL hash
- Collapsible sidebar
- Code folding

## Development

```sh
pnpm run preflight
pnpm run dev
```

## Tech Stack

- [Vue 3](https://vuejs.org/) + [Vite](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [HSML](https://github.com/hsml-lab/hsml) (WASM) for compilation and formatting
- [vite-plugin-vue-hsml](https://github.com/hsml-lab/vite-plugin-vue-hsml) for HSML templates in Vue SFCs
- [CodeMirror 6](https://codemirror.net/) for the editors
- [TailwindCSS v4](https://tailwindcss.com/) for styling
- [Radix Vue](https://www.radix-vue.com/) for accessible UI primitives

## License

[MIT](LICENSE)
