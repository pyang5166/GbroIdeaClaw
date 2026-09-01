// 狗哥自定义：侧边栏「灵感入口」分组 + 应用内自定义分支页（非上游文件）。
// 每个分支 = 一个 iframe section（同源本地页面），与原生 5 页互斥切换。
// 上游更新覆盖 index.html 后，把 <script src="/web/assets/js/custom-nav.js" defer></script> 那行加回即可。
(function () {
  'use strict';

  var MAIN_PAGE_IDS = ['homePage', 'contentLibraryPage', 'profilePage', 'chatPage', 'settingsPage'];
  var BRANCHES = [
    { emoji: '📡', label: '爆款雷达', id: 'radarPage', src: '/web/assets/radar/' },
    { emoji: '🔭', label: 'AI热点', id: 'aihotPage', src: '/web/assets/aihot/' }
  ];

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

  function buildSection(branch) {
    var home = document.getElementById('homePage');
    if (!home || !home.parentElement) return null;
    var sec = document.createElement('section');
    sec.className = 'content-page';
    sec.id = branch.id;
    sec.setAttribute('hidden', '');
    sec.setAttribute('aria-label', branch.label);
    sec.setAttribute('data-custom-branch', '1');
    var iframe = document.createElement('iframe');
    iframe.title = branch.label;
    iframe.setAttribute('data-src', branch.src); // 懒加载：首次打开才装载
    iframe.style.cssText = 'width:100%;height:calc(100vh - 110px);border:0;display:block;background:#f6f3ea;border-radius:14px;';
    sec.appendChild(iframe);
    home.parentElement.insertBefore(sec, home.nextSibling);
    return sec;
  }

  function inject() {
    var nav = document.querySelector('nav.side-drawer-nav');
    if (!nav || nav.querySelector('[data-custom-nav]')) return;

    var sections = {};
    BRANCHES.forEach(function (b) { sections[b.id] = buildSection(b); });

    function hideAllBranches() {
      Object.keys(sections).forEach(function (id) {
        var sec = sections[id];
        if (sec && !sec.hasAttribute('hidden')) sec.setAttribute('hidden', '');
      });
    }

    function showBranch(branch) {
      var sec = sections[branch.id] || (sections[branch.id] = buildSection(branch));
      if (!sec) return;
      var iframe = sec.querySelector('iframe');
      if (iframe && !iframe.src) iframe.src = iframe.getAttribute('data-src');
      MAIN_PAGE_IDS.forEach(function (id) {
        var page = document.getElementById(id);
        if (page) page.setAttribute('hidden', '');
      });
      hideAllBranches();
      sec.removeAttribute('hidden');
      document.body.classList.add('content-page-open');
      document.body.classList.remove('profile-page-open', 'chat-page-open');
    }

    var divider = document.createElement('div');
    divider.setAttribute('data-custom-nav', '1');
    divider.style.cssText = 'border-top:1px solid rgba(0,0,0,.08);margin:10px 12px 6px;';
    var label = document.createElement('div');
    label.textContent = '灵感入口';
    label.style.cssText = 'font-size:11px;color:#9a9588;padding:0 16px 4px;letter-spacing:1px;';
    nav.appendChild(divider);
    nav.appendChild(label);
    BRANCHES.forEach(function (b) {
      nav.appendChild(makeBtn(b.emoji, b.label, function () { showBranch(b); }));
    });

    // 应用内部任何路径切回原生页面（搜索、角标跳转等）时收起所有自定义分支：
    // 观察原生 5 页的 hidden 属性，任何一页变可见即收起。
    var observer = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        if (!muts[i].target.hasAttribute('hidden')) { hideAllBranches(); return; }
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
