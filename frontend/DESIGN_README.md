# Cricket Impact — Neo-Brutalist UI & Design Tokens

## Overview

This UI uses a **60/30/10 color rule** and **neo-brutalist** visual language: soft corners (no hard corners), blocky panels with heavy shadows, and a clear hierarchy. The palette is applied as follows:

| Role | Color (HEX) | Usage (~%) |
|------|-------------|------------|
| **Canvas** | `#EBEBEB` | ~60% — page background, large surfaces |
| **Surface** | `#3A6EA5` | ~30% — cards, bands, primary UI blocks (often with opacity) |
| **Accent** | `#FF6700` | ~10% — CTAs, active toggles, important badges |
| **Accent strong** | `#004E98` | Emphasis — winner rows, main numbers, chart strokes |
| **Muted** | `#C0C0C0` | Borders, secondary text, dividers |

## How to Use Tokens in the Project

### 1. CSS variables (design tokens)

All tokens live in **`src/styles/tokens.css`**. Import them in your root CSS (e.g. `index.css`):

```css
@import './styles/tokens.css';
```

Then use in any CSS or inline styles:

- **Colors:** `var(--bg)`, `var(--surface)`, `var(--accent)`, `var(--accent-strong)`, `var(--muted)`, `var(--text-primary)`, `var(--text-secondary)`
- **Radii:** `var(--radius-sm)` (12px), `var(--radius-md)` (18px), `var(--radius-lg)` (28px), `var(--radius-pill)` (999px)
- **Shadows:** `var(--shadow-soft)`, `var(--shadow-strong)`
- **Spacing:** `var(--space-1)` … `var(--space-5)`, `var(--grid-gap)`
- **Typography:** `var(--font-sans)`, `var(--font-display)`, and size vars (`--text-h1`, `--text-body`, etc.)

### 2. Tailwind theme

`tailwind.config.js` extends the theme with the same palette and radii:

- **Colors:** `primary` (#004E98), `secondary` (#3A6EA5), `accent` (#FF6700), `canvas` (#EBEBEB), `muted` (#C0C0C0)
- **Border radius:** `rounded-sm` (12px), `rounded-md` (18px), `rounded-lg` (28px), `rounded-pill` (999px)
- **Shadows:** `shadow-soft`, `shadow-strong`

Use them in classes, e.g. `bg-canvas`, `text-primary`, `rounded-lg`, `shadow-soft`.

### 3. Applying 60/30/10

- Set **body / main canvas** to `var(--bg)` (#EBEBEB) so ~60% of the screen is this neutral.
- Use **cards and panels** with `var(--surface-card)` or `var(--surface-muted)` (surface with opacity) so blocks read clearly against the canvas (~30%).
- Use **accent** (#FF6700) only for primary actions, active states, and key badges (~10%).
- Use **accent-strong** (#004E98) for primary analytics numbers, chart lines, and strong emphasis.

### 4. Dark theme

A dark variant is defined in `tokens.css` under `[data-theme="dark"]`. Toggle it by setting:

```js
document.documentElement.setAttribute('data-theme', 'dark');
// or
document.documentElement.setAttribute('data-theme', 'light');
```

All components that use CSS variables will pick up the dark palette automatically.

### 5. Component folder

Reusable UI components live under `src/components/`:

- **Sidebar**, **Topbar**, **GenderToggle** — layout and nav
- **KPIGrid** — KPI cards
- **LeaderboardTable**, **PlayerCard** — leaderboard
- **ImpactGauge** — circular impact score
- **MatchList**, **MatchDetail** — match explorer
- **InningsTable** — innings breakdown table
- **PressureIsotherm** — pressure heatmap
- **ExplainModal** — formula/explainer modal
- **PlayerSearch** — search with suggestions

Use these with the existing API and context; they are built to work with the current routes and data shapes.

---

**Summary:** Import `tokens.css`, use `var(--*)` or Tailwind theme classes, keep 60/30/10 in mind, and toggle `data-theme` for light/dark.
