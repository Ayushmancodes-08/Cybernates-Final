---
name: Calm Enterprise Security Intelligence
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#555e74'
  on-secondary: '#ffffff'
  secondary-container: '#d7dff9'
  on-secondary-container: '#5a6278'
  tertiary: '#005d73'
  on-tertiary: '#ffffff'
  tertiary-container: '#007793'
  on-tertiary-container: '#dcf4ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d9e2fc'
  secondary-fixed-dim: '#bdc6e0'
  on-secondary-fixed: '#121b2e'
  on-secondary-fixed-variant: '#3e475b'
  tertiary-fixed: '#b7eaff'
  tertiary-fixed-dim: '#6cd3f7'
  on-tertiary-fixed: '#001f28'
  on-tertiary-fixed-variant: '#004e61'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-title:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  display-title-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  section-title:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  section-title-mobile:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  card-title:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-regular:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-semibold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  meta-badge:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  tech-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  tech-mono-base:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-sm: 0.75rem
  gutter-lg: 1.5rem
  margin: 1.5rem
  margin-sm: 1rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system embodies Calm Enterprise Security Intelligence: an architecture engineered for Security Operations Centers (SOCs), SecOps engineers, and enterprise CISOs who require rapid situational awareness and uncompromising legibility under incident response pressure. It rejects sci-fi tropes, terminal-green neon glows, noisy dark-mode veneers, and hyperbolic threat theatrics. 

Instead, the design system treats security intelligence with the poise of mission-critical mission-control interfaces. The visual language is disciplined, quiet, and balanced, relying on precise typographic weight, strict data alignment, tactile white surfaces, and reserved semantic accents. High-density telemetric tables, adaptive rule matrices, and AI-driven triage explanations coexist cleanly. The emotional tone projects absolute stability, clarity of intent, deterministic predictability, and trustworthy operational rigor.

## Colors

The system uses a calibrated light mode as default to maximize day-long reading comfort, high-resolution graph scanning, and instant optical parsing in brightly lit enterprise operations centers. 

### Core Palette
- **Canvas / App Background (`#F6F8FB`)**: A cool, low-saturation neutral that prevents glare while cleanly framing white elevation surfaces.
- **Surface Primary (`#FFFFFF`)**: Pure white reserved for actionable panels, cards, data grids, and modals.
- **Surface Secondary (`#F1F4F8`)**: Muted backing used for data-table headers, toolbar wells, code containers, and segmented control tracks.
- **Sidebar & Shell Chrome (`#172033`)**: Deep navy ink foundation that grounds global navigation, system breadcrumbs, and command bar triggers.
- **Sidebar Active / Focus Surface (`#263552`)**: Controlled tonal lift for active navigational items and state persistence.
- **Brand Primary (`#2563EB`)**: High-fidelity operational blue used for primary affordances, active tabs, focus rings, and confirmed selections.
- **Brand Primary Hover (`#1D4ED8`)**: Darkened state interaction token.

### Typography & Structure
- **Text Primary (`#172033`)**: Maximum contrast readability for headlines, metrics, table cells, and form entries.
- **Text Secondary (`#64748B`)**: Slate neutral for field labels, metadata descriptions, and secondary metrics.
- **Text Muted (`#94A3B8`)**: Non-essential timestamps, deactivated states, and trailing helper text.
- **Border Default (`#E2E8F0`)**: Crisp 1px structural boundaries defining the spatial grid.

### Semantic & Threat Level Spectrum
Color is strictly functional; it is never decorative. Semantic colors are applied with intentional containment to prevent alert fatigue:
- **Success / Safe / Healthy (`#16A34A`)**: Baseline operating efficiency and passing compliance checks.
- **Low Severity (`#2563EB`)**: Non-urgent telemetry changes or routine informational alerts.
- **Medium Severity (`#D97706`)**: Anomalous behavior requiring scheduled review.
- **High Severity (`#EA580C`)**: Urgent risk with lateral propagation potential.
- **Critical Severity (`#DC2626`)**: Active compromise, exploit execution, or critical perimeter breaches.
- **Informational / Telemetry (`#0891B2`)**: Raw packet logs, DNS resolution events, and trace metrics.

## Typography

