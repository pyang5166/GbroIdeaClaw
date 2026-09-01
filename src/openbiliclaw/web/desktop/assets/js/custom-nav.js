// 狗哥自定义：侧边栏「灵感入口」分组 + 应用内爆款雷达分页（非上游文件）。
// 上游更新覆盖 index.html 后，把 <script src="/web/assets/js/custom-nav.js" defer></script> 那行加回即可。
(function () {
  'use strict';

  var MAIN_PAGE_IDS = ['homePage', 'contentLibraryPage', 'profilePage', 'chatPage', 'settingsPage'];
  var AIHOT_URL = 'https://aihot.virxact.com/';

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

  function buildRadarSection() {
    var home = document.getElementById('homePage');
    if (!home || !home.parentElement) return null;
    var sec = document.createElement('section');
    sec.className = 'content-page';
    sec.id = 'radarPage';
    sec.setAttribute('hidden', '');
    sec.setAttribute('aria-label', '爆款雷达');
    var iframe = document.createElement('iframe');
    iframe.src = '/web/assets/radar/';
    iframe.title = '爆款雷达';
    iframe.style.cssText = 'width:100%;height:calc(100vh - 110px);border:0;display:block;background:#f6f3ea;border-radius:14px;';
    sec.appendChild(iframe);
    home.parentElement.insertBefore(sec, home.nextSibling);
    return sec;
  }

  function inject() {
    var nav = document.querySelector('nav.side-drawer-nav');
    if (!nav || nav.querySelector('[data-custom-nav]')) return;

    var radarSec = buildRadarSection();

    var divider = document.createElement('div');
    divider.setAttribute('data-custom-nav', '1');
    divider.style.cssText = 'border-top:1px solid rgba(0,0,0,.08);margin:10px 12px 6px;';
    var label = document.createElement('div');
    label.textContent = '灵感入口';
    label.style.cssText = 'font-size:11px;color:#9a9588;padding:0 16px 4px;letter-spacing:1px;';

    function showRadar() {
      if (!radarSec) radarSec = buildRadarSection();
      if (!radarSec) return;
      MAIN_PAGE_IDS.forEach(function (id) {
        var page = document.getElementById(id);
        if (page) page.setAttribute('hidden', '');
      });
      radarSec.removeAttribute('hidden');
      document.body.classList.add('content-page-open');
      document.body.classList.remove('profile-page-open', 'chat-page-open');
    }

    function hideRadar() {
      if (radarSec && !radarSec.hasAttribute('hidden')) radarSec.setAttribute('hidden', '');
    }

    nav.appendChild(divider);
    nav.appendChild(label);
    nav.appendChild(makeBtn('📡', '爆款雷达', showRadar));
    nav.appendChild(makeBtn('🔭', 'AI热点', function () {
      window.open(AIHOT_URL, '_blank', 'noopener');
    }));

    // 应用内部任何路径切回原生页面（含搜索、聊聊口味角标等非导航入口）时收起雷达：
    // 观察 5 个原生 section 的 hidden 属性，任何一个变可见就说明 app 在展示自己的页面。
    var observer = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (!t.hasAttribute('hidden')) { hideRadar(); return; }
      }
    });
    MAIN_PAGE_IDS.forEach(function (id) {
      var page = document.getElementById(id);
      if (page) observer.observe(page, { attributes: true, attributeFilter: ['hidden'] });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
