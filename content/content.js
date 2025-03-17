// 创建一个覆盖层来显示提示文本
function createOverlay(target) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: absolute;
    pointer-events: none;
    background: transparent;
    font-family: ${getComputedStyle(target).fontFamily};
    font-size: ${getComputedStyle(target).fontSize};
    line-height: ${getComputedStyle(target).lineHeight};
    padding: ${getComputedStyle(target).padding};
    white-space: pre-wrap;
    color: #999;
    z-index: 1000;
  `;
  document.body.appendChild(overlay);
  return overlay;
}

// 获取元素的绝对位置
function getAbsolutePosition(element) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX
  };
}

// 存储当前输入框和其对应的覆盖层
let currentInput = null;
let currentOverlay = null;

// 监听输入事件
document.addEventListener('input', function(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    const inputValue = e.target.value;
    
    // 创建或更新覆盖层
    if (currentInput !== e.target) {
      if (currentOverlay) {
        currentOverlay.remove();
      }
      currentInput = e.target;
      currentOverlay = createOverlay(currentInput);
    }

    // 更新覆盖层位置
    const pos = getAbsolutePosition(currentInput);
    currentOverlay.style.top = `${pos.top}px`;
    currentOverlay.style.left = `${pos.left}px`;
    currentOverlay.style.width = `${currentInput.offsetWidth}px`;
    currentOverlay.style.height = `${currentInput.offsetHeight}px`;

    // 显示提示文本
    if (inputValue) {
      chrome.storage.local.get(['inputHistory'], function(result) {
        const history = result.inputHistory || [];
        const suggestions = history.filter(item => 
          item.toLowerCase().startsWith(inputValue.toLowerCase())
        );

          const suggestion = '测试1231312312312312231';
          const completionText = suggestion.slice(inputValue.length);
          currentOverlay.textContent = inputValue + completionText;
          // 高亮显示补全部分
          currentOverlay.innerHTML = `${inputValue}<span style="color: #ccc">${completionText}</span>`;
      });
    } else {
      currentOverlay.textContent = '';
    }
  }
});

// 监听Tab键
document.addEventListener('keydown', function(e) {
  if (e.key === 'Tab' && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
    e.preventDefault();
    
    const currentValue = e.target.value;
    chrome.storage.local.get(['inputHistory'], function(result) {
      const history = result.inputHistory || [];
      const suggestions = history.filter(item => 
        item.toLowerCase().startsWith(currentValue.toLowerCase())
      );
      
      if (suggestions.length > 0) {
        e.target.value = suggestions[0];
        if (currentOverlay) {
          currentOverlay.textContent = '';
        }
      }
    });
  }
});

// // 监听焦点变化
// document.addEventListener('blur', function(e) {
//   if (currentOverlay) {
//     currentOverlay.remove();
//     currentOverlay = null;
//     currentInput = null;
//   }
// }, true);

// 监听滚动事件，更新覆盖层位置
window.addEventListener('scroll', function() {
  if (currentInput && currentOverlay) {
    const pos = getAbsolutePosition(currentInput);
    currentOverlay.style.top = `${pos.top}px`;
    currentOverlay.style.left = `${pos.left}px`;
  }
}); 