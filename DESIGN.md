---
name: Modern Enterprise HR SaaS
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
  on-surface-variant: '#44474e'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777f'
  outline-variant: '#c5c6cf'
  surface-tint: '#4e5e82'
  primary: '#031636'
  on-primary: '#ffffff'
  primary-container: '#1a2b4c'
  on-primary-container: '#8293ba'
  inverse-primary: '#b6c6f0'
  secondary: '#006a6a'
  on-secondary: '#ffffff'
  secondary-container: '#88f1f0'
  on-secondary-container: '#006e6e'
  tertiary: '#141819'
  on-tertiary: '#ffffff'
  tertiary-container: '#292c2e'
  on-tertiary-container: '#909395'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#b6c6f0'
  on-primary-fixed: '#071b3b'
  on-primary-fixed-variant: '#364669'
  secondary-fixed: '#8bf3f3'
  secondary-fixed-dim: '#6ed7d7'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#004f50'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.5'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  sidebar-width: 260px
---

## Brand & Style

This design system is engineered for high-stakes enterprise environments where clarity and trust are paramount. The aesthetic merges **Corporate Minimalism** with **Glassmorphism**, utilizing translucent layers to reduce visual density and create a sense of digital depth. 

The personality is authoritative yet approachable—avoiding the clinical coldness of traditional enterprise software in favor of a "Human-First" digital workspace. The interface relies on significant whitespace, high-quality iconography, and soft gradients to guide the user’s eye through complex HR workflows without causing cognitive fatigue.

## Colors

The palette is anchored by **Professional Navy Blue (#1A2B4C)**, which establishes a foundation of stability and institutional trust. 

- **Primary:** Navy Blue is used for critical navigation, primary actions, and brand moments.
- **Accent:** **Soft Teal (#4EBABA)** is applied sparingly for success states, data visualizations, and secondary highlights to provide a refreshing contrast to the dark navy.
- **Surface:** A series of **Light Greys** (ranging from #F8FAFC to #E2E8F0) creates the "step-back" background layers, allowing white cards to pop.
- **Glassmorphism:** Surfaces utilize semi-transparent white backgrounds with a heavy backdrop-blur (20px+) to create a sophisticated, layered look.

## Typography

The design system utilizes a dual-font strategy to balance character with utility. **Manrope** is used for headlines to provide a modern, refined geometric touch that feels premium. **Inter** is the workhorse for all UI elements, body text, and data-heavy tables, chosen for its exceptional legibility and neutral, systematic tone.

Text scales are optimized for high-density information. In data tables and forms, use `body-sm` to maintain a compact view without sacrificing readability.

## Layout & Spacing

The design system employs a **Fixed-Fluid Hybrid** grid. The primary navigation is a **sticky sidebar** on the left (260px), while the main content area utilizes a fluid 12-column grid with a maximum container width of 1440px to prevent line lengths from becoming unreadable on ultra-wide monitors.

- **Margins:** 32px page margins on desktop, scaling down to 16px on mobile.
- **Rhythm:** An 8px base unit drives all padding and margin decisions. 
- **Sticky Elements:** Table headers and top action bars must remain sticky during scroll to ensure HR administrators never lose context when managing long lists of employee data.

## Elevation & Depth

Depth is achieved through **Ambient Shadows** and **Glassmorphism** rather than heavy borders. 

1.  **Level 0 (Base):** Background color (#F8FAFC).
2.  **Level 1 (Cards):** White background, 1px subtle border (#E2E8F0), and a soft shadow (0px 4px 20px rgba(26, 43, 76, 0.05)).
3.  **Level 2 (Modals/Popovers):** Glassmorphic surface with a 70% opacity white fill, 20px backdrop blur, and a more pronounced shadow (0px 10px 30px rgba(26, 43, 76, 0.1)).

Shadow colors are never pure black; they are always tinted with the Primary Navy Blue to keep the UI feeling cohesive and premium.

## Shapes

The shape language is friendly and modern. The default radius for cards and major containers is **12px (rounded-lg)**. 

- **Small Components:** Checkboxes and small tags use a 4px radius.
- **Interactive Elements:** Buttons and input fields use an 8px radius to feel distinct from the containers they sit within.
- **Iconography:** Icons should feature rounded caps and corners to mirror the UI's softness.

## Components

### Buttons
Inspired by modern Bootstrap evolution, buttons feature a slight 2px vertical offset shadow that disappears on hover to simulate a "press" effect. 
- **Primary:** Navy Blue background, white text, subtle teal glow on hover.
- **Secondary:** Soft Teal background with Navy text for high-contrast secondary actions.

### Cards
Cards are the primary container for all HR modules. They must feature a 12px+ border radius and a 1px "ghost border" (#E2E8F0). Header sections within cards should have a subtle bottom divider.

### Sticky Sidebar
The sidebar uses a dark-themed variant of the primary navy blue or a frosted glass effect depending on the page context. Icons are essential for module identification (e.g., a "Users" icon for Payroll, "Document" for Compliance).

### Data Tables
Tables are high-density. Use `sticky table headers` with a slightly translucent background. Row hover states should use a very faint Teal tint (#F0F9F9) to help users track information horizontally.

### Inputs
Text fields utilize a soft grey background that turns white on focus, accompanied by a 2px Soft Teal outer glow to indicate the active state.