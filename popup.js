async function getCurrentTab() {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    return tab;
}

(async () => {
if ((await getCurrentTab()).url.startsWith("https://dashcraft.io/")) {
    document.getElementById("main").hidden = false;
} else {
    document.getElementById("wrongpage").hidden = false;
}})();