---
name: Warm Whiskers
colors:
  surface: '#fff8f6'
  surface-dim: '#ecd5cf'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ed'
  surface-container: '#ffe9e4'
  surface-container-high: '#fbe3dd'
  surface-container-highest: '#f5ddd8'
  on-surface: '#251915'
  on-surface-variant: '#55433e'
  inverse-surface: '#3b2d29'
  inverse-on-surface: '#ffede8'
  outline: '#88726d'
  outline-variant: '#dbc1ba'
  surface-tint: '#984630'
  primary: '#984630'
  on-primary: '#ffffff'
  primary-container: '#f28c71'
  on-primary-container: '#6d2512'
  inverse-primary: '#ffb4a1'
  secondary: '#3f6562'
  on-secondary: '#ffffff'
  secondary-container: '#c1ebe7'
  on-secondary-container: '#456b68'
  tertiary: '#725764'
  on-tertiary: '#ffffff'
  tertiary-container: '#bf9fae'
  on-tertiary-container: '#4e3642'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb4a1'
  on-primary-fixed: '#3c0800'
  on-primary-fixed-variant: '#7a2f1b'
  secondary-fixed: '#c1ebe7'
  secondary-fixed-dim: '#a6ceca'
  on-secondary-fixed: '#00201e'
  on-secondary-fixed-variant: '#264d4a'
  tertiary-fixed: '#fdd9e9'
  tertiary-fixed-dim: '#e0bdcd'
  on-tertiary-fixed: '#2a1520'
  on-tertiary-fixed-variant: '#593f4c'
  background: '#fff8f6'
  on-background: '#251915'
  surface-variant: '#f5ddd8'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 20px
  element-gap: 16px
  section-margin: 32px
---

## Brand & Style
The design system centers on a "Cozy Kitchen Companion" narrative. It is designed for families seeking a stress-free, delightful meal-planning experience. The aesthetic is warm, nurturing, and playful, utilizing a soft Neumorphic approach to create a tactile, "squishy" interface that feels safe and inviting.

The visual language draws from **Neomorphism** and **Soft Minimalism**. Every element is treated as a physical object emerging from the cream-colored surface. The personality is defined by whimsical cat motifs—specifically rounded paw shapes and friendly feline illustrations—that act as emotional anchors throughout the user journey.

## Colors
The palette is built on a foundation of edible warmth. 
- **Primary (Coral Peach):** Used for main actions and key brand moments. It evokes appetite and energy.
- **Background (Cream):** The canvas for the entire UI, providing a soft, low-strain reading environment.
- **Neutrals (Deep Cocoa):** Instead of pure black, a deep brown is used for all text to maintain a gentle, organic feel.
- **Accents (Macaron Tones):** Soft mint (#B8E1DD), lavender (#E2D1F9), and pale lemon (#F7E7B0) are used for category tags and secondary indicators, ensuring a variety of visual "flavors" without overwhelming the user.

## Typography
We utilize **Plus Jakarta Sans** for its friendly, modern, and highly legible curves. The typographic scale is generous, prioritizing clarity for multi-generational users (parents and children). 

- **Weight Usage:** Use ExtraBold for primary headers to create a "bouncy" visual rhythm. Medium weight is preferred for body text to ensure readability against the cream background.
- **Color:** All typography should be set in the Neutral Deep Cocoa color. Avoid 100% opacity for secondary information to create hierarchy; instead, use 70% opacity of the same hue.

## Layout & Spacing
The layout is optimized for single-handed mobile use, following a fluid vertical rhythm. 
- **The 8px Grid:** All margins and paddings are multiples of 8.
- **Safe Zones:** Content is inset by 20px on the left and right to prevent accidental taps near the bezel and to maintain a "contained" feel.
- **Breathable UI:** Generous vertical spacing (32px between sections) ensures the Neumorphic shadows have room to "glow" without overlapping, preventing a cluttered appearance.

## Elevation & Depth
Depth is achieved through **Soft Neumorphism**. Surfaces do not sit *on* the background but are *part* of it.
- **Raised Elements:** Use a dual-shadow technique. A light shadow (White, 100% opacity, -4px -4px offset) and a dark shadow (Coral-tinted brown, 15% opacity, 6px 6px offset) create the "pushed out" effect.
- **Sunken Elements:** For active states or input fields, reverse the shadows to create an "inset" effect, suggesting the element has been pressed into the cream surface.
- **Shadow Softness:** All blur radii should be at least double the offset (e.g., 6px offset = 12px-16px blur) to maintain the "soft" brand promise.

## Shapes
The shape language is defined by "The Squircle." Sharp corners are strictly prohibited. 
- **Containers:** Large cards use a 24px radius to feel like smooth pebbles or soft cushions.
- **Interactive Elements:** Buttons utilize a full pill-shape (round-xl) or a minimum of 16px radius.
- **Icons:** All icons must have rounded caps and corners. Paw prints and cat ears should be integrated into container corners or button edges as decorative "tabs."

## Components
- **Buttons:** Primary buttons use the Coral Peach background with white or deep cocoa text. They must feature the "Raised" Neumorphic state, transitioning to "Sunken" on press. Use a paw-print icon trailing the text for "Next" or "Confirm" actions.
- **Cards:** Food item cards use a white background with a subtle border in the Primary color. The top corners are rounded at 24px.
- **Input Fields:** These should appear "Sunken" by default, using the inset shadow style. This clearly distinguishes them from "Raised" interactive buttons.
- **Chips/Filters:** Use the Macaron accent colors with 20% opacity for the background and 100% opacity for the text. Use a pill shape (fully rounded).
- **Navigation:** A floating bottom bar with a raised Neumorphic surface. The active state is indicated by a small cat-ear silhouette appearing above the icon.
- **Illustrations:** Use "Whiskered" placeholders for empty states—a sleeping cat for "No Orders" or a cat with a chef's hat for "Menu Planning."