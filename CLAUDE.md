# Razona UdeA

Study app for the Logical Reasoning section of the Universidad de Antioquia admission exam. Eight topic modules, each with a four-stage progression: theory → worked examples → practice with feedback → timed mock exam.

No backend, no auth, no database, no environment variables. Content is static files on disk; user progress is `localStorage`.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server (localhost:3000) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |

There is no test suite and no `type-check` script; type errors surface through `pnpm build`.

## Tech Stack

Next.js 16.2.6 (App Router, RSC) · React 19.2.4 · TypeScript 5.9.3 (`strict: true`) · Tailwind CSS 4.3.0 · shadcn/ui `base-nova` on `@base-ui/react` 1.4.1 · lucide-react · next-mdx-remote 6 (`/rsc`) · KaTeX + remark-math + rehype-katex · react-markdown 10 · next-themes · sonner · pnpm

Note the deltas from a default scaffold: **Tailwind v4** (no `tailwind.config.ts` — design tokens live in `src/app/globals.css` under `@theme inline`), and the shadcn style is **`base-nova`**, whose primitives come from `@base-ui/react` rather than Radix.

## Architecture

### Data flow

```
content/modulos/[slug]/*.{mdx,json}
        │
        ▼
src/lib/content.ts        ← 'server-only', fs + path
        │
        ▼
Server Component (page.tsx)
        │  props
        ▼
Client Component          ← state, timers, localStorage
        ▲
        │
src/lib/storage.ts        ← localStorage, SSR-guarded
```

Content never reaches the client except as explicit props from a Server Component. `src/lib/content.ts` imports `'server-only'`, so a Client Component importing it fails the build.

### Directory structure

```
content/modulos/[slug]/    6 files per module (see Content model)
src/
  app/                     App Router routes
  components/
    layout/                AppShell, Sidebar, BottomNav, ThemeProvider/Toggle
    dashboard/             StatsRow, ProgressCard, ModuleRecommendation
    modulos/               ModuleCard, StageSelector, ProgressBadge
    teoria/                MdxRenderer, ModoToggle, MarkAsReadButton
    ejercicios/            PracticaController, PreguntaInteractiva, OpcionesGrid,
                           FeedbackPanel, PistaButton, EjercicioCard, MathText
    simulacro/             SimulacroFinalController, SimulacroModuloController,
                           SimulacroTimer, SimulacroProgress, NavigationDots
    ui/                    shadcn/ui primitives
  lib/                     content.ts, storage.ts, modules.ts, utils.ts,
                           colors.ts, icons.ts
  types/index.ts           Shared types
```

### Routes

| Route | Rendering |
|-------|-----------|
| `/` | Static — redirects to `/dashboard` |
| `/dashboard` | Static shell + Client progress |
| `/modulos` | Static |
| `/modulos/[slug]` | SSG (`generateStaticParams`) |
| `/modulos/[slug]/teoria` | Dynamic — reads `?simple=1` |
| `/modulos/[slug]/ejemplos` | SSG |
| `/modulos/[slug]/practica` | SSG |
| `/modulos/[slug]/simulacro` | SSG |
| `/simulacro-final` | Static shell + Client |
| `/simulacro-final/resultados` | Static shell + Client |

## Content model

Six files per module in `content/modulos/[slug]/`:

| File | Contents |
|------|----------|
| `meta.json` | `ModuleMeta` — slug, título, descripción, icono (lucide name), orden_recomendado, color |
| `teoria.mdx` | Standard theory |
| `teoria-simple.mdx` | ELI10 theory — same concepts, everyday analogies |
| `ejemplos.json` | 5 × `EjemplosResuelto` — enunciado, pasos[], conclusión |
| `practica.json` | 12 × `EjercicioPractica` — + pista, dificultad 1–3 |
| `simulacro.json` | 8 × `EjercicioSimulacro` — + modulo_slug |

`src/lib/modules.ts` holds the static registry of the 8 modules and is the source of truth for their order. `meta.json` files mirror it; the loader falls back to the registry if a file is missing.