The typographic hierarchy is split into two specialized typefaces: **Inter** for all UI surfaces, navigational items, actions, and administrative content; and **JetBrains Mono** strictly reserved for deterministic technical assets—IPv4/IPv6 addresses, CIDR blocks, SHA-256 signatures, firewall rule logic, ports, CVE numbers, and event IDs.

### Guidelines & Execution
- **Tabular Figures**: Numeric and quantitative data within tables, incident counts, latency metrics, and throughput displays must enable `font-variant-numeric: tabular-nums` to eliminate layout shift across live data streams.
- **Mono Confinement**: Do not render regular body text, labels, or buttons in monospace. Monospace is an intentional cue indicating an immutable technical entity that can be copied, inspected, or queried.
- **Letter Spacing**: Large titles use tight tracking (`-0.02em`) to bind headline phrasing, while uppercase badges and status chips use expanded tracking (`+0.04em`) to safeguard character recognition at compact sizes.

## Layout & Spacing

The interface uses a 12-column responsive fluid grid pinned within an expansive maximum container width of `1680px`, maintaining an operational density ratio that maximizes visible telemetry without sacrificing scanning speed.

### Grid Rhythm & Screen Breakpoints
- **Desktop (1280px and above)**: Persistent collapsed/expandable vertical navigation (240px wide default, 64px compact), 12-column layout with 24px (`margin-lg`) canvas margins and 20px (`gutter`) column gutters.
- **Tablet / Mid-tier Laptop (768px – 1279px)**: Off-canvas drawer navigation, 8-column layout with 16px (`margin`) outer padding and 16px (`gutter-sm`) gaps. Multi-card dashboard grids collapse from 4-up to 2-up configurations.
- **Mobile (below 768px)**: 4-column reflow, 16px outer safety margins. Split data tables collapse into stacked key-value metadata list rows.

### Density Tiers
Spacing tokens govern data-table padding strictly:
- **Compact Density (Logs / Firewall Matrix)**: Row height 36px, horizontal padding `space-md` (12px), vertical padding `space-xs` (4px).
- **Default Density (Asset Queues / Incidents)**: Row height 48px, horizontal padding `space-lg` (16px), vertical padding `space-sm` (8px).
- **Comfortable Density (Settings / Threat Intel Briefs)**: Row height 56px, horizontal padding `space-xl` (24px), vertical padding `space-md` (12px).

## Elevation & Depth

Visual hierarchy is established strictly through **tonal layering and low-contrast outlines**. The system categorically eliminates glow effects, diffuse drop shadows, and high-opacity elevation layers that contribute to visual fatigue.

### Layering Hierarchy
1. **Base Layer (Canvas)**: `#F6F8FB`. Grounding tone behind all floating planes.
2. **Structural Layer (Cards, Data Panels, Modules)**: `#FFFFFF` encased in a crisp `1px solid #E2E8F0` border. Shadow is restrained to a minimal, resting-contact shadow: `0 1px 3px 0 rgba(0, 0, 0, 0.05)`.
3. **Elevated Surfaces (Popovers, Command Palette, Dropdowns)**: `#FFFFFF` encased in a `1px solid #CBD5E1` border paired with an ambient utility shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)`.
4. **Overlay Planes (Incident Drawers, Critical Confirmation Modals)**: `#FFFFFF` resting over a subdued scrim (`#172033` at 40% opacity), framed with `0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03)`.

## Shapes

The design system maintains a structured, low-curvature visual discipline (`roundedness: 1`). Radii are tightly controlled to support geometric precision and compact tabular alignment without the softened informality of consumer consumer-grade shapes.

### Corner Radius Allocation
- **Badges, Status Chips, Micro-indicators**: 4px radius (`rounded-sm`).
- **Interactive Controls (Inputs, Buttons, Segmented Controls)**: 6px radius (`rounded-md`).
- **Cards, Panels, Modals, System Wells**: 8px radius (`rounded-lg`).
- **Pill Shapes (Restricted)**: Full circular pills (`9999px`) are strictly reserved for unread counter pips and global system posture status chips.

## Components

