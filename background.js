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
            // 3. IF BLOCKED: Fire a native system notification!
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon-128.png', // Uses your shiny new icon
              title: 'File Access Required',
              message: 'To use Dark Mode on local files, right-click the extension icon, click "Manage Extension", and enable "Allow access to file URLs".',
              priority: 2
            });
            return; // Stop here, don't try to toggle
          } else {
            // IF ALLOWED: Proceed to toggle
            executeToggle(activeTab.id);
          }
        });
      } else {
        // If it's a normal website, proceed to toggle
        executeToggle(activeTab.id);
      }
    });
  }
});

// Helper function to handle the actual toggling logic
function executeToggle(tabId) {
  chrome.storage.local.get({
    darkMode: false,
    autoEnable: false,
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    blueLight: 0,
  }, (settings) => {
    
    settings.darkMode = !settings.darkMode;

    chrome.storage.local.set(settings, () => {
      chrome.tabs.sendMessage(tabId, { 
        type: 'UPDATE_FILTERS', 
        settings: settings 
      }).catch(() => {
        // Silently catch errors if the tab cannot receive messages
      });
    });
  });
}