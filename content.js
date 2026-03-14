(function () {
  'use strict';

  const DEFAULTS = {
    darkMode: false,
    autoEnable: false,
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

    // 1. Build native CSS filters
    let filters = [];

    if (s.darkMode) {
      // Invert colors natively, and hue-rotate to fix image/logo colors
      filters.push('invert(100%)');
      filters.push('hue-rotate(180deg)');
    }

    // Stack the sliders natively
    filters.push('brightness(' + s.brightness + '%)');
    filters.push('contrast(' + s.contrast + '%)');
    filters.push('grayscale(' + s.grayscale + '%)');

    // 2. Apply directly to the root HTML document! 
    document.documentElement.style.filter = filters.join(' ');

    // 3. Handle the Blue Light tint opacity
    blueLightOverlay.style.opacity = (s.blueLight / 100).toString();
  }

  // Load saved settings and apply immediately
  chrome.storage.local.get(DEFAULTS, function (saved) {
    
    // NEW LOGIC: If auto-enable is turned on, but dark mode is currently off, force it on.
    if (saved.autoEnable && !saved.darkMode) {
      saved.darkMode = true;
      // Save this forced state so the popup syncs up
      chrome.storage.local.set({ darkMode: true }); 
    }

    applySettings(saved);
  });

  // Listen for live updates from the popup
  chrome.runtime.onMessage.addListener(function (message) {
    if (message && message.type === 'UPDATE_FILTERS') {
      applySettings(message.settings);
    }
  });
})();