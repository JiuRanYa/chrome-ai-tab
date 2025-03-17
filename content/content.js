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

// 创建建议弹出层
function createSuggestionPopper() {
  const popper = document.createElement('div');
  popper.style.cssText = `
    position: fixed;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    max-width: 300px;
    display: none;
    z-index: 10000;
  `;
  document.body.appendChild(popper);
  return popper;
}

// 存储当前输入框和弹出层
let suggestionPopper = createSuggestionPopper();

// 定位弹出层
function positionPopper(target) {
  const rect = target.getBoundingClientRect();
  suggestionPopper.style.top = `${rect.bottom + 5}px`;
  suggestionPopper.style.left = `${rect.left}px`;
}

// 监听键盘事件
document.addEventListener('keydown', function(e) {
  if (e.shiftKey && e.key === 'Tab' && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
    e.preventDefault();
    
    currentInput = e.target;
    const currentValue = currentInput.value;
    
    // 显示建议列表
    const suggestions = [
      '测试文本1',
      '测试文本2',
      '测试文本3',
      // 这里可以根据需要添加更多建议
    ];
    
    // 更新弹出层内容
    suggestionPopper.innerHTML = suggestions.map((suggestion, index) => `
      <div class="suggestion-item" style="
        padding: 4px 8px;
        cursor: pointer;
        ${index === 0 ? 'background: #f0f0f0;' : ''}
        hover: {background: #f0f0f0;}
      ">
        ${suggestion}
      </div>
    `).join('');
    
    // 显示弹出层
    suggestionPopper.style.display = 'block';
    positionPopper(currentInput);
    
    // 添加点击事件
    const items = suggestionPopper.querySelectorAll('.suggestion-item');
    items.forEach(item => {
      item.addEventListener('click', function() {
        currentInput.value = this.textContent.trim();
        suggestionPopper.style.display = 'none';
      });
      
      item.addEventListener('mouseover', function() {
        items.forEach(i => i.style.background = 'none');
        this.style.background = '#f0f0f0';
      });
    });
  }
});

// 点击其他地方关闭弹出层
document.addEventListener('click', function(e) {
  if (!suggestionPopper.contains(e.target) && e.target !== currentInput) {
    suggestionPopper.style.display = 'none';
  }
});

// 监听滚动事件，更新弹出层位置
window.addEventListener('scroll', function() {
  if (currentInput && suggestionPopper.style.display === 'block') {
    positionPopper(currentInput);
  }
});

// ESC键关闭弹出层
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    suggestionPopper.style.display = 'none';
  }
}); 