### Buttons
- **Primary**: Background `#2563EB`, text `#FFFFFF`, 6px radius, font weight 600. Hover `#1D4ED8`, active `#1E40AF`. Focus ring: 2px offset with `#2563EB` at 100%.
- **Secondary**: Background `#FFFFFF`, text `#172033`, border `1px solid #E2E8F0`. Hover background `#F1F4F8`.
- **Danger**: Background `#DC2626`, text `#FFFFFF`. Hover `#B91C1C`. Focus ring: 2px offset with `#DC2626`.
- **Ghost / Subtle**: Background transparent, text `#64748B`. Hover background `#F1F4F8`, hover text `#172033`.

### Standardized Badges & Severity Chips
Badges use muted, tinted backgrounds with high-contrast foreground text to preserve readability:
- **SAFE / HEALTHY / RESOLVED**: Background `#DCFCE7`, text `#15803D`, border `1px solid #BBF7D0`.
- **LOW / MONITORING**: Background `#DBEAFE`, text `#1D4ED8`, border `1px solid #BFDBFE`.
- **MEDIUM / DEGRADED**: Background `#FEF3C7`, text `#B45309`, border `1px solid #FDE68A`.
- **HIGH**: Background `#FFEDD5`, text `#C2410C`, border `1px solid #FED7AA`.
- **CRITICAL / BLOCKED / OFFLINE**: Background `#FEE2E2`, text `#B91C1C`, border `1px solid #FECACA`.
- **ACTIVE / TELEMETRY**: Background `#CFFAFE`, text `#0E7490`, border `1px solid #A5F3FC`.

### Global Security Posture Indicator
Pinned to the header utility space, rendering the real-time operational posture:
- Consists of a full-pill container with a pulsing static dot:
  - **NORMAL**: Slate base, green indicator dot.
  - **ELEVATED**: Amber border, amber indicator dot.
  - **RESTRICTED**: Deep orange background tint, orange dot.
  - **CONTAINMENT**: Solid crimson border, red indicator dot.
  - **RECOVERY**: Cyan border, cyan indicator dot.

### Enterprise Search & Command Bar (Cmd+K)
- Centered top layout with a maximum width of 640px. Input container uses `#FFFFFF`, a 1px border (`#CBD5E1`), and a leading 14px search glyph with keyboard shortcut badge (`⌘K`).
- Dropdown overlay categorizes results into semantic groups: `Threat Actors`, `Firewall Rules`, `IP/CIDR Assets`, `Recent Incidents`, and `System Commands`.
- Technical values inside results render in `tech-mono-sm` (`JetBrains Mono`).

### Contextual AI Analysis Card
- Container: `#FFFFFF` surface with an accent border: `1px solid #E2E8F0` and an intentional 3px solid `#2563EB` left-border stripe.
- **Confidence Gauge**: Top-right corner pill showing precision score (e.g., `98.4% Confidence`), using `#F1F4F8` background with `#172033` text.
- **Evidence Module**: Numbered bulleted list using `#172033` body text and `#64748B` supporting telemetry traces.
- **Recommended Action Footer**: Secondary surface `#F1F4F8` bounding box with single-click remediation buttons (e.g., `Apply Adaptive Block Rule`, `Simulate Rule`).

### Form Controls & Inputs
- **Text Inputs**: Height 36px (dense) or 40px (default). Background `#FFFFFF`, border `1px solid #E2E8F0`, corner radius 6px. Active focus: border `#2563EB`, subtle box-shadow `0 0 0 1px #2563EB`.
- **Checkboxes & Radios**: 16px square/circle, `#FFFFFF` fill with `1px solid #CBD5E1` border. Checked state: `#2563EB` fill with white checkmark glyph.

### Operational State Patterns
- **Empty State**: Centered vertical stack within card bounds. Muted linear wireframe icon (stroke width 1.5px, color `#94A3B8`), title in `card-title` (`#172033`), descriptive text in `caption` (`#64748B`), followed by a secondary action button.
- **Loading State**: Shimmer skeleton blocks using linear background gradient sweeps from `#F1F4F8` to `#E2E8F0` back to `#F1F4F8`. No spinning graphics for tabular layouts.
- **Error State**: Boxed alert banner using `#FEF2F2` background, `1px solid #FCA5A5`, containing an alert circle icon, error breakdown with copyable error code in `JetBrains Mono`, and a primary retry button.