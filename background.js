let metadataLogs = [];

chrome.webRequest.onCompleted.addListener(
  (details) => {
    const log = {
      url: details.url,
      method: details.method,
      status: details.statusCode,
      timeStamp: details.timeStamp,
      type: details.type,
      from: 'webRequest'
    };

    metadataLogs.push(log);
    chrome.storage.local.set({ networkLogs: metadataLogs });
  },
  { urls: ["<all_urls>"] },
  []
);

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'logFetchBody') {
    chrome.storage.local.get('networkLogs', (data) => {
      const logs = data.networkLogs || [];
      logs.push(msg.data);
      metadataLogs = logs;
      chrome.storage.local.set({ networkLogs: logs });
    });
  }
});
