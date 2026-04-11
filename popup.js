const DEFAULTS = {
  darkMode: false,
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  blueLight: 0,
};

const applyAllToggle = document.getElementById('applyAllToggle');
const darkModeToggle = document.getElementById('darkModeToggle');
const brightnessSlider = document.getElementById('brightnessSlider');
const contrastSlider = document.getElementById('contrastSlider');
const grayscaleSlider = document.getElementById('grayscaleSlider');
const blueLightSlider = document.getElementById('blueLightSlider');
const resetButton = document.getElementById('resetButton');

const brightnessValue = document.getElementById('brightnessValue');
const contrastValue = document.getElementById('contrastValue');
const grayscaleValue = document.getElementById('grayscaleValue');
const blueLightValue = document.getElementById('blueLightValue');
const fileWarning = document.getElementById('fileWarning');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const controls = document.querySelector('.controls');
let currentDomain = null;

function getApplyToAllSites(allData) {
  return typeof allData.applyToAllSites === 'boolean' ? allData.applyToAllSites : false;
}

function getGlobalSettings(allData) {
  return {
    darkMode: typeof allData.darkMode === 'boolean' ? allData.darkMode : DEFAULTS.darkMode,
    brightness: typeof allData.brightness === 'number' ? allData.brightness : DEFAULTS.brightness,
    contrast: typeof allData.contrast === 'number' ? allData.contrast : DEFAULTS.contrast,
    grayscale: typeof allData.grayscale === 'number' ? allData.grayscale : DEFAULTS.grayscale,
    blueLight: typeof allData.blueLight === 'number' ? allData.blueLight : DEFAULTS.blueLight,
  };
}

function updateSliderVisual(sliderEl) {
  const min = Number(sliderEl.min);
  const max = Number(sliderEl.max);
  const value = Number(sliderEl.value);
  const range = max - min;
  const pct = range > 0 ? ((value - min) / range) * 100 : 0;
  sliderEl.style.setProperty('--pct', pct + '%');
  
  const row = sliderEl.closest('.control-row');
  if (row) {
    row.style.setProperty('--pct-val', pct);
  }
}

function updateToggleVisual() {
  const row = darkModeToggle.closest('.control-row');
  if (row) {
    row.style.setProperty('--pct-val', darkModeToggle.checked ? 100 : 0);
  }
}

function updateAllSliderVisuals() {
  updateSliderVisual(brightnessSlider);
  updateSliderVisual(contrastSlider);
  updateSliderVisual(grayscaleSlider);
  updateSliderVisual(blueLightSlider);
  updateToggleVisual();
}

function getSettings() {
  return {
    darkMode: darkModeToggle.checked,
    brightness: parseInt(brightnessSlider.value, 10),
    contrast: parseInt(contrastSlider.value, 10),
    grayscale: parseInt(grayscaleSlider.value, 10),
    blueLight: parseInt(blueLightSlider.value, 10),
  };
}

function applySettingsToUI(settings) {
  darkModeToggle.checked = settings.darkMode;
  brightnessSlider.value = settings.brightness;
  contrastSlider.value = settings.contrast;
  grayscaleSlider.value = settings.grayscale;
  blueLightSlider.value = settings.blueLight;

  // This part updates the actual text next to the sliders!
  document.getElementById('brightnessValue').textContent = settings.brightness + '%';
  document.getElementById('contrastValue').textContent = settings.contrast + '%';
  document.getElementById('grayscaleValue').textContent = settings.grayscale + '%';
  document.getElementById('blueLightValue').textContent = settings.blueLight + '%';

  updateAllSliderVisuals();
}

function sendToActiveTab(settings) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs && tabs[0] && tabs[0].id != null) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'UPDATE_FILTERS', settings }, function () {
        // Ignore errors if the content script is not loaded on this tab
        void chrome.runtime.lastError;
      });
    }
  });
}

