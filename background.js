chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        document.dispatchEvent(new CustomEvent('getJSON', { detail: request }));
    }
);
