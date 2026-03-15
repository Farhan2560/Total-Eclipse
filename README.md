# Total Eclipse

A premium Chrome Extension (Manifest V3) that applies true dark mode, advanced visual filters, and eye-care protections to the entire internet—including local PDF files—featuring a sophisticated dynamic control panel.

## What's New in Version 1.1
* **Universal Web Support:** Expanded from a PDF-only tool to work seamlessly across all websites (`<all_urls>`).
* **Smart Media Protection:** Custom CSS injection protects images, videos, and canvas elements from being inverted while dark mode is active.
* **Premium Glassmorphic UI:** A complete redesign featuring a gold-accented, mechanical keyboard-style tactile interface with animated sweeping typography and dynamic translucent hover glows.
* **Granular Controls:** Added `+` and `-` micro-adjustment buttons to all sliders for precise tuning.
* **Per-Site Local Storage:** Extension filters automatically remember your exact custom configurations on a domain-by-domain basis.

## Core Features

- **Dark Mode Mechanical Toggle** – Inverts website colors using native CSS `invert` and `hue-rotate` for a true dark-mode experience that uniquely preserves image and media colors.
- **Brightness Slider** – Adjusts visual brightness across the page (50% to 150%).
- **Contrast Slider** – Adjusts web contrast for maximum legibility (50% to 150%).
- **Grayscale Slider** – Progressively converts the page to black and white (0% to 100%).
- **Blue Light Filter** – Applies a warm, eye-safe amber tint with adjustable opacity (0% to 50%) specifically calibrated for late-night reading.
- **Site-Specific Persistence** – Settings are mapped locally to specific domains (e.g. your settings on YouTube remain distinct from your settings on Wikipedia).
- **Real-Time Rendering** – Filter adjustments apply instantly to the active tab via live dynamic messaging—no page reload required.
- **Local PDF Engine** – Still works perfectly on PDFs opened straight from your hard drive (`file:///` URLs).

## Installation (Developer Mode)

1. Download or clone this repository.
2. Open **Chrome** and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the root folder of this repository.
5. Click the puzzle piece icon in your Chrome toolbar and **Pin** the extension.

### Enabling Local File Access
To use the extension on offline PDFs:
1. Go to `chrome://extensions`.
2. Find **Total-Eclipse** and click **Details**.
3. Enable **Allow access to file URLs**.

## Usage & Shortcuts

1. Open any website or PDF in Chrome.
2. Click the extension icon to open the control panel and adjust your sliders.
3. **Keyboard Shortcut:** Press `Alt+Shift+D` (Windows/Linux) or `Ctrl+Shift+D` (Mac) to quickly toggle Dark Mode on or off without opening the menu.
4. Click **Restore Default** to instantly clear all applied filters.

## File Overview

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (Manifest V3) defining global `<all_urls>` permissions and shortcuts |
| `background.js` | Service worker managing the keyboard shortcuts |
| `popup.html` | Redesigned extension popup UI featuring mechanical buttons, plus/minus steppers, and new typography |
| `popup.css` | Advanced 'Glassmorphism' dark-themed styling, dynamic gold layout, shadow mechanics, and text animations |
| `popup.js` | Logic for loading/saving per-domain settings, handling tactile UI interactions, and routing live updates |
| `content.js` | Injects native CSS filters, the blue light overlay, and media protection into the page |
| `icons/icon-16.png` | 16x16 extension icon |
| `icons/icon-48.png` | 48x48 extension icon |
| `icons/icon-128.png` | 128x128 extension icon |
