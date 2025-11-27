# Tonal Scale Builder – Feature Overview

## Color selection and input
- Two custom iro.js pickers capture the base hue and blend color. The base picker drives generation of the tonal ramp, while the blend picker feeds overlay adjustments. Both emit `color:changed` events that trigger a scale refresh and resize on window resize events. 【F:temp/src/js/index.js†L1-L31】
- The pickers expose HSV and RGB slider modes plus a hex text box with validation, ensuring interactive updates propagate across all picker widgets and the preview swatch. 【F:temp/src/js/components/myIroPicker.js†L15-L177】

## Gradient, blending, and saturation controls
- A control panel exposes blend mode, blend color, strength, peak, spread, and per-side saturation sliders (dark and light) backed by number inputs for precise tuning. Inputs stay synchronized bi-directionally. 【F:temp/index.html†L52-L98】【F:temp/src/js/index.js†L161-L174】【F:temp/src/js/index.js†L396-L431】
- Blending implementations cover dodge, overlay, soft/hard light, darken/lighten, multiply/screen, color burn/dodge, vivid light, and hue replacement, with channel-range validation. 【F:temp/src/js/utils/blendingmodes.js†L5-L50】【F:temp/src/js/utils/color.js†L177-L216】
- Tone shaping uses a cubic-bezier intensity curve with configurable midpoint and spread, plus saturation easing to adjust chroma differently for darker and lighter halves of the scale. 【F:temp/src/js/index.js†L440-L520】【F:temp/src/js/utils/easing.js†L5-L26】【F:temp/src/js/utils/color.js†L218-L240】

## Scale generation and visualization
- Every base color becomes a 0–100 LAB-based tonal scale with chroma falloff around the input luminance, converted back to RGB/hex for display. 【F:temp/src/js/index.js†L440-L520】
- The UI renders a full 101-step strip plus two curated subsets (extended key and key) that guarantee inclusion of the current luminance value. Each swatch shows its index, hex, and an indicator for the base luminance. 【F:temp/src/js/index.js†L557-L761】【F:temp/index.html†L43-L105】
- Hover and mousewheel interactions reveal contrast helper dots for AA/AAA candidates on both darker and lighter sides, updating linked color cards for immediate accessibility previews. 【F:temp/src/js/index.js†L621-L761】
- An optional Plotly overlay plots the active blend distribution curve atop the full strip while blend peak/spread sliders are adjusted. 【F:temp/src/js/index.js†L175-L265】

## Accessibility and contrast evaluation
- Four reusable color cards show WCAG status for large and regular text, icon samples, and paired color references. Cards re-render with new contrasts as the user hovers the scale, resetting when no valid pair exists. 【F:temp/index.html†L100-L195】【F:temp/src/js/components/colorcard.js†L1-L57】【F:temp/src/js/index.js†L668-L706】
- Contrast calculations rely on luminance-based ratios rounded to one decimal place, reused across UI helpers and the context menu shortcuts. 【F:temp/src/js/utils/color.js†L248-L262】【F:temp/src/js/index.js†L764-L821】

## Clipboard, import/export, and sharing
- A custom context menu on right-click offers one-click copy for the hovered color and nearest AA/AAA pairs. Copied actions show transient feedback. 【F:temp/src/js/index.js†L823-L895】【F:temp/src/js/utils/clipboard.js†L1-L9】
- A “Copy SVG” command captures all visible scale strips into an SVG (including URL and export JSON) and writes it to the clipboard for pasting into design tools. 【F:temp/src/js/index.js†L127-L159】
- Import/Export opens a modal with the current scale parameters serialized to JSON; users can paste JSON back to recreate a setup, with validation and alerts for invalid payloads. 【F:temp/src/js/index.js†L82-L125】
- Current settings synchronize with the URL query string (validated against defaults), enabling shareable links that restore pickers and controls on load. 【F:temp/src/js/index.js†L285-L389】【F:temp/src/js/index.js†L315-L389】

## Theming and UX polish
- Light/dark theming toggles via a toolbar button, persists in `localStorage`, and animates icon transitions; pickers and general styling adjust through CSS variables. 【F:temp/index.html†L27-L38】【F:temp/src/js/index.js†L23-L34】【F:temp/src/js/index.js†L285-L304】【F:temp/src/css/styles.css†L269-L337】
- Layout styling covers responsive color cards, grid/strip sizing, hover zoom with hex popovers, copied toast, modal scaffolding, and context menu theming, forming the baseline visual system for future Vue migration. 【F:temp/src/css/styles.css†L82-L689】
