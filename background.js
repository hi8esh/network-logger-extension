chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'logFetch') {
    chrome.storage.local.get('networkLogs', (data) => {
      const logs = data.networkLogs || [];
      logs.push(msg.data);
      chrome.storage.local.set({ networkLogs: logs });
    });
  }
});
