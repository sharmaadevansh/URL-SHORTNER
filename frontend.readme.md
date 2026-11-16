# LinkForge — Frontend Design Document

> **Stack:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS  
> **Status:** Design specification — screens, components, states, and interactions

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design System](#2-design-system)
3. [Application Shell & Navigation](#3-application-shell--navigation)
4. [Page Screens](#4-page-screens)
   - [4.1 Landing Page](#41-landing-page)
   - [4.2 Login Page](#42-login-page)
   - [4.3 Register Page](#43-register-page)
   - [4.4 Dashboard — Link List](#44-dashboard--link-list)
   - [4.5 Create / Edit Link Modal](#45-create--edit-link-modal)
   - [4.6 Link Analytics Page](#46-link-analytics-page)
   - [4.7 Account Settings Page](#47-account-settings-page)
   - [4.8 404 Not Found Page](#48-404-not-found-page)
5. [Component Library](#5-component-library)
6. [State Management](#6-state-management)
7. [API Integration Layer](#7-api-integration-layer)
8. [Routing & Navigation](#8-routing--navigation)
9. [Responsive Design](#9-responsive-design)
10. [Micro-interactions & Animations](#10-micro-interactions--animations)
11. [Accessibility](#11-accessibility)
12. [Performance Strategy](#12-performance-strategy)
13. [Project Structure](#13-project-structure)
14. [Environment & Configuration](#14-environment--configuration)

---

## 1. Design Philosophy

LinkForge's frontend follows four principles drawn from modern SaaS product design:

| Principle | Implementation |
|-----------|---------------|
| **Minimal by default** | Whitespace-first layouts; no decorative chrome. Calm, focused UI that gets out of the user's way. |
| **Progressive disclosure** | Show only what the user needs at each step. Advanced options (custom alias, expiry) are behind an "Advanced" toggle. |
| **Instant feedback** | Optimistic UI updates on link creation/deletion. Toasts for async results. Skeleton loaders for perceived speed. |
| **Keyboard-first** | Every action reachable via keyboard. Modals trap focus. `Escape` always closes. |

**Visual identity:** Dark sidebar / light content area. Monochromatic palette with a single brand accent. Inter typeface throughout. Rounded cards with subtle shadows.

---

## 2. Design System

### 2.1 Color Palette

```
  Primary (Brand Accent)
  ┌─────────────────────────────────────────────────────────────┐
  │  brand-50   #f0f4ff   │  brand-100  #dce8ff               │
  │  brand-500  #4f6ef7   │  brand-600  #3a56e8  (hover)      │
  │  brand-700  #2e45d4   │  brand-900  #1a2a9a  (pressed)    │
  └─────────────────────────────────────────────────────────────┘

  Neutral (UI Shell)
  ┌─────────────────────────────────────────────────────────────┐
  │  gray-50    #fafafa   │  gray-100   #f4f4f5  (bg)         │
  │  gray-200   #e4e4e7   │  gray-400   #a1a1aa  (placeholder)│
  │  gray-600   #52525b   │  gray-800   #27272a  (body text)  │
  │  gray-900   #18181b   │  gray-950   #0f0f10  (sidebar)    │
  └─────────────────────────────────────────────────────────────┘

  Semantic
  ┌─────────────────────────────────────────────────────────────┐
  │  success  #22c55e   │  warning  #f59e0b   │  error  #ef4444│
  │  info     #3b82f6   │  disabled #d4d4d8                    │
  └─────────────────────────────────────────────────────────────┘
```

### 2.2 Typography

```
  Font Family: Inter (Google Fonts)

  Scale:
  ┌─────────────┬──────────┬────────┬─────────────────────────┐
  │ Token       │ Size     │ Weight │ Usage                   │
  ├─────────────┼──────────┼────────┼─────────────────────────┤
  │ text-xs     │ 11px     │ 400    │ Labels, badges          │
  │ text-sm     │ 13px     │ 400    │ Secondary body, captions│
  │ text-base   │ 15px     │ 400    │ Primary body            │
  │ text-lg     │ 17px     │ 500    │ Card titles             │
  │ text-xl     │ 20px     │ 600    │ Section headings        │
  │ text-2xl    │ 24px     │ 700    │ Page headings           │
  │ text-4xl    │ 36px     │ 800    │ Hero / landing          │
  │ text-6xl    │ 60px     │ 900    │ 404 error display       │
  └─────────────┴──────────┴────────┴─────────────────────────┘
```

### 2.3 Spacing & Radius

```
  Spacing scale (Tailwind default): 4px base unit
  Container max-width: 1280px
  Sidebar width:        240px
  Content padding:      24px (desktop) / 16px (mobile)

  Border radius:
    sm  → 6px   (inputs, badges)
    md  → 10px  (cards, modals)
    lg  → 16px  (dialogs)
    xl  → 24px  (landing hero sections)
    full → 9999px (pills, avatars)
```

### 2.4 Shadow System

```
  shadow-xs   → 0 1px 2px rgba(0,0,0,0.05)          cards at rest
  shadow-sm   → 0 2px 8px rgba(0,0,0,0.08)          cards on hover
  shadow-md   → 0 4px 16px rgba(0,0,0,0.12)         modals
  shadow-lg   → 0 8px 32px rgba(0,0,0,0.18)         dropdown menus
```

---

## 3. Application Shell & Navigation

### 3.1 Authenticated Layout (Dashboard Shell)

```
┌──────────────────────────────────────────────────────────────────┐
│                         BROWSER WINDOW                           │
├────────────┬─────────────────────────────────────────────────────┤
│            │  ┌───────────────────────────────────────────────┐  │
│  SIDEBAR   │  │               TOP BAR                         │  │
│  240px     │  │  Search...            [🔔] [Avatar ▼]        │  │
│  bg-950    │  └───────────────────────────────────────────────┘  │
│            │                                                      │
│  ⬡ LinkForge                                                     │
│  ─────────                                                       │
│  🔗 Links  │  ┌───────────────────────────────────────────────┐  │
│  📊 Analytics  │               PAGE CONTENT                   │  │
│  ⚙️  Settings  │               max-w-7xl, padded               │  │
│            │  │                                               │  │
│  ─────────                                                       │
│            │  │                                               │  │
│  [Avatar]  │  │                                               │  │
│  User Name │  │                                               │  │
│  user@... │  │                                               │  │
│  [Logout]  │  └───────────────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────────────┘
```

### 3.2 Public Layout (Marketing / Auth Pages)

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  NAVBAR  ⬡ LinkForge          Features  Pricing  [Login] │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│                       PAGE CONTENT                                │
│                      (full-width, centered)                       │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  FOOTER   © 2026 LinkForge · Privacy · Terms · GitHub   │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### 3.3 Sidebar Nav Items

| Icon | Label | Route | Active State |
|------|-------|--------|-------------|
| 🔗 | Links | `/dashboard` | Left border accent + bg-brand-50 |
| 📊 | Analytics | `/dashboard/analytics` | Left border accent + bg-brand-50 |
| ⚙️ | Settings | `/dashboard/settings` | Left border accent + bg-brand-50 |

---

## 4. Page Screens

---

### 4.1 Landing Page

**Route:** `/`  
**Auth:** Public  
**Purpose:** Convert visitors into registered users. Explain the product, show the core action.

```
┌──────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                          │
│  ⬡ LinkForge              Features   How it works   [Login]     │
│                                                     [Get Started]│
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│                      HERO SECTION                                │
│                                                                   │
│          Shorten links.                                          │
│          Track every click.                                      │
│                                                                   │
│          Turn your long URLs into clean, trackable links         │
│          with real-time analytics. No fluff, just speed.         │
│                                                                   │
│          ┌────────────────────────────────┐  ┌──────────────┐   │
│          │  https://your-long-url.com/... │  │  Shorten →   │   │
│          └────────────────────────────────┘  └──────────────┘   │
│                           (try it without signing up)            │
│                                                                   │
│          ┌────────────┐  ┌────────────────┐  ┌───────────────┐  │
│          │ 50K+ links │  │ 5M+ redirects  │  │ 99.9% uptime  │  │
│          └────────────┘  └────────────────┘  └───────────────┘  │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│                    HOW IT WORKS  (3 steps)                       │
│                                                                   │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│   │   Step 01    │    │   Step 02    │    │   Step 03    │      │
│   │              │    │              │    │              │      │
│   │  Paste your  │ →  │  Get your    │ →  │  Track every │      │
│   │  long link   │    │  short link  │    │  click       │      │
│   │              │    │              │    │              │      │
│   └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│                    FEATURES (2-col grid)                         │
│                                                                   │
│   ┌───────────────────────┐    ┌───────────────────────┐         │
│   │  🔗  Custom Aliases   │    │  📊  Click Analytics  │         │
│   │  Create memorable     │    │  Referrer, device,    │         │
│   │  branded short links  │    │  browser breakdown    │         │
│   └───────────────────────┘    └───────────────────────┘         │
│   ┌───────────────────────┐    ┌───────────────────────┐         │
│   │  ⏰  Link Expiry      │    │  ⚡  Redis-Powered    │         │
│   │  Auto-disable links   │    │  Sub-50ms redirects   │         │
│   │  after a set date     │    │  globally cached      │         │
│   └───────────────────────┘    └───────────────────────┘         │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                     CTA SECTION                                  │
│                                                                   │
│          Ready to shorten your first link?                       │
│                                                                   │
│                    [ Create free account ]                       │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│  FOOTER                                                          │
│  © 2026 LinkForge · Privacy Policy · Terms · GitHub             │
└──────────────────────────────────────────────────────────────────┘
```

**Key interactions:**
- Hero input: paste URL → click `Shorten →` → if unauthenticated, redirects to `/register?prefill=<url>`
- Stat counters animate up from 0 when scrolled into view
- Navbar becomes sticky + adds `backdrop-blur` + subtle border on scroll past 80px
- CTA button pulses with a subtle glow animation on hover

---

### 4.2 Login Page

**Route:** `/login`  
**Auth:** Public (redirect to `/dashboard` if already logged in)

```
┌──────────────────────────────────────────────────────────────────┐
│  NAVBAR  ⬡ LinkForge                                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│          ┌─────────────────────────────────────────┐             │
│          │               ⬡ LinkForge               │             │
│          │                                         │             │
│          │          Welcome back                   │             │
│          │       Sign in to your account           │             │
│          │                                         │             │
│          │  Email address                          │             │
│          │  ┌───────────────────────────────────┐  │             │
│          │  │  you@example.com                  │  │             │
│          │  └───────────────────────────────────┘  │             │
│          │                                         │             │
│          │  Password                               │             │
│          │  ┌───────────────────────────────────┐  │             │
│          │  │  ••••••••••••             [👁 ]   │  │             │
│          │  └───────────────────────────────────┘  │             │
│          │                                         │             │
│          │                       Forgot password?  │             │
│          │                                         │             │
│          │  ┌───────────────────────────────────┐  │             │
│          │  │             LOGIN                 │  │             │
│          │  └───────────────────────────────────┘  │             │
│          │                                         │             │
│          │       ─────────── or ───────────        │             │
│          │                                         │             │
│          │  ┌─────┐          ┌─────┐  ┌─────┐     │             │
│          │  │  G  │          │  ⬡  │  │  fb │     │             │
│          │  └─────┘          └─────┘  └─────┘     │             │
│          │                                         │             │
│          │   Don't have an account?  Sign up →     │             │
│          └─────────────────────────────────────────┘             │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**States:**

| State | Visual Behavior |
|-------|----------------|
| Default | Clean card, all inputs empty |
| Typing | Input border turns `brand-500`, label floats up |
| Email invalid | Red border + inline error `"Please enter a valid email"` |
| Loading | Login button shows spinner, disables form |
| Success | Button turns green → smooth transition to `/dashboard` |
| Error (401) | Error banner above form: `"Invalid email or password"` |
| Error (429) | Specific banner: `"Too many attempts. Try again in 15 minutes."` |

**Validation:** Client-side with `react-hook-form` + `zod` schema before any API call.

---

### 4.3 Register Page

**Route:** `/register`  
**Auth:** Public (redirect to `/dashboard` if already logged in)

```
┌──────────────────────────────────────────────────────────────────┐
│  NAVBAR  ⬡ LinkForge                                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│          ┌─────────────────────────────────────────┐             │
│          │               ⬡ LinkForge               │             │
│          │                                         │             │
│          │       Create your free account          │             │
│          │       Start shortening in seconds       │             │
│          │                                         │             │
│          │  Full name                              │             │
│          │  ┌───────────────────────────────────┐  │             │
│          │  │  Jane Doe                         │  │             │
│          │  └───────────────────────────────────┘  │             │
│          │                                         │             │
│          │  Email address                          │             │
│          │  ┌───────────────────────────────────┐  │             │
│          │  │  you@example.com                  │  │             │
│          │  └───────────────────────────────────┘  │             │
│          │                                         │             │
│          │  Password                               │             │
│          │  ┌───────────────────────────────────┐  │             │
│          │  │  ••••••••••••             [👁 ]   │  │             │
│          │  └───────────────────────────────────┘  │             │
│          │  ████████░░░░  Moderate strength         │             │
│          │                                         │             │
│          │  ┌───────────────────────────────────┐  │             │
│          │  │          CREATE ACCOUNT           │  │             │
│          │  └───────────────────────────────────┘  │             │
│          │                                         │             │
│          │  By signing up you agree to our Terms   │             │
│          │  of Service and Privacy Policy          │             │
│          │                                         │             │
│          │       Already have an account? Login    │             │
│          └─────────────────────────────────────────┘             │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Password strength indicator:**

```
  Very weak   ░░░░░  red
  Weak        ██░░░  orange
  Moderate    ███░░  yellow
  Strong      ████░  blue
  Very strong █████  green
```

Strength computed by: length ≥ 12, uppercase, lowercase, number, special character.

---

### 4.4 Dashboard — Link List

**Route:** `/dashboard`  
**Auth:** Required

```
┌────────────┬─────────────────────────────────────────────────────┐
│  SIDEBAR   │  Search...                        [🔔] [Avatar ▼]  │
│            ├─────────────────────────────────────────────────────┤
│  ⬡ LinkForge              My Links                              │
│  ─────────                                                      │
│  🔗 Links  │  ┌────────────────────────────────────────────┐    │
│  📊 Analytics  │  Total Links     Total Clicks    Active Links  │
│  ⚙️  Settings  │   24 links        18,432          20            │
│            │  └────────────────────────────────────────────┘    │
│            │                                                     │
│            │  ┌───────────────────────────────────────────┐     │
│            │  │ 🔍 Search links...  [All ▼]  [+ New Link] │     │
│            │  └───────────────────────────────────────────┘     │
│            │                                                     │
│            │  ┌──────────────────────────────────────────────┐  │
│            │  │ SHORT LINK         DESTINATION      CLICKS    │  │
│            │  ├──────────────────────────────────────────────┤  │
│            │  │                                              │  │
│            │  │ lnk.io/abc123      example.com/...  1,234   │  │
│            │  │ ✅ Active  · Created 3 days ago             │  │
│            │  │ [📋 Copy] [📊 Analytics] [✏️ Edit] [🗑 Del]  │  │
│            │  ├──────────────────────────────────────────────┤  │
│            │  │                                              │  │
│            │  │ lnk.io/my-launch   company.com/...   892    │  │
│            │  │ ✅ Active  · Custom alias · Expires Jan 1   │  │
│            │  │ [📋 Copy] [📊 Analytics] [✏️ Edit] [🗑 Del]  │  │
│            │  ├──────────────────────────────────────────────┤  │
│            │  │                                              │  │
│            │  │ lnk.io/xyz789      docs.example.com    0    │  │
│            │  │ ⛔ Disabled · Created 2 weeks ago           │  │
│            │  │ [📋 Copy] [📊 Analytics] [✏️ Edit] [🗑 Del]  │  │
│            │  ├──────────────────────────────────────────────┤  │
│            │  │                                              │  │
│            │  │ lnk.io/summer23    old-site.com/...   412   │  │
│            │  │ ⏰ Expired · Dec 31, 2025                   │  │
│            │  │ [📋 Copy] [📊 Analytics] [✏️ Edit] [🗑 Del]  │  │
│            │  └──────────────────────────────────────────────┘  │
│            │                                                     │
│            │  Showing 1–10 of 24 links  [← Prev]  [Next →]     │
└────────────┴─────────────────────────────────────────────────────┘
```

**Link Card Status Badges:**

```
  ✅ Active    →  green dot + "Active"    bg-green-50  text-green-700
  ⛔ Disabled  →  gray dot + "Disabled"   bg-gray-100  text-gray-500
  ⏰ Expired   →  red dot + "Expired"     bg-red-50    text-red-600
```

**Empty State (no links yet):**

```
  ┌────────────────────────────────────────────────────────────┐
  │                                                            │
  │                       🔗                                  │
  │                                                            │
  │               No links yet                                │
  │          Shorten your first URL to get started            │
  │                                                            │
  │                 [ + Create your first link ]               │
  │                                                            │
  └────────────────────────────────────────────────────────────┘
```

**Search + Filter bar:**

```
  ┌───────────────────────────┐  ┌──────────┐  ┌──────────────────┐
  │  🔍 Search by title/code  │  │ Status ▼ │  │  + New Link      │
  └───────────────────────────┘  └──────────┘  └──────────────────┘

  Status dropdown options:
    • All links (default)
    • Active only
    • Disabled
    • Expired
```

---

### 4.5 Create / Edit Link Modal

**Trigger:** `+ New Link` button or `✏️ Edit` on a link card  
**Type:** Centered modal with backdrop blur

```
  ┌─────────────────────────────────────────────────────┐
  │  Create new link                              [ × ] │
  │  ─────────────────────────────────────────────────  │
  │                                                     │
  │  Destination URL *                                  │
  │  ┌───────────────────────────────────────────────┐  │
  │  │  https://example.com/my/very/long/url         │  │
  │  └───────────────────────────────────────────────┘  │
  │  ✓ Valid URL                                        │
  │                                                     │
  │  Link title  (optional)                             │
  │  ┌───────────────────────────────────────────────┐  │
  │  │  My product launch                            │  │
  │  └───────────────────────────────────────────────┘  │
  │                                                     │
  │  ┌── Advanced options ───────────────────────────┐  │
  │  │  ▼ Show advanced options                      │  │
  │  └───────────────────────────────────────────────┘  │
  │                                                     │
  │  [expanded state ↓]                                 │
  │                                                     │
  │  ┌── Advanced options ───────────────────────────┐  │
  │  │  ▲ Hide                                       │  │
  │  │                                               │  │
  │  │  Custom alias  (optional)                     │  │
  │  │  ┌──────────────────────────────────────────┐ │  │
  │  │  │  lnk.io/ │  my-product-launch            │ │  │
  │  │  └──────────────────────────────────────────┘ │  │
  │  │  3–50 chars · letters, numbers, - and _ only  │  │
  │  │                                               │  │
  │  │  Expiry date  (optional)                      │  │
  │  │  ┌──────────────────────────────────────────┐ │  │
  │  │  │  📅  YYYY-MM-DD                          │ │  │
  │  │  └──────────────────────────────────────────┘ │  │
  │  │                                               │  │
  │  └───────────────────────────────────────────────┘  │
  │                                                     │
  │  ┌────────────┐              ┌───────────────────┐  │
  │  │   Cancel   │              │   Create link →   │  │
  │  └────────────┘              └───────────────────┘  │
  └─────────────────────────────────────────────────────┘
```

**Post-creation success state (inline, same modal):**

```
  ┌─────────────────────────────────────────────────────┐
  │  ✅  Link created!                            [ × ] │
  │  ─────────────────────────────────────────────────  │
  │                                                     │
  │                  lnk.io/my-product-launch           │
  │                                                     │
  │  ┌────────────────────────────────────────────┐     │
  │  │  https://lnk.io/my-product-launch          │  📋 │
  │  └────────────────────────────────────────────┘     │
  │             [ Copied! ✓ ]  (after click)            │
  │                                                     │
  │   ┌───────────────┐      ┌─────────────────────┐   │
  │   │  Create more  │      │   View analytics →  │   │
  │   └───────────────┘      └─────────────────────┘   │
  └─────────────────────────────────────────────────────┘
```

**Edit mode differences:**
- Modal title: `Edit link`
- Fields pre-populated with current values
- Destination URL field shows current value with note: `"Changing this URL will also clear the redirect cache."`
- Button text: `Save changes`
- Delete button with confirmation (separate step within modal)

---

### 4.6 Link Analytics Page

**Route:** `/dashboard/links/:id/analytics`  
**Auth:** Required (owner only)

```
┌────────────┬─────────────────────────────────────────────────────┐
│  SIDEBAR   │  ← My Links                                        │
│            ├─────────────────────────────────────────────────────┤
│  🔗 Links  │  lnk.io/my-launch           [📋 Copy] [✏️ Edit]   │
│  📊 Analytics  →  example.com/my/long/article/url              │
│  ⚙️  Settings  │  Created: Nov 10, 2026 · Status: ✅ Active      │
│            │                                                     │
│            │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│            │  │  Total   │  │  Today   │  │  Time range      │  │
│            │  │  clicks  │  │  clicks  │  │  [7d ▼]          │  │
│            │  │  1,892   │  │   143    │  │  7d / 30d / 90d  │  │
│            │  └──────────┘  └──────────┘  └──────────────────┘  │
│            │                                                     │
│            │  CLICKS OVER TIME                                   │
│            │  ┌───────────────────────────────────────────────┐  │
│            │  │                              ·                │  │
│            │  │                         ·  · ·                │  │
│            │  │                    · ·  ·                     │  │
│            │  │        ·   ·   · ·                            │  │
│            │  │  · ·  ·                                       │  │
│            │  │───────────────────────────────────────────────│  │
│            │  │  Nov10  Nov11  Nov12  Nov13  Nov14  Nov15     │  │
│            │  └───────────────────────────────────────────────┘  │
│            │                                                     │
│            │  ┌─────────────────┐  ┌────────────────────────┐   │
│            │  │  TOP REFERRERS  │  │  DEVICE BREAKDOWN      │   │
│            │  │                 │  │                        │   │
│            │  │  google.com     │  │  Desktop  ████ 68%     │   │
│            │  │  ████████  52%  │  │  Mobile   ███  25%     │   │
│            │  │  twitter.com    │  │  Tablet   █    7%      │   │
│            │  │  ████  28%      │  │                        │   │
│            │  │  direct         │  │                        │   │
│            │  │  ██  12%        │  │                        │   │
│            │  │  other          │  │                        │   │
│            │  │  █  8%          │  │                        │   │
│            │  └─────────────────┘  └────────────────────────┘   │
│            │                                                     │
│            │  ┌─────────────────────────────────────────────┐   │
│            │  │  BROWSER BREAKDOWN                          │   │
│            │  │                                             │   │
│            │  │  Chrome     ████████  61%                   │   │
│            │  │  Safari     ████  27%                       │   │
│            │  │  Firefox    █   8%                          │   │
│            │  │  Edge       █   4%                          │   │
│            │  └─────────────────────────────────────────────┘   │
└────────────┴─────────────────────────────────────────────────────┘
```

**Chart library:** `recharts` (line chart for time series, horizontal bar for breakdowns)

**Time range selector behavior:**
- `7d` → day buckets (7 data points)
- `30d` → day buckets (30 data points)
- `90d` → week buckets (13 data points)

**Zero-data state (new link, no clicks yet):**

```
  ┌─────────────────────────────────────────────────────────────┐
  │                                                             │
  │                      📊                                    │
  │                                                             │
  │                   No clicks yet                            │
  │          Share your link to start collecting data          │
  │                                                             │
  │                   [ 📋 Copy link ]                         │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
```

---

### 4.7 Account Settings Page

**Route:** `/dashboard/settings`  
**Auth:** Required

```
┌────────────┬─────────────────────────────────────────────────────┐
│  SIDEBAR   │  Settings                                           │
│            ├─────────────────────────────────────────────────────┤
│            │                                                     │
│            │  ┌──── Profile ──────────────────────────────────┐  │
│            │  │                                               │  │
│            │  │  ┌──────┐                                     │  │
│            │  │  │  JD  │  Jane Doe                          │  │
│            │  │  │      │  jane@example.com                  │  │
│            │  │  └──────┘  [Change avatar]                   │  │
│            │  │                                               │  │
│            │  │  Full name                                    │  │
│            │  │  ┌───────────────────────────────────────┐   │  │
│            │  │  │  Jane Doe                             │   │  │
│            │  │  └───────────────────────────────────────┘   │  │
│            │  │                                               │  │
│            │  │  Email address                                │  │
│            │  │  ┌───────────────────────────────────────┐   │  │
│            │  │  │  jane@example.com                     │   │  │
│            │  │  └───────────────────────────────────────┘   │  │
│            │  │                              [ Save changes ] │  │
│            │  └───────────────────────────────────────────────┘  │
│            │                                                     │
│            │  ┌──── Change Password ──────────────────────────┐  │
│            │  │                                               │  │
│            │  │  Current password                             │  │
│            │  │  ┌───────────────────────────────────────┐   │  │
│            │  │  │  ••••••••••            [👁]           │   │  │
│            │  │  └───────────────────────────────────────┘   │  │
│            │  │                                               │  │
│            │  │  New password                                 │  │
│            │  │  ┌───────────────────────────────────────┐   │  │
│            │  │  │  ••••••••••            [👁]           │   │  │
│            │  │  └───────────────────────────────────────┘   │  │
│            │  │  ████████░░  Strong                          │  │
│            │  │                                               │  │
│            │  │                        [ Update password ]    │  │
│            │  └───────────────────────────────────────────────┘  │
│            │                                                     │
│            │  ┌──── Danger Zone ──────────────────────────────┐  │
│            │  │  bg-red-50, border-red-200                    │  │
│            │  │                                               │  │
│            │  │  Delete account                               │  │
│            │  │  This action is permanent and cannot be       │  │
│            │  │  undone. All your links will stop working.    │  │
│            │  │                                               │  │
│            │  │                        [ Delete my account ]  │  │
│            │  └───────────────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────────────┘
```

**Delete account flow:**
1. Click `Delete my account`
2. Confirmation modal appears with text input: type `DELETE` to confirm
3. Submit → logout → redirect to `/` with toast: `"Your account has been deleted."`

---

### 4.8 404 Not Found Page

**Route:** Any unmatched route  
**Two variants:** App 404 (bad dashboard route) and Redirect 404 (unknown short code)

**Variant A — App / Dashboard 404:**

```
┌──────────────────────────────────────────────────────────────────┐
│  NAVBAR  ⬡ LinkForge                                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│                                                                   │
│                          404                                     │
│                    (large, gray-200)                             │
│                                                                   │
│                  Oops! Page not found.                           │
│                                                                   │
│          We couldn't find the page you're looking for.           │
│          It may have been moved or deleted.                       │
│                                                                   │
│          ┌──────────────────────┐  ┌────────────────────────┐   │
│          │   ← Go back          │  │   Go to Dashboard  →  │   │
│          └──────────────────────┘  └────────────────────────┘   │
│                                                                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Variant B — Short Code Not Found / Expired (redirect 404):**

```
┌──────────────────────────────────────────────────────────────────┐
│  NAVBAR  ⬡ LinkForge                                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│                          404                                     │
│                                                                   │
│               This link doesn't exist.                           │
│                                                                   │
│          lnk.io/abc123 is not a valid link.                      │
│          It may have been deleted, disabled, or never created.   │
│                                                                   │
│                   [ Create your own links ]                      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Variant C — Expired Link (410 Gone):**

```
│                       ⏰  410                                    │
│                                                                   │
│               This link has expired.                             │
│                                                                   │
│          lnk.io/summer23 was only available until Dec 31, 2025.  │
│          Contact the link owner for an updated link.             │
```

---

## 5. Component Library

### 5.1 Core Components

```
components/
├── ui/
│   ├── Button.tsx          # variant: primary | ghost | danger | outline
│   ├── Input.tsx           # with label, error message, icon slot
│   ├── Textarea.tsx
│   ├── Badge.tsx           # variant: active | disabled | expired
│   ├── Card.tsx            # with optional hover state
│   ├── Modal.tsx           # portal + focus trap + Escape close
│   ├── Toast.tsx           # success | error | warning | info
│   ├── Skeleton.tsx        # loading placeholder blocks
│   ├── Spinner.tsx         # inline and full-page variants
│   ├── Tooltip.tsx         # on hover, keyboard-accessible
│   ├── Dropdown.tsx        # accessible listbox
│   ├── Avatar.tsx          # initials fallback
│   ├── EmptyState.tsx      # icon + title + description + CTA
│   └── PasswordStrength.tsx
│
├── layout/
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── DashboardShell.tsx
│   ├── PublicNavbar.tsx
│   └── Footer.tsx
│
├── links/
│   ├── LinkCard.tsx        # one row in the link list
│   ├── LinkActions.tsx     # copy / analytics / edit / delete
│   ├── LinkStatusBadge.tsx
│   ├── CreateLinkModal.tsx
│   ├── EditLinkModal.tsx
│   ├── DeleteConfirmModal.tsx
│   └── LinkSearch.tsx
│
├── analytics/
│   ├── ClicksChart.tsx      # recharts line chart
│   ├── ReferrerList.tsx
│   ├── DeviceBreakdown.tsx
│   ├── BrowserBreakdown.tsx
│   └── StatCard.tsx
│
└── auth/
    ├── LoginForm.tsx
    ├── RegisterForm.tsx
    └── ProtectedRoute.tsx
```

### 5.2 Button Variants

```
  Primary:  bg-brand-500  text-white   hover:bg-brand-600   active:bg-brand-700
  Ghost:    bg-transparent text-gray-600  hover:bg-gray-100
  Outline:  border-gray-300  hover:border-brand-500
  Danger:   bg-red-600  text-white   hover:bg-red-700
  Link:     text-brand-500  underline   no background

  Sizes:
    sm  → py-1 px-3  text-sm
    md  → py-2 px-4  text-base   (default)
    lg  → py-3 px-6  text-lg
```

### 5.3 Input States

```
  Default:    border-gray-300  focus:border-brand-500  focus:ring-2
  Valid:      border-green-400  bg-green-50
  Error:      border-red-400   bg-red-50
  Disabled:   bg-gray-100  cursor-not-allowed  opacity-60
  Loading:    pulse animation on border
```

### 5.4 Toast Notifications

```
  Position: bottom-right, stacked, 300ms slide-in

  ┌──────────────────────────────────────────┐
  │  ✅  Link copied to clipboard!      [✕] │  (success, auto-dismiss 3s)
  └──────────────────────────────────────────┘

  ┌──────────────────────────────────────────┐
  │  ❌  Failed to create link.         [✕] │  (error, manual dismiss)
  │      Check your URL and try again.      │
  └──────────────────────────────────────────┘
```

### 5.5 Skeleton Loaders

Dashboard link list skeleton (while fetching):

```
  ┌────────────────────────────────────────────────────────────┐
  │  ████████████████      ████████████████████████    ████   │
  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
  ├────────────────────────────────────────────────────────────┤
  │  ████████████████      ████████████████████████    ████   │
  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
  └────────────────────────────────────────────────────────────┘
  (using `animate-pulse` from Tailwind)
```

---

## 6. State Management

### 6.1 Strategy

| Scope | Tool | Why |
|-------|------|-----|
| Server data (links, analytics) | **TanStack Query (React Query)** | Caching, stale-while-revalidate, background refetch |
| Auth state (user, tokens) | **Zustand** thin store | Simple, global, persisted to `localStorage` |
| Form state | **React Hook Form + Zod** | Performant, schema-validated |
| UI state (modals, toasts) | **Local `useState`** | Ephemeral, no need for global state |

### 6.2 React Query Configuration

```typescript
// Key factory (prevents magic strings)
export const queryKeys = {
  links: {
    all: ['links'] as const,
    list: (filters: LinkFilters) => ['links', 'list', filters] as const,
    detail: (id: string) => ['links', 'detail', id] as const,
    analytics: (id: string, range: string) => ['links', 'analytics', id, range] as const,
  },
  user: {
    me: ['user', 'me'] as const,
  },
};

// Global defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,       // 1 minute
      gcTime: 1000 * 60 * 5,      // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 6.3 Optimistic Updates

Link creation uses optimistic UI:

```
1. User clicks "Create link"
2. → Immediately add placeholder card to list (with spinner badge)
3. → Send POST /api/v1/links
4a. Success → Replace placeholder with real data + success toast
4b. Failure → Remove placeholder + error toast + re-open modal with values
```

Link deletion:
```
1. Click delete → Confirmation modal
2. Confirm → Immediately remove card from list (grey out + slide out)
3. Send DELETE /api/v1/links/:id
4b. If failure → Re-add card + error toast
```

### 6.4 Auth Store (Zustand)

```typescript
interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}
```

Access token stored in memory only. Refresh token stored in `HttpOnly` cookie (server-managed). On page reload, the app calls `GET /api/v1/auth/me` with the cookie to silently re-authenticate.

---

## 7. API Integration Layer

### 7.1 Axios Client

```
lib/
├── api/
│   ├── client.ts           # Axios instance with interceptors
│   ├── auth.api.ts         # Login, register, logout, refresh
│   ├── links.api.ts        # CRUD for links
│   └── analytics.api.ts   # Analytics queries
```

```typescript
// client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,          // send refresh token cookie
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach access token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: auto-refresh on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const { accessToken } = await refreshToken();
      useAuthStore.getState().setAccessToken(accessToken);
      return apiClient(error.config);
    }
    return Promise.reject(error);
  }
);
```

### 7.2 Custom Hooks

```typescript
// hooks/useLinks.ts
export function useLinks(filters: LinkFilters) {
  return useQuery({
    queryKey: queryKeys.links.list(filters),
    queryFn: () => linksApi.getLinks(filters),
  });
}

// hooks/useCreateLink.ts
export function useCreateLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: linksApi.createLink,
    onMutate: async (newLink) => {
      // optimistic update
    },
    onError: (_, __, context) => {
      // rollback
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links.all });
    },
  });
}
```

---

## 8. Routing & Navigation

### 8.1 Route Map

```
app/
├── (public)/
│   ├── page.tsx                        → /               Landing
│   ├── login/page.tsx                  → /login          Login
│   ├── register/page.tsx               → /register       Register
│   └── [code]/page.tsx                 → /:code          Redirect handler*
│
├── dashboard/
│   ├── layout.tsx                      → Dashboard shell (auth guard)
│   ├── page.tsx                        → /dashboard      Link list
│   ├── links/[id]/analytics/page.tsx   → /dashboard/links/:id/analytics
│   └── settings/page.tsx               → /dashboard/settings
│
└── not-found.tsx                       → 404 fallback
```

> *The redirect handler at `/[code]` calls the backend API and performs `redirect()` server-side. It is **not** a client-side navigation — it issues a proper `302` from the Next.js route handler.

### 8.2 Auth Guard (Middleware)

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('refresh_token');
  const isAuthPage = ['/login', '/register'].includes(request.nextUrl.pathname);
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  if (isDashboard && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
```

---

## 9. Responsive Design

### 9.1 Breakpoints (Tailwind)

```
  sm:   640px   Mobile landscape
  md:   768px   Tablet portrait
  lg:   1024px  Tablet landscape / small laptop
  xl:   1280px  Desktop
  2xl:  1536px  Wide desktop
```

### 9.2 Layout Adaptation

| Viewport | Sidebar | Link Cards | Analytics |
|----------|---------|------------|-----------|
| Mobile (<768px) | Hidden — bottom nav tab bar | Full width, condensed | Charts scroll horizontally |
| Tablet (768–1024px) | Collapsed — icons only (48px) | Full width | Charts stack vertically |
| Desktop (>1024px) | Full sidebar (240px) | Table layout | Side-by-side |

**Mobile bottom nav (< md):**

```
  ┌────────────────────────────────────────────────────────────┐
  │                                                            │
  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
  │  │  🔗 Links │  │ 📊 Stats │  │  ⚙️  Set  │  │ 👤 Me   │ │
  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
  └────────────────────────────────────────────────────────────┘
```

**Mobile Create Link:** Floating Action Button (FAB) in bottom-right corner:

```
                                              ┌───┐
                                              │ + │  ← FAB, brand-500
                                              └───┘
```

---

## 10. Micro-interactions & Animations

### 10.1 Animation Tokens

```typescript
// tailwind.config.ts
animation: {
  'fade-in':     'fadeIn 150ms ease-out',
  'slide-up':    'slideUp 200ms ease-out',
  'slide-down':  'slideDown 200ms ease-out',
  'pulse-once':  'pulseOnce 600ms ease-in-out',
}
```

### 10.2 Interaction Catalog

| Interaction | Animation | Duration |
|-------------|-----------|----------|
| Modal open | Fade in backdrop + scale(0.95→1) + translateY(10px→0) | 200ms |
| Modal close | Reverse | 150ms |
| Toast appear | Slide in from right | 300ms |
| Toast dismiss | Slide out + fade | 200ms |
| Link card hover | Subtle shadow increase + translate-y(-1px) | 100ms |
| Copy button click | Icon swap (📋 → ✓) + brief green flash | 1500ms |
| Delete card | Slide out left + fade to 0 opacity | 300ms |
| Page transitions | Fade (opacity 0→1) | 150ms |
| Stat counter | Count up from 0 on mount | 1000ms (ease-out) |
| Skeleton → content | Cross-fade | 200ms |
| Button loading | Spinner replaces text | Instant |

### 10.3 Copy-to-Clipboard Behavior

```
  Initial state:   [📋 Copy]
  On click:        clipboard.writeText(shortUrl)
  After 300ms:     [✓ Copied!]  (green, check icon)
  After 2000ms:    [📋 Copy]  (reset)
```

---

## 11. Accessibility

### 11.1 Standards Target

- WCAG 2.1 Level AA compliance
- Full keyboard navigation
- Screen reader tested (VoiceOver, NVDA)

### 11.2 Implementation Checklist

| Item | Implementation |
|------|---------------|
| Semantic HTML | `<nav>`, `<main>`, `<section>`, `<button>` (never `div` for interactive) |
| Focus management | Modal traps focus; on close, returns to trigger element |
| `Escape` key | Closes modals and dropdowns |
| `aria-label` | All icon-only buttons labeled: `aria-label="Copy short link"` |
| `aria-live` | Toast region: `aria-live="polite"` |
| `aria-busy` | Loading states: `aria-busy="true"` on table/list |
| Color contrast | All text ≥ 4.5:1 against background |
| Skip link | `<a href="#main-content" className="sr-only focus:not-sr-only">` |
| Error messages | `aria-describedby` linking input to error message |
| Status badges | Not color-only: icon + text + color |

---

## 12. Performance Strategy

### 12.1 Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| **LCP** (Largest Contentful Paint) | < 2.5s |
| **FID** / **INP** (Interaction to Next Paint) | < 200ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 |
| **TTFB** (Time To First Byte) | < 600ms |

### 12.2 Techniques

```
  Code splitting:        Each page lazy-loaded. Recharts only on analytics route.
  Image optimization:    next/image for all images; WebP with fallback.
  Font loading:          next/font with font-display: swap, subset: latin.
  Bundle analysis:       @next/bundle-analyzer in CI; alert if > 250kB initial JS.
  API cache:             React Query staleTime 60s; background refetch on focus.
  Prefetching:           next/link prefetches dashboard links on hover.
  Static generation:     Landing page fully static (SSG). No JS required for load.
  Streaming SSR:         Dashboard uses React Suspense boundaries for shell-first render.
```

### 12.3 Bundle Budget

| Chunk | Budget |
|-------|--------|
| Initial JS (landing) | ≤ 80 kB gzipped |
| Dashboard initial | ≤ 150 kB gzipped |
| Analytics page (+ Recharts) | ≤ 220 kB gzipped |
| Total CSS | ≤ 20 kB gzipped |

---

## 13. Project Structure

```
apps/web/
│
├── app/                            # Next.js App Router
│   ├── (public)/
│   │   ├── page.tsx               # / Landing page
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── [code]/
│   │       └── route.ts           # Server redirect handler
│   │
│   ├── dashboard/
│   │   ├── layout.tsx             # Dashboard shell
│   │   ├── page.tsx               # /dashboard — link list
│   │   ├── links/
│   │   │   └── [id]/
│   │   │       └── analytics/
│   │   │           └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── not-found.tsx
│   ├── layout.tsx                 # Root layout (providers, fonts)
│   └── globals.css
│
├── components/                    # (see §5)
├── hooks/                         # Custom React hooks
├── lib/
│   ├── api/                       # Axios client + typed API fns
│   ├── store/                     # Zustand stores
│   ├── utils/                     # Date formatting, clipboard, etc.
│   └── validators/                # Zod schemas (shared with forms)
│
├── middleware.ts                  # Auth routing guard
│
├── public/
│   ├── favicon.ico
│   └── og-image.png              # Open Graph image
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 14. Environment & Configuration

```dotenv
# .env.local (not committed)

# Public — safe to expose to browser
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SHORT_DOMAIN=lnk.io

# Server-only — NEVER prefix with NEXT_PUBLIC_
# (none required currently)
```

**Key `next.config.ts` settings:**

```typescript
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  experimental: {
    typedRoutes: true,          // catch bad hrefs at build time
  },
  async rewrites() {
    return [
      {
        source: '/:code',
        destination: '/api/redirect/:code',  // server-side redirect
      },
    ];
  },
};
```

---

> **Last updated:** November 2026  
> **Maintainer:** LinkForge Frontend Team  
> For backend API contracts, see [`systemdesign.md`](./systemdesign.md).  
> For deployment configuration, see [`LinkForge_README.md`](./LinkForge_README.md).
