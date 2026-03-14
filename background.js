// background.js

chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-dark-mode') {
    // 1. Get the current settings from storage
    chrome.storage.local.get({
      darkMode: false,
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      blueLight: 0,
    }, (settings) => {
      
      // 2. Flip the darkMode boolean
      settings.darkMode = !settings.darkMode;

      // 3. Save the new state back to storage
      chrome.storage.local.set(settings, () => {
        
        // 4. Send the updated settings to the active tab (if it's a PDF)
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { 
              type: 'UPDATE_FILTERS', 
              settings: settings 
            }).catch(() => {
              // Catch errors silently if the active tab isn't a PDF
            });
          }
        });
      });
    });
  }
});