# Playwright Skill

A Claude Code skill for complete browser automation using Playwright.

## Installation

```bash
/plugin marketplace add lackeyjb/playwright-skill
/plugin install playwright-skill@playwright-skill
/reload-plugins
```

Then run setup:

```bash
npm run setup
```

This installs dependencies and downloads the Chromium browser.

## Usage

Invoke with the `/playwright-skill` skill or just describe a browser task naturally.

### Example prompts

- "Take a screenshot of the homepage"
- "Test the login flow with email and password"
- "Check all links on the page for broken URLs"
- "Fill out and submit the contact form"
- "Validate the site on mobile and desktop viewports"
- "Test that the nav menu works correctly"

## What it can do

- **Screenshots** — capture full pages or specific elements
- **Form interaction** — fill inputs, click buttons, submit forms
- **Navigation testing** — check links, redirects, and routing
- **Responsive design** — test across multiple viewport sizes
- **Login flows** — authenticate and test protected pages
- **UX validation** — verify text, elements, and layout
- **Dev server auto-detection** — finds your local server automatically

## Notes

- Test scripts are written to `/tmp` and cleaned up after runs
- Uses Chromium by default
- Works with any local dev server or public URL
