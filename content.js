(function () {
  'use strict';

  const DEFAULTS = {
    darkMode: false,
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    blueLight: 0,
  };

  // Avoid injecting multiple times
  if (document.getElementById('pdf-master-bluelight-overlay')) {
    return;
  }

  // --- Blue light filter overlay ---
  // We still use an overlay for this because CSS doesn't have a native "orange tint" filter
  const blueLightOverlay = document.createElement('div');
  blueLightOverlay.id = 'pdf-master-bluelight-overlay';

  blueLightOverlay.style.cssText = [
    'position: fixed',
    'inset: 0',
    'width: 100%',
    'height: 100%',
    'pointer-events: none',
    'z-index: 2147483647',
    'background-color: #FF8C00',
    'opacity: 0',
    'transition: opacity 0.2s',
  ].join('; ');

  document.documentElement.appendChild(blueLightOverlay);

  function applySettings(settings) {
    const s = Object.assign({}, DEFAULTS, settings);

    let filters = [];

    // --- NEW: Handle Image/Video double-inversion for regular websites ---
    let styleTag = document.getElementById('dark-mode-media-fix');
    
    if (s.darkMode) {
      filters.push('invert(100%)');
      filters.push('hue-rotate(180deg)');
      
      // Inject CSS to flip images and videos back to normal
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dark-mode-media-fix';
        styleTag.textContent = 'img, video, canvas, picture, svg[class*="logo" i], svg[id*="logo" i], [role="img"][class*="logo" i] { filter: invert(100%) hue-rotate(180deg) !important; }';
        document.head.appendChild(styleTag);
      }
    } else {
      // Remove the fix if dark mode is turned off
      if (styleTag) styleTag.remove();
    }
    // ---------------------------------------------------------------------

    filters.push('brightness(' + s.brightness + '%)');
    filters.push('contrast(' + s.contrast + '%)');
    filters.push('grayscale(' + s.grayscale + '%)');

    document.documentElement.style.filter = filters.join(' ');
    blueLightOverlay.style.opacity = (s.blueLight / 100).toString();
  }

  function loadSettings() {
    chrome.storage.local.get(null, function (allData) {
      const applyToAllSites = typeof allData.applyToAllSites === 'boolean' ? allData.applyToAllSites : false;
      const globalSettings = {
        darkMode: typeof allData.darkMode === 'boolean' ? allData.darkMode : DEFAULTS.darkMode,
        brightness: typeof allData.brightness === 'number' ? allData.brightness : DEFAULTS.brightness,
        contrast: typeof allData.contrast === 'number' ? allData.contrast : DEFAULTS.contrast,
        grayscale: typeof allData.grayscale === 'number' ? allData.grayscale : DEFAULTS.grayscale,
        blueLight: typeof allData.blueLight === 'number' ? allData.blueLight : DEFAULTS.blueLight,
      };

      const domain = window.location.hostname;
      const siteSettings = allData[domain];
      const mergedSettings = siteSettings ? { ...globalSettings, ...siteSettings } : { ...globalSettings };
      const settingsToUse = applyToAllSites ? globalSettings : mergedSettings;

      applySettings(settingsToUse);
    });
  }

  // Listen for live updates from the popup
  chrome.runtime.onMessage.addListener(function (message) {
    if (message && message.type === 'UPDATE_FILTERS') {
      applySettings(message.settings);
    }
  });

  loadSettings();
  
})();