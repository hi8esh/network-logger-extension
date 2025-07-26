(function () {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const requestInfo = args[0];
    const requestInit = args[1] || {};
    const method = requestInit.method || 'GET';
    const requestBody = requestInit.body || null;

    const response = await originalFetch(...args);
    const cloned = response.clone();

    cloned.text().then(responseBody => {
      const log = {
        url: typeof requestInfo === 'string' ? requestInfo : requestInfo.url,
        method,
        requestBody,
        responseBody,
        status: response.status,
        timeStamp: Date.now(),
        from: 'fetch'
      };

      chrome.runtime.sendMessage({ type: 'logFetchBody', data: log });
    });

    return response;
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._logData = { method, url };
    return originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    const xhr = this;

    xhr.addEventListener('load', function () {
      const log = {
        url: xhr._logData.url,
        method: xhr._logData.method,
        status: xhr.status,
        requestBody: body,
        responseBody: xhr.responseText,
        timeStamp: Date.now(),
        from: 'xhr'
      };

      chrome.runtime.sendMessage({ type: 'logFetchBody', data: log });
    });

    return originalSend.apply(this, arguments);
  };
})();
