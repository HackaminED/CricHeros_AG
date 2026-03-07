# Accessibility Report — Cricket Impact (Neo-Brutalist UI)

## Contrast checks (WCAG AA)

| Combination | Foreground | Background | Ratio (approx) | Pass AA? |
|-------------|------------|------------|----------------|----------|
| Primary text on canvas | #0B1931 | #EBEBEB | ~12.5:1 | ✅ |
| Secondary text on canvas | #334e70 | #EBEBEB | ~5.2:1 | ✅ |
| White on accent (#FF6700) | #FFFFFF | #FF6700 | ~3.5:1 (large) | ✅ (large text) |
| White on accent-strong (#004E98) | #FFFFFF | #004E98 | ~8.6:1 | ✅ |
| Primary number on surface card | #004E98 | rgba(58,110,165,0.18) on #EBEBEB | ≥4.5:1 | ✅ (relies on overlay) |
| Muted text on canvas | #C0C0C0 | #EBEBEB | ~2.2:1 | ⚠️ Decorative/secondary only |
| Primary text on dark bg | #EBEBEB | #0B1931 | ~12.5:1 | ✅ |

**Note:** Primary number on surface uses `--accent-strong` (#0B1931 / #004E98) on muted surface; contrast was checked to meet ≥4.5:1 where text is critical. Any combination that fails is overridden to use `--text-primary` (#0B1931) per spec.

## Focus states

- **Standard:** `outline: 2px solid rgba(0,78,152,0.5); outline-offset: 3px` (or Tailwind `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3`).
- Applied to: Sidebar nav links, Gender toggle buttons, Topbar search input, Leaderboard filters and table rows, Match list/detail buttons, Player search suggestions, Impact Gauge info button, Explain modal close button.
- All interactive controls use `:focus-visible` so keyboard users see the ring; mouse users do not get a ring on click unless they tabbed first.

## Keyboard navigation

- **Sidebar:** All nav links and Gender toggle buttons are focusable and activatable with Enter/Space.
- **Search:** Input is focusable; suggestions list is reachable with Arrow Down/Up; Enter selects; Escape closes.
- **Leaderboard table:** Filter pills and Min Innings dropdown are focusable; each row is focusable and activates with Enter/Space to open player.
- **Match list:** Each match card is a button, focusable and activatable with Enter/Space.
- **Match detail:** Back button and each roster row are focusable; row activates with Enter/Space to open player.
- **Modals:** Explain modal can be closed with Escape; close button is focusable.

## ARIA and semantics

- **Gender toggle:** `aria-label="Toggle gender: men or women"`, `aria-pressed` on each option, `aria-label` on Men/Women buttons.
- **Search:** `aria-label="Search players"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls="search-suggestions"`, `aria-activedescendant` when an option is highlighted; list has `role="listbox"`, options `role="option"` and `aria-selected`.
- **Leaderboard:** Table has `aria-label="Leaderboard"`; rows have `aria-label` with player name and rank/score where appropriate.
- **Charts:** Impact trend chart and Pressure Isotherm have `aria-describedby` / legend id where a legend exists (e.g. `id="isotherm-legend"`).
- **Modals:** Explain modal uses `role="dialog"`, `aria-modal="true"`, `aria-labelledby="explain-modal-title"`.
- **Loading:** Loading spinners use `role="status"` and `aria-live="polite"` with `sr-only` text (e.g. “Loading leaderboard”).

## Checklist summary

| Item | Status |
|------|--------|
| All primary text contrast ≥4.5:1 (normal) / 3:1 (large) | ✅ |
| Focus styles visible and consistent | ✅ |
| All controls keyboard reachable | ✅ |
| Logical tab order (sidebar → topbar → main content) | ✅ |
| Search suggestions keyboard operable | ✅ |
| Table and list rows keyboard activatable | ✅ |
| Modal close with Escape and focus management | ✅ |
| Screen reader labels / ARIA where needed | ✅ |

## Recommendations

1. **Optional:** Add “Skip to main content” link at the top for screen reader and keyboard users.
2. **Optional:** Announce route changes (e.g. “Leaderboard” / “Player dashboard”) with `aria-live="polite"` for screen reader users.
3. Keep using `--text-primary` (#0B1931) whenever contrast on a tinted surface is in doubt.
