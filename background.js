chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-dark-mode') {
    
    // 1. Find out what tab we are currently looking at
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0] || !tabs[0].url) return;

      const activeTab = tabs[0];

      // 2. Check if it's a local file
      if (activeTab.url.startsWith('file://')) {
        chrome.extension.isAllowedFileSchemeAccess((isAllowed) => {
          if (!isAllowed) {
            return; // File access is blocked; skip toggling
          }

          if (activeTab.id != null) {
            executeToggle(activeTab);
          }
        });
      } else {
        // If it's a normal website, proceed to toggle
          if (activeTab.id != null) {
            executeToggle(activeTab);
          }
      }
    });
  }
});

// Helper function to handle the actual toggling logic
  function executeToggle(activeTab) {
    const tabId = activeTab.id;
    let domain = null;

    try {
      domain = new URL(activeTab.url).hostname || null;
    } catch (error) {
      domain = null;
    }

    chrome.storage.local.get(null, (allData) => {
      const applyToAllSites = typeof allData.applyToAllSites === 'boolean' ? allData.applyToAllSites : false;
      const globalSettings = {
        darkMode: typeof allData.darkMode === 'boolean' ? allData.darkMode : false,
        brightness: typeof allData.brightness === 'number' ? allData.brightness : 100,
        contrast: typeof allData.contrast === 'number' ? allData.contrast : 100,
        grayscale: typeof allData.grayscale === 'number' ? allData.grayscale : 0,
        blueLight: typeof allData.blueLight === 'number' ? allData.blueLight : 0,
      };

      let updatedSettings = null;
      let storageUpdate = null;

      if (applyToAllSites) {
        updatedSettings = { ...globalSettings, darkMode: !globalSettings.darkMode };
        storageUpdate = { applyToAllSites: true, ...updatedSettings };
      } else {
        const siteSettings = domain !== null ? allData[domain] : null;
        const mergedSettings = siteSettings ? { ...globalSettings, ...siteSettings } : { ...globalSettings };
        updatedSettings = { ...mergedSettings, darkMode: !mergedSettings.darkMode };
        storageUpdate = domain !== null
          ? { [domain]: updatedSettings }
          : { ...updatedSettings };
      }

      chrome.storage.local.set(storageUpdate, () => {
        chrome.tabs.sendMessage(tabId, {
          type: 'UPDATE_FILTERS',
          settings: updatedSettings
        }).catch(() => {
          // Silently catch errors if the tab cannot receive messages
        });
      });
    });
}