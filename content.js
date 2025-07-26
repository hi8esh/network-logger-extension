(function () {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const requestInfo = args[0];
    const requestInit = args[1] || {};
    const method = requestInit.method || 'GET';
    const requestBody = requestInit.body || null;

    const response = await originalFetch(...args);
    const cloned = response.clone();

    cloned.text().then(bodyText => {
      const log = {
        url: requestInfo,
        method: method,
        requestBody: requestBody,
        responseBody: bodyText,
        status: response.status
      };

      chrome.runtime.sendMessage({ type: 'logFetch', data: log });
    });

    return response;
  };
})();
