// 狗哥自定义：侧边栏「灵感入口」分组（非上游文件）。
// 上游更新覆盖 index.html 后，把 <script src="/web/assets/js/custom-nav.js" defer></script> 那行加回即可。
(function () {
  'use strict';

  function makeBtn(emoji, label, onClick) {
    var btn = document.createElement('button');
    btn.className = 'nav-action';
    btn.type = 'button';
    var glyph = document.createElement('span');
    glyph.className = 'nav-glyph';
    glyph.textContent = emoji;
    var text = document.createElement('span');
    text.textContent = label;
    btn.appendChild(glyph);
    btn.appendChild(text);
    btn.addEventListener('click', onClick);
    return btn;
  }

  function inject() {
    var nav = document.querySelector('nav.side-drawer-nav');
    if (!nav || nav.querySelector('[data-custom-nav]')) return;

    var divider = document.createElement('div');
    divider.setAttribute('data-custom-nav', '1');
    divider.style.cssText = 'border-top:1px solid rgba(0,0,0,.08);margin:10px 12px 6px;';
    var label = document.createElement('div');
    label.textContent = '灵感入口';
    label.style.cssText = 'font-size:11px;color:#9a9588;padding:0 16px 4px;letter-spacing:1px;';

    nav.appendChild(divider);
    nav.appendChild(label);
    nav.appendChild(makeBtn('📡', '爆款雷达', function () {
      window.location.href = '/web/assets/radar/';
    }));
    nav.appendChild(makeBtn('🔭', 'AI热点', function () {
      window.open('https://watcha.cn/products/aihot', '_blank', 'noopener');
    }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
