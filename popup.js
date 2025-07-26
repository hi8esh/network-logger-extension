let allLogs = [];

function renderLogs(logs) {
  const container = document.getElementById('logs');
  container.innerHTML = '';

  if (logs.length === 0) {
    container.innerHTML = '<p>No matching logs found.</p>';
    return;
  }

  logs.slice(-100).reverse().forEach((log, index) => {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <strong>${index + 1}. ${log.method}</strong> <code>${log.url}</code><br>
      <strong>Status:</strong> ${log.status} | Source: ${log.from}<br>
      <details>
        <summary>Request Body</summary>
        <pre>${log.requestBody || '(empty)'}</pre>
      </details>
      <details>
        <summary>Response Body</summary>
        <pre>${log.responseBody || '(not captured)'}</pre>
      </details>
      <hr>
    `;
    container.appendChild(entry);
  });
}

function renderTimeline(logs) {
  const container = document.getElementById('timelineContainer');
  container.innerHTML = '';

  if (!logs.length) {
    container.textContent = 'No logs to display.';
    return;
  }

  const baseTime = logs[0].timeStamp || Date.now();
  const maxTime = Math.max(...logs.map(l => l.timeStamp || Date.now()));
  const totalSpan = maxTime - baseTime || 1;

  logs.forEach(log => {
    const relativeStart = ((log.timeStamp || Date.now()) - baseTime) / totalSpan * 100;

    const wrapper = document.createElement('div');
    wrapper.className = 'timeline-wrapper';

    const bar = document.createElement('div');
    bar.className = 'timeline-bar';
    bar.style.left = `${relativeStart}%`;
    bar.style.width = `25%`; // simulate width; you can vary this if you want
    bar.setAttribute('data-label', `${log.method} ${new URL(log.url).pathname}`);

    wrapper.appendChild(bar);
    container.appendChild(wrapper);
  });
}


function applyFilters() {
  const method = document.getElementById('filterMethod').value;
  const url = document.getElementById('filterUrl').value.toLowerCase();
  const status = document.getElementById('filterStatus').value;

  const filtered = allLogs.filter(log => {
    return (!method || log.method === method) &&
           (!url || log.url.toLowerCase().includes(url)) &&
           (!status || String(log.status) === status);
  });

  renderLogs(filtered);
  renderTimeline(filtered);
}

function convertToHAR(logs) {
  return {
    log: {
      version: '1.2',
      creator: {
        name: 'Network Logger Extension',
        version: '1.0'
      },
      entries: logs.map(log => {
        const startedDateTime = new Date(log.timeStamp || Date.now()).toISOString();
        return {
          startedDateTime,
          time: 0,
          request: {
            method: log.method,
            url: log.url,
            httpVersion: "HTTP/1.1",
            headers: [],
            queryString: [],
            postData: log.requestBody
              ? {
                  mimeType: "application/json",
                  text: typeof log.requestBody === 'string'
                    ? log.requestBody
                    : JSON.stringify(log.requestBody)
                }
              : undefined,
            headersSize: -1,
            bodySize: -1
          },
          response: {
            status: log.status,
            statusText: '',
            httpVersion: "HTTP/1.1",
            headers: [],
            content: {
              size: log.responseBody?.length || 0,
              mimeType: "application/json",
              text: log.responseBody || ''
            },
            redirectURL: "",
            headersSize: -1,
            bodySize: -1
          },
          timings: {
            send: 0,
            wait: 0,
            receive: 0
          }
        };
      })
    }
  };
}

function exportHAR(logs) {
  const har = convertToHAR(logs);
  const blob = new Blob([JSON.stringify(har, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'network-log.har';
  a.click();
  URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('networkLogs', (data) => {
    allLogs = data.networkLogs || [];
    renderLogs(allLogs);
    renderTimeline(allLogs);
  });

  document.getElementById('filterUrl').addEventListener('input', applyFilters);
  document.getElementById('filterMethod').addEventListener('change', applyFilters);
  document.getElementById('filterStatus').addEventListener('input', applyFilters);

  document.getElementById('clearBtn').addEventListener('click', () => {
    chrome.storage.local.set({ networkLogs: [] }, () => {
      allLogs = [];
      renderLogs(allLogs);
      renderTimeline(allLogs);
    });
  });

  document.getElementById('harExportBtn').addEventListener('click', () => {
    exportHAR(allLogs);
  });
});
