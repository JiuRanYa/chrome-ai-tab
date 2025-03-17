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
    border-radius: 8px;
    padding: 8px 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    max-width: 400px;
    min-width: 300px;
    display: none;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  document.body.appendChild(popper);
  
  // 添加提示文本
  const hint = document.createElement('div');
  hint.style.cssText = `
    padding: 8px 12px;
    color: #666;
    font-size: 12px;
    border-bottom: 1px solid #eee;
    margin-bottom: 4px;
  `;
  hint.innerHTML = '<span style="margin-right: 4px;">⌨️</span> Use arrow keys to navigate';
  popper.appendChild(hint);
  
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
    
    // 显示建议列表
    const suggestions = [
      {
        title: 'Write professional emails',
        description: 'Generate formal business correspondence'
      },
      {
        title: 'Create marketing copy',
        description: 'Craft compelling advertising content'
      },
      {
        title: 'Draft blog posts',
        description: 'Generate engaging article content'
      },
      {
        title: 'Compose social media posts',
        description: 'Create viral-worthy content'
      },
      {
        title: 'Generate product descriptions',
        description: 'Write detailed product features'
      }
    ];
    
    // 更新弹出层内容
    suggestionPopper.innerHTML = `
      <div style="padding: 8px 12px; color: #666; font-size: 12px; border-bottom: 1px solid #eee; margin-bottom: 4px;">
        <span style="margin-right: 4px;">⌨️</span> Use arrow keys to navigate
      </div>
      ${suggestions.map((suggestion, index) => `
        <div class="suggestion-item" style="
          padding: 12px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          ${index === 0 ? 'background: #f0f5ff;' : ''}
        ">
          <div style="flex: 1;">
            <div style="font-size: 14px; margin-bottom: 4px;">${suggestion.title}</div>
            <div style="font-size: 12px; color: #666;">${suggestion.description}</div>
          </div>
          <div style="margin-left: 12px; color: #999;">
            <span style="font-size: 16px;">›</span>
          </div>
        </div>
      `).join('')}
    `;
    
    // 显示弹出层
    suggestionPopper.style.display = 'block';
    positionPopper(currentInput);
    
    // 添加点击和悬停事件
    const items = suggestionPopper.querySelectorAll('.suggestion-item');
    items.forEach(item => {
      item.addEventListener('click', function() {
        currentInput.value = this.querySelector('div > div:first-child').textContent.trim();
        suggestionPopper.style.display = 'none';
      });
      
      item.addEventListener('mouseover', function() {
        items.forEach(i => i.style.background = 'none');
        this.style.background = '#f0f5ff';
      });
      
      item.addEventListener('mouseout', function() {
        if (!this.classList.contains('active')) {
          this.style.background = 'none';
        }
      });
    });
  }
});

// 添加键盘导航
let currentIndex = 0;
document.addEventListener('keydown', function(e) {
  if (suggestionPopper.style.display === 'block') {
    const items = suggestionPopper.querySelectorAll('.suggestion-item');
    
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      items[currentIndex].style.background = 'none';
      
      if (e.key === 'ArrowDown') {
        currentIndex = (currentIndex + 1) % items.length;
      } else {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
      }
      
      items[currentIndex].style.background = '#f0f5ff';
      items[currentIndex].scrollIntoView({ block: 'nearest' });
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      const selectedItem = items[currentIndex];
      currentInput.value = selectedItem.querySelector('div > div:first-child').textContent.trim();
      suggestionPopper.style.display = 'none';
    }
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