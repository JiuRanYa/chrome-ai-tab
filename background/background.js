// 初始化存储
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ inputHistory: [] });
}); 