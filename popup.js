document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('networkLogs', (data) => {
    const logs = data.networkLogs || [];
    const container = document.getElementById('logs');
    container.innerHTML = '';

    logs.slice(-50).reverse().forEach((log, index) => {
      const entry = document.createElement('div');
      entry.className = 'log-entry';
      entry.innerHTML = `
        <strong>${index + 1}. ${log.method}</strong> <code>${log.url}</code><br>
        <strong>Status:</strong> ${log.status} <br>
        <details>
          <summary>Request Body</summary>
          <pre>${log.requestBody || '(empty)'}</pre>
        </details>
        <details>
          <summary>Response Body</summary>
          <pre>${log.responseBody}</pre>
        </details>
        <hr>
      `;
      container.appendChild(entry);
    });

    if (logs.length === 0) {
      container.innerHTML = '<p>No fetch requests captured yet.</p>';
    }
  });
});
