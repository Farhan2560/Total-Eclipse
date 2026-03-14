# PDF Master Dark Mode

Chrome extension (Manifest V3) that adds dark mode and adjustable visual filters for PDF files opened online and from local disk.

Current extension version: `1.0` (from `manifest.json`).

## Highlights

- Dark mode toggle for PDFs.
- Always auto-enable option to turn on dark mode automatically when a PDF is opened.
- Live sliders for brightness, contrast, grayscale, and blue light filter.
- Reset button to restore all controls to default values.
- Keyboard shortcut support: `Alt+Shift+D` (`MacCtrl+Shift+D` on macOS).
- Settings are persisted with `chrome.storage.local` and restored automatically.
- Works with both web and local PDF URLs.

## How It Works

The extension applies visual effects in the PDF tab using two methods:

- CSS filter stack on `document.documentElement`:
	- `invert(100%) hue-rotate(180deg)` when dark mode is enabled.
	- `brightness(...)`, `contrast(...)`, and `grayscale(...)` from slider values.
- A full-screen orange overlay element for blue light reduction, with adjustable opacity.

Changes from the popup are sent to the active tab in real time. Keyboard toggle updates the stored state and sends the new settings to the current tab.

## Default Values

- `darkMode`: `false`
- `autoEnable`: `false`
- `brightness`: `100`
- `contrast`: `100`
- `grayscale`: `0`
- `blueLight`: `0`

## Installation (Unpacked)

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select this project folder.

### Enable Local PDF Support

To use the extension on `file:///` PDFs:

1. Open `chrome://extensions`.
2. Open **PDF Master Dark Mode** details.
3. Enable **Allow access to file URLs**.

## Usage
1. Open any PDF URL (for example `https://.../file.pdf` or `file:///.../file.pdf`).
2. Click the extension icon to open the popup.
3. Toggle `Dark Mode` and optionally `Always Auto-Enable`.
4. Tune sliders:
	 - Brightness: `50-150`
	 - Contrast: `50-150`
	 - Grayscale: `0-100`
	 - Blue Light Filter: `0-50`
5. Click **Restore Default** to reset all settings.

## Keyboard Shortcut

- Command name: `toggle-dark-mode`
- Default shortcut: `Alt+Shift+D`
- macOS shortcut: `MacCtrl+Shift+D`

You can change shortcuts in Chrome at `chrome://extensions/shortcuts`.

## Permissions

- `storage`: save and restore user preferences.
- `activeTab`: send updates to the currently active tab.
- `scripting`: declared for extension capabilities.
- Host permissions:
	- `file:///*`
	- `https://*/*.pdf`

Content script matching includes both plain and query-string PDF URLs, and runs in all frames on matching pages.

## Project Structure

- `manifest.json`: Extension manifest and command/permission setup.
- `background.js`: Handles keyboard command toggle and pushes updates to active tab.
- `content.js`: Injects filters/overlay and applies saved or live settings on PDF pages.
- `popup.html`: Popup markup for toggles, sliders, and reset button.
- `popup.css`: Popup styling.
- `popup.js`: Popup state management, storage sync, and live tab messaging.
- `icons/`: Extension icons (`16`, `48`, `128`).

## Notes

- This extension targets PDF URLs that match the manifest rules. Non-PDF pages are ignored.
- If a message is sent to a non-matching tab, the extension safely ignores the error.
