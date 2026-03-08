/**
 * Foclóir — Irish-English Dictionary Widget
 * Drop this script onto any page to add a floating Irish dictionary button.
 *
 * Usage:
 *   <script src="https://focloir.vercel.app/widget.js" defer></script>
 *
 * Options (via data attributes on the script tag):
 *   data-position="bottom-right"   (default) | "bottom-left"
 *   data-color="#16a34a"           Button background (default: shamrock green)
 *   data-category="greetings"      Pre-select a category
 *
 * MIT License · https://github.com/m4cd4r4/irish-dictionary-app
 */
(function () {
  'use strict';

  const BASE_URL = 'https://focloir.vercel.app';

  // Read config from the script tag itself
  const script = document.currentScript || document.querySelector('script[src*="widget.js"]');
  const position  = (script && script.dataset.position)  || 'bottom-right';
  const color     = (script && script.dataset.color)     || '#16a34a';
  const category  = (script && script.dataset.category)  || '';

  // ── Build embed URL ──────────────────────────────────────────────────
  const embedUrl = category
    ? BASE_URL + '/embed?category=' + encodeURIComponent(category)
    : BASE_URL + '/embed';

  // ── Styles ───────────────────────────────────────────────────────────
  const css = `
    #focloír-widget-btn {
      position: fixed;
      ${position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
      bottom: 20px;
      z-index: 2147483640;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: ${color};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.35), 0 0 0 0 ${color}66;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      animation: focloírPulse 3s ease-in-out infinite;
      line-height: 1;
    }
    #focloír-widget-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 24px rgba(0,0,0,0.45), 0 0 0 6px ${color}22;
    }
    #focloír-widget-panel {
      position: fixed;
      ${position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
      bottom: 84px;
      z-index: 2147483639;
      width: 380px;
      max-width: calc(100vw - 40px);
      height: 580px;
      max-height: calc(100vh - 100px);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);
      display: none;
      opacity: 0;
      transform: translateY(12px) scale(0.97);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    #focloír-widget-panel.focloír-open {
      display: block;
    }
    #focloír-widget-panel.focloír-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    #focloír-widget-iframe {
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 16px;
      display: block;
    }
    #focloír-widget-close {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 2147483641;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.8);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      line-height: 1;
      transition: background 0.15s;
    }
    #focloír-widget-close:hover {
      background: rgba(0,0,0,0.75);
      color: #fff;
    }
    @keyframes focloírPulse {
      0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.35), 0 0 0 0 ${color}66; }
      50%       { box-shadow: 0 4px 20px rgba(0,0,0,0.35), 0 0 0 8px ${color}00; }
    }
    @media (max-width: 420px) {
      #focloír-widget-panel {
        left: 10px !important;
        right: 10px !important;
        width: auto;
        max-width: none;
        bottom: 76px;
      }
    }
  `;

  // ── Inject styles ─────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── Build DOM ─────────────────────────────────────────────────────────
  const btn = document.createElement('button');
  btn.id = 'focloír-widget-btn';
  btn.setAttribute('aria-label', 'Open Irish Dictionary');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('title', 'Foclóir — Irish-English Dictionary');
  btn.textContent = '🍀';

  const panel = document.createElement('div');
  panel.id = 'focloír-widget-panel';
  panel.setAttribute('aria-label', 'Irish-English Dictionary');
  panel.setAttribute('role', 'dialog');

  const closeBtn = document.createElement('button');
  closeBtn.id = 'focloír-widget-close';
  closeBtn.setAttribute('aria-label', 'Close dictionary');
  closeBtn.textContent = '✕';

  const iframe = document.createElement('iframe');
  iframe.id = 'focloír-widget-iframe';
  iframe.title = 'Irish-English Dictionary';
  iframe.setAttribute('loading', 'lazy');
  // Don't set src until first open (lazy load)

  panel.appendChild(closeBtn);
  panel.appendChild(iframe);

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  // ── State ─────────────────────────────────────────────────────────────
  let isOpen = false;
  let iframeLoaded = false;

  function openPanel() {
    isOpen = true;
    btn.setAttribute('aria-expanded', 'true');
    btn.textContent = '✕';
    btn.style.fontSize = '18px';

    if (!iframeLoaded) {
      iframe.src = embedUrl;
      iframeLoaded = true;
    }

    panel.classList.add('focloír-open');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => panel.classList.add('focloír-visible'));
    });
  }

  function closePanel() {
    isOpen = false;
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = '🍀';
    btn.style.fontSize = '24px';

    panel.classList.remove('focloír-visible');
    setTimeout(() => panel.classList.remove('focloír-open'), 200);
  }

  btn.addEventListener('click', () => (isOpen ? closePanel() : openPanel()));
  closeBtn.addEventListener('click', closePanel);

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  // Close when clicking outside
  document.addEventListener('click', e => {
    if (isOpen && !panel.contains(e.target) && e.target !== btn) closePanel();
  });
})();
