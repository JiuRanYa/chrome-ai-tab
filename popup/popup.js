document.getElementById('clearHistory').addEventListener('click', function() {
  chrome.storage.local.set({ inputHistory: [] }, function() {
    alert('历史记录已清除！');
  });
}); 