**Question contract:** exactly 4 options, exactly one `es_correcta: true`, and every option — correct and incorrect — carries an `explicacion`. For distractors the explanation names the specific misconception. This is what makes the practice feedback work, so it is not optional.

Math is authored as LaTeX: `$inline$` and `$$display$$`. In MDX it renders via `remark-math` + `rehype-katex`; in JSON strings via the `MathText` component (`react-markdown` with the same plugin chain). Never ship raw LaTeX to the user.

## Session logic

Constants live in the controllers, not in config:

| Behavior | Value | Location |
|----------|-------|----------|
| Practice session | 5 questions drawn from the 12-question bank, options shuffled | `PracticaController.tsx` |
| Module mock | `SESION_SIZE = 5`, `DURACION = 300` (5 min) | `SimulacroModuloController.tsx` |
| Final mock | `TOTAL_OBJETIVO = 40`, `PREGUNTAS_POR_MODULO = 5`, `DURACION_BASE = 5400` (90 min) | `SimulacroFinalController.tsx` |

The final mock draws a stratified sample — 5 per module, so all 8 are represented — then shuffles the combined set. If a module has fewer than 5 available, the duration scales proportionally rather than staying at 90 minutes.

Timers compute remaining time from the stored start timestamp (`Date.now() - inicio_timestamp`), never by accumulating interval ticks, which drift when the tab is backgrounded.

## Persistence

Three `localStorage` keys, all handled in `src/lib/storage.ts`:

| Key | Type | Notes |
|-----|------|-------|
| `razona_progress` | `ProgressStore` | Per-module stage states; `practica.aciertos` is the **best** historical score, not the latest |
| `razona_simulacros` | `SimulacroFinalStore` | Final mock history, FIFO-capped at 10 |
| `razona_simulacro_en_curso` | `SimulacroEnCurso \| null` | In-flight exam; cleared on submit |

Every read and write is wrapped in try/catch and guarded with `typeof window === 'undefined'` — private browsing mode must degrade to an empty state, never crash. `getProgress()` also backfills missing module slugs so an older stored shape can't produce undefined access.

## Conventions

1. **Server Components by default.** Add `"use client"` only for local state, events, timers, or browser APIs.
2. **`src/lib/content.ts` is server-only.** Client Components receive content as props from a Server Component parent.
3. **localStorage only inside effects** — never during render, to keep hydration clean.
4. **TypeScript strict.** No `any`, no `@ts-ignore`. Shared types in `src/types/index.ts`.
5. **Path alias `@/`** for everything under `src/`.
6. **Validate content arrays.** Check `arr.length > 0` before indexing; render an empty state rather than crashing. Loaders already return `[]` for missing or malformed files.
7. **Mobile-first.** Base styles target 375px; add `md:`/`lg:` upward. Interactive elements `min-h-[44px]`; exercise options `min-h-[48px]`.
8. **One component per file**, ~300 lines max.

## Design system

Tokens are CSS variables in `src/app/globals.css`: raw HSL triplets under `:root` and `.dark`, exposed to Tailwind v4 through `@theme inline` as `--color-*: hsl(var(--*))`. Values are stored without the `hsl()` wrapper, so a new token must follow the same `H S% L%` shape.

| Role | Light | Dark |
|------|-------|------|
| Primary | `175 84% 32%` (#0D968B) | `175 70% 45%` (#22C3B6) |
| Background | `0 0% 98%` (#FAFAFA) | `222 20% 10%` (#14171F) |
| Success | `142 71% 29%` (#157E3C) | `142 60% 38%` (#279B51) |
| Destructive | `0 72% 51%` (#DC2828) | `0 62% 55%` (#D34545) |

Inter via `next/font/google`. `rounded-lg` cards, `rounded-md` buttons, 768px max content width. The aesthetic is deliberately calm — clear typography, no aggressive gamification, nothing that raises the stakes of a wrong answer.
