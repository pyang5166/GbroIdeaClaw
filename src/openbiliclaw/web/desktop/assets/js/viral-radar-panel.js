// 狗哥自定义：每日爆款雷达固定栏目（非上游文件）。
// 数据由 ~/bin/gbro-viral-radar-daily.sh 每天写入 /web/assets/radar/latest.json。
// index.html 里只有一行 <script> 引用本文件；上游更新覆盖 index.html 后把那行加回即可。
(function () {
  'use strict';

  var PANEL_ID = 'viral-radar-panel';
  var COLLAPSE_KEY = 'viralRadarCollapsed';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function injectStyles() {
    var css = [
      '#' + PANEL_ID + '{position:fixed;top:64px;right:0;width:372px;max-height:calc(100vh - 88px);z-index:9000;',
      'background:rgba(24,26,32,.96);color:#e8e8ec;border-radius:12px 0 0 12px;box-shadow:-4px 4px 24px rgba(0,0,0,.35);',
      'font-size:13px;line-height:1.45;display:flex;flex-direction:column;transition:transform .25s ease;}',
      '#' + PANEL_ID + '.vr-collapsed{transform:translateX(372px);}',
      '#' + PANEL_ID + ' .vr-toggle{position:absolute;left:-34px;top:12px;width:34px;height:88px;cursor:pointer;',
      'background:rgba(24,26,32,.96);border-radius:8px 0 0 8px;display:flex;align-items:center;justify-content:center;',
      'writing-mode:vertical-rl;letter-spacing:2px;font-size:12px;color:#ffd166;user-select:none;}',
      '#' + PANEL_ID + ' .vr-head{padding:12px 14px 8px;font-weight:700;font-size:14px;display:flex;justify-content:space-between;align-items:baseline;}',
      '#' + PANEL_ID + ' .vr-date{font-weight:400;font-size:11px;color:#9aa0aa;}',
      '#' + PANEL_ID + ' .vr-tabs{display:flex;gap:4px;padding:0 12px 8px;flex-wrap:wrap;}',
      '#' + PANEL_ID + ' .vr-tab{padding:3px 10px;border-radius:99px;background:#2c2f38;cursor:pointer;color:#c6cad2;font-size:12px;}',
      '#' + PANEL_ID + ' .vr-tab.vr-active{background:#ffd166;color:#1a1c22;font-weight:600;}',
      '#' + PANEL_ID + ' .vr-body{overflow-y:auto;padding:0 12px 12px;flex:1;}',
      '#' + PANEL_ID + ' .vr-item{padding:8px 10px;margin-bottom:6px;background:#22242c;border-radius:8px;display:block;color:inherit;text-decoration:none;}',
      '#' + PANEL_ID + ' .vr-item:hover{background:#2b2e38;}',
      '#' + PANEL_ID + ' .vr-title{color:#f2f3f5;margin-bottom:3px;}',
      '#' + PANEL_ID + ' .vr-meta{color:#9aa0aa;font-size:11px;display:flex;gap:8px;flex-wrap:wrap;}',
      '#' + PANEL_ID + ' .vr-metric{color:#ffd166;font-weight:600;}',
      '#' + PANEL_ID + ' .vr-obs{margin-top:8px;padding:8px 10px;background:#1e2743;border-radius:8px;color:#c9d4f5;font-size:12px;}',
      '#' + PANEL_ID + ' .vr-empty{padding:16px;color:#9aa0aa;text-align:center;}'
    ].join('');
    var s = el('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  function render(data) {
    injectStyles();
    var panel = el('div');
    panel.id = PANEL_ID;
    if (localStorage.getItem(COLLAPSE_KEY) === '1') panel.classList.add('vr-collapsed');

    var toggle = el('div', 'vr-toggle', '📡 爆款雷达');
    toggle.onclick = function () {
      var c = panel.classList.toggle('vr-collapsed');
      localStorage.setItem(COLLAPSE_KEY, c ? '1' : '0');
    };
    panel.appendChild(toggle);

    var head = el('div', 'vr-head');
    head.appendChild(el('span', null, '📡 今日爆款雷达'));
    head.appendChild(el('span', 'vr-date', data.date || ''));
    panel.appendChild(head);

    var tabs = el('div', 'vr-tabs');
    var body = el('div', 'vr-body');
    panel.appendChild(tabs);
    panel.appendChild(body);

    var platforms = (data.platforms || []).filter(function (p) { return p.items && p.items.length; });
    if (!platforms.length) {
      body.appendChild(el('div', 'vr-empty', '今日雷达数据未生成（每天 08:00 自动扫描）'));
    }

    function showPlatform(idx) {
      body.innerHTML = '';
      Array.prototype.forEach.call(tabs.children, function (t, i) {
        t.classList.toggle('vr-active', i === idx);
      });
      var p = platforms[idx];
      if (!p) return;
      p.items.forEach(function (it, i) {
        var a = el('a', 'vr-item');
        if (it.url) { a.href = it.url; a.target = '_blank'; a.rel = 'noopener'; }
        a.appendChild(el('div', 'vr-title', (i + 1) + '. ' + (it.title || '')));
        var meta = el('div', 'vr-meta');
        if (it.metric) meta.appendChild(el('span', 'vr-metric', it.metric));
        if (it.account) meta.appendChild(el('span', null, it.account));
        if (it.duration && it.duration !== '—') meta.appendChild(el('span', null, it.duration));
        if (it.date) meta.appendChild(el('span', null, it.date));
        a.appendChild(meta);
        body.appendChild(a);
      });
      (data.observations || []).forEach(function (o) {
        body.appendChild(el('div', 'vr-obs', '💡 ' + o));
      });
    }

    platforms.forEach(function (p, i) {
      var t = el('div', 'vr-tab', p.name);
      t.onclick = function () { showPlatform(i); };
      tabs.appendChild(t);
    });
    if (platforms.length) showPlatform(0);

    document.body.appendChild(panel);
  }

  function boot() {
    fetch('/web/assets/radar/latest.json?t=' + Date.now())
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(render)
      .catch(function () { /* 数据未生成时静默不渲染 */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