// 1. Unified function to pull the correct data
async function loadSettingsForCurrentSite() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab || !tab.url) return;

  let domain = '';
  try {
    domain = new URL(tab.url).hostname;
  } catch (error) {
    currentDomain = null;
    return;
  }

  currentDomain = domain;

  chrome.storage.local.get(null, (allData) => {
    const applyToAllSites = getApplyToAllSites(allData);
    const globalSettings = getGlobalSettings(allData);
    const siteSettings = allData[domain];
    const mergedSettings = siteSettings ? { ...globalSettings, ...siteSettings } : { ...globalSettings };
    const settingsToUse = applyToAllSites ? globalSettings : mergedSettings;

    if (applyAllToggle) {
      applyAllToggle.checked = applyToAllSites;
    }

    applySettingsToUI(settingsToUse);
    console.log(`Loaded settings for ${domain}:`, settingsToUse);
  });
}

// 2. Update the save function to use the same logic
async function onSettingsChange() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return;
  const domain = new URL(tab.url).hostname;
  const settings = getSettings();

  chrome.storage.local.get(null, (allData) => {
    const applyToAllSites = getApplyToAllSites(allData);

    if (applyToAllSites) {
      chrome.storage.local.set({ applyToAllSites: true, ...settings });
    } else {
      allData[domain] = settings;
      chrome.storage.local.set(allData);
    }

    sendToActiveTab(settings);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  loadSettingsForCurrentSite();
  updateFileAccessWarning();
});

function updateFileAccessWarning() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs && tabs[0];
    const isLocalFile = !!(activeTab && typeof activeTab.url === 'string' && activeTab.url.startsWith('file:///'));

    if (!isLocalFile) {
      if (fileWarning) {
        fileWarning.style.display = 'none';
      }
      if (controls) {
        controls.style.opacity = '';
        controls.style.pointerEvents = '';
      }
      return;
    }

    chrome.extension.isAllowedFileSchemeAccess(function (isAllowed) {
      if (!fileWarning || !controls) {
        return;
      }

      if (isAllowed) {
        fileWarning.style.display = 'none';
        controls.style.opacity = '';
        controls.style.pointerEvents = '';
      } else {
        fileWarning.style.display = 'block';
        controls.style.opacity = '0.3';
        controls.style.pointerEvents = 'none';
      }
    });
  });
}

// Attach event listeners
darkModeToggle.addEventListener('change', function() {
  updateToggleVisual();
  onSettingsChange();
});

if (applyAllToggle) {
  applyAllToggle.addEventListener('change', function () {
    const useAllSites = applyAllToggle.checked;
    const settings = getSettings();
    const update = { applyToAllSites: useAllSites };

    if (!useAllSites && currentDomain) {
      update[currentDomain] = settings;
    }

    chrome.storage.local.set(useAllSites ? { ...update, ...settings } : update);
    sendToActiveTab(settings);
  });
}

brightnessSlider.addEventListener('input', function () {
  updateSliderVisual(brightnessSlider);
  brightnessValue.textContent = brightnessSlider.value + '%';
  onSettingsChange();
});

contrastSlider.addEventListener('input', function () {
  updateSliderVisual(contrastSlider);
  contrastValue.textContent = contrastSlider.value + '%';
  onSettingsChange();
});

grayscaleSlider.addEventListener('input', function () {
  updateSliderVisual(grayscaleSlider);
  grayscaleValue.textContent = grayscaleSlider.value + '%';
  onSettingsChange();
});

blueLightSlider.addEventListener('input', function () {
  updateSliderVisual(blueLightSlider);
  blueLightValue.textContent = blueLightSlider.value + '%';
  onSettingsChange();
});

// Add this click listener for the reset button
resetButton.addEventListener('click', function () {
  // 1. Move all the UI sliders and toggles back to default values
  applySettingsToUI(DEFAULTS);
  // 2. Save the defaults to storage and instantly update the active PDF
  onSettingsChange();
});


// Listen for changes made in the background (like keyboard shortcuts)
chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace !== 'local') {
    return;
  }

  const keys = ['applyToAllSites', 'darkMode', 'brightness', 'contrast', 'grayscale', 'blueLight'];
  const hasRelevantChange = keys.some((key) => Object.prototype.hasOwnProperty.call(changes, key));

  if (hasRelevantChange || (currentDomain && changes[currentDomain])) {
    loadSettingsForCurrentSite();
  }
});

// Help the user find the settings page
if (openSettingsBtn) {
  openSettingsBtn.addEventListener('click', function () {
    chrome.tabs.create({ url: 'chrome://extensions/?id=' + chrome.runtime.id });
  });